import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';

export async function GET() {
  try {
    await dbConnect();
    // Find raffles that have finished and have prize winners
    const raffles = await Raffle.find({ isFinished: true, prizeWinners: { $exists: true, $ne: [] } }).lean();
    const winners = raffles.flatMap((raffle: any) => {
      const prizeTitles = raffle.prizes?.map((p: any) => p.title) || [];
      const prizeImages = raffle.prizes?.map((p: any) => p.imageUrl) || [];
      return (raffle.prizeWinners || []).map((winner: any, idx: number) => ({
        id: `${raffle._id}-${idx}`,
        image: raffle.winnersImageUrl || raffle.prizes?.[0]?.imageUrl || '/images/placeholder.png',
        raffleTitle: raffle.name,
        prizeTitle: prizeTitles[idx] || `Premio ${idx + 1}`,
        winnerName: winner.name,
        winnerEmail: winner.email,
        ticketNumber: winner.ticket,
        date: raffle.drawDate,
        prizeImages,
      }));
    });
    return NextResponse.json(winners);
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json({ message: 'Error fetching winners' }, { status: 500 });
  }
}
