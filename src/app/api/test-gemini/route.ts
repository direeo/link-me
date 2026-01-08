// Test endpoint to diagnose Gemini API
// GET /api/test-gemini

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        geminiApiKeySet: !!process.env.GEMINI_API_KEY,
        geminiApiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    };

    if (!process.env.GEMINI_API_KEY) {
        results.error = 'GEMINI_API_KEY not set';
        return NextResponse.json(results);
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        results.modelCreated = true;

        const result = await model.generateContent('Say hello in one word');
        const response = result.response.text();

        results.geminiResponse = response;
        results.status = 'SUCCESS';
    } catch (error) {
        results.status = 'FAILED';
        results.error = error instanceof Error ? error.message : String(error);
        results.errorName = error instanceof Error ? error.name : 'Unknown';
    }

    return NextResponse.json(results);
}
