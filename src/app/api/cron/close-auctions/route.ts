
import { NextResponse } from 'next/server';
import { closeExpiredAuctions } from '@/lib/actions-bid';

// This should be secured with a secret in production
export async function GET(req: Request) {
    try {
        const result = await closeExpiredAuctions();
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[CRON_ERROR]", error);
        const message = error instanceof Error ? error.message : "Internal Error";
        return new NextResponse(message, { status: 500 });
    }
}
