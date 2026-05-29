// Cron job: send daily learning reminder emails
// Schedule: 0 9 * * * (9:00 AM UTC daily) — configured in vercel.json
// Security: Vercel automatically sends Authorization: Bearer $CRON_SECRET
//           We also accept a manual Bearer token for local testing.
//
// Algorithm:
//   1. Fetch all users with emailReminders=true
//   2. For each user, get their saved learning paths
//   3. For each path, count watched/total videos via VideoProgress
//   4. Skip fully-completed paths (watchedCount === totalVideos)
//   5. Send a Duolingo-style motivational email via sendDailyReminderEmail

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendDailyReminderEmail, ActiveLearningPath } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds — give enough time to loop all users

export async function GET(request: NextRequest) {
    // ── Authorization ────────────────────────────────────────────────────
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const auth = request.headers.get('authorization') ?? '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (token !== cronSecret) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
    }

    const db = getDb();

    // ── Fetch all users — filter to emailReminders=true in JS ─────────────
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
            // Get all saved learning paths for this user
            const paths = await db.savedLearningPath.findMany({ where: { userId: user.id } });

            const activePaths: ActiveLearningPath[] = [];

            for (const path of paths) {
                // Count watched videos for this path
                const progressRows = await db.videoProgress.findMany({ where: { learningPathId: path.id } });
                const watchedCount = progressRows.filter((p: { watched: boolean }) => p.watched).length;
                const totalVideos = path.totalVideos;

                // Skip paths where ALL videos are already watched (fully complete)
                if (totalVideos > 0 && watchedCount >= totalVideos) continue;

                activePaths.push({
                    topic: path.topic,
                    totalVideos,
                    watchedCount,
                    estimatedTotalTime: path.estimatedTotalTime,
                });
            }

            // Send the reminder (even if no active paths — encourages starting one)
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

    return NextResponse.json({
        success: true,
        sent,
        skipped,
        errors,
        eligible: reminderUsers.length,
    });
}
