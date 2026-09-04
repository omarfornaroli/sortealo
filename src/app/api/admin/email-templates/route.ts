import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET(req: NextRequest) {
    await dbConnect();
    const settings = await Settings.findOne().lean();
    if (!settings) {
        return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }
    const { winnerEmailSubject, winnerEmailBody, purchaseEmailSubject, purchaseEmailBody } = settings;
    return NextResponse.json({ winnerEmailSubject, winnerEmailBody, purchaseEmailSubject, purchaseEmailBody });
}

export async function PUT(req: NextRequest) {
    await dbConnect();
    const data = await req.json();
    const { winnerEmailSubject, winnerEmailBody, purchaseEmailSubject, purchaseEmailBody } = data;
    const updated = await Settings.findOneAndUpdate({}, {
        winnerEmailSubject,
        winnerEmailBody,
        purchaseEmailSubject,
        purchaseEmailBody,
    }, { new: true, upsert: true }).lean();
    return NextResponse.json(updated);
}
