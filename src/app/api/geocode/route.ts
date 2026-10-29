import { NextRequest, NextResponse } from 'next/server';
import { PRESET_CITIES } from '@/lib/presets';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // 1. Check local presets first
  const localMatches = Object.values(PRESET_CITIES)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.state.toLowerCase().includes(q.toLowerCase())
    )
    .map((c) => ({
      name: c.name,
      state: c.state,
      country: 'India',
      latitude: c.lat,
      longitude: c.lon,
      airshed: c.airshed
    }));

  if (localMatches.length > 0 && localMatches[0].name.toLowerCase() === q.toLowerCase()) {
    return NextResponse.json({ results: localMatches });
  }

  // 2. Query Open-Meteo Geocoding API for global or sub-district searches
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=6&language=en&format=json`;

    const res = await fetch(geoUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'AeroPlus-AirQuality/2.0' }
    });

    if (res.ok) {
      const data = await res.json();
      const apiResults = (data.results || []).map((item: any) => ({
        name: item.name,
        state: item.admin1 || item.admin2 || '',
        country: item.country || '',
        latitude: item.latitude,
        longitude: item.longitude,
        airshed: item.admin1 ? `${item.admin1} Airshed` : 'Urban Airshed'
      }));

      // Merge and deduplicate
      const combined = [...localMatches];
      for (const item of apiResults) {
        if (!combined.some((c) => c.name.toLowerCase() === item.name.toLowerCase())) {
          combined.push(item);
        }
      }

      return NextResponse.json({ results: combined });
    }
  } catch (error) {
    console.warn('Geocoding error:', error);
  }

  return NextResponse.json({ results: localMatches });
}
