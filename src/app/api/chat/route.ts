import { NextRequest, NextResponse } from 'next/server';
import { askAeroPlus } from '@/lib/gemini';
import { AQICategory } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      location = 'Delhi',
      aqi = 220,
      category = 'Poor',
      dominantPollutant = 'PM2.5',
      weatherSummary = ''
    } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid message string is required.' },
        { status: 400 }
      );
    }

    const answer = await askAeroPlus(
      message.trim(),
      location,
      Number(aqi),
      category as AQICategory,
      dominantPollutant,
      weatherSummary
    );

    return NextResponse.json({
      success: true,
      query: message,
      answer
    });
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process assistant query.', details: error?.message },
      { status: 500 }
    );
  }
}
