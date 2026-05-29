// Cron job: send daily learning reminder emails
// Schedule: 0 9 * * * (9:00 AM UTC daily) — configured in render.yaml / cron-job.org
// Security: expects Authorization: Bearer $CRON_SECRET header
//
// Algorithm:
//   1. Fetch all users with emailReminders=true
//   2. For each user, get their saved learning paths where reminderEnabled=true
//   3. For each path, count watched/total videos via VideoProgress
//   4. Skip fully-completed paths (watchedCount === totalVideos)
//   5. Send a Duolingo-style motivational email via sendDailyReminderEmail

import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getDb } from '@/lib/db';
import { sendDailyReminderEmail, ActiveLearningPath } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Ensure reminderEnabled column exists in Turso (safe no-op if already there)
async function ensureReminderColumn() {
    try {
        const { createClient } = await import('@libsql/client');
        const url = process.env.DATABASE_URL?.trim();
        const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
        if (url && (url.startsWith('libsql://') || authToken)) {
            const client = createClient({ url, authToken });
            await client.execute(
                'ALTER TABLE SavedLearningPath ADD COLUMN reminderEnabled INTEGER DEFAULT 1'
            ).catch(() => { /* already exists */ });
        }
    } catch {
        // Local Prisma dev env
    }
}

export async function GET(request: NextRequest) {
    // ── Authorization ────────────────────────────────────────────────────
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const auth = request.headers.get('authorization') ?? '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        let authorized = false;
        try {
            authorized = token.length > 0 &&
                timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret));
        } catch { authorized = false; }
        if (!authorized) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
    }

    await ensureReminderColumn();

    const db = getDb();

    let users: Awaited<ReturnType<typeof db.user.findMany>>;
    try {
        users = await db.user.findMany();
    } catch (err) {
        console.error('cron/daily-reminders: failed to fetch users', err);
        return NextResponse.json({ success: false, message: 'DB error fetching users' }, { status: 500 });
    }

    const reminderUsers = users.filter((u: { emailReminders: boolean }) => u.emailReminders === true);

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of reminderUsers) {
        try {
            const paths = await db.savedLearningPath.findMany({ where: { userId: user.id } });

            const activePaths: ActiveLearningPath[] = [];

            for (const path of paths) {
                // Skip paths the user has opted out of reminders for
                if (path.reminderEnabled === false) continue;

                const progressRows = await db.videoProgress.findMany({ where: { learningPathId: path.id } });
                const watchedCount = progressRows.filter((p: { watched: boolean }) => p.watched).length;
                const totalVideos = path.totalVideos;

                // Skip fully-completed paths
                if (totalVideos > 0 && watchedCount >= totalVideos) continue;

                activePaths.push({
                    topic: path.topic,
                    totalVideos,
                    watchedCount,
                    estimatedTotalTime: path.estimatedTotalTime,
                });
            }

            const result = await sendDailyReminderEmail(user.email, user.name, activePaths);
            if (result.success) {
                sent++;
            } else {
                errors++;
                console.error(`cron/daily-reminders: failed for ${user.email}:`, result.message);
            }
        } catch (err) {
            errors++;
            console.error(`cron/daily-reminders: error processing user ${user.id}:`, err);
        }
    }

    console.log(`cron/daily-reminders: sent=${sent} skipped=${skipped} errors=${errors} eligible=${reminderUsers.length}`);

    return NextResponse.json({ success: true, sent, skipped, errors, eligible: reminderUsers.length });
}
