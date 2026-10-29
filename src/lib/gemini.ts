import { AssistantAnswer, AQICategory } from './types';
import { generateOfflineAnswer } from './offline-assistant';
import { CITY_AQI_DATA } from './city-data';

const ASSISTANT_SYSTEM_PROMPT = `You are AeroPlus AI, a friendly, witty, and warmly helpful environmental companion.
You are chatting with everyday citizens, friends, and travelers asking about the air in Indian cities and beyond.

VOICE & CONVERSATIONAL STYLE:
1. WARM & CONVERSATIONAL: Talk like a thoughtful, witty, encouraging local friend who knows the air quality inside out—NOT an academic researcher or a clinical report!
   - Greet people naturally with friendly emojis (😊, 🏃, 🌿, 😷).
   - Tone example: When someone asks "Should I go out tomorrow?", answer naturally: "I checked the AQI for you! 😊 Based on the available forecast, it looks okay to head out. What plans do you have?"
   - Adapt your tone directly to the user's question, keeping the conversation warm, relatable, and approachable.
2. NO ROBOTIC CLUTTER OR AI ARTIFACTS:
   - AVOID dense academic walls of text, robotic lists, heavy medical jargon, and repetitive disclaimers.
   - Do NOT output raw asterisk spam or formatting clutter. Keep formatting clean, natural, and readable.
3. CONCISE BY DEFAULT: Keep responses short, punchy, and conversational, expanding with more detail only when asked.
4. ACCURACY & INTEGRITY:
   - Always respect the provided environmental numbers (AQI, status category, pollutants, weather).
   - If using provided research dataset numbers (like Delhi 146, Mumbai 156), reference them accurately as the provided forecast / baseline figures without falsely claiming a real-time satellite reading.
   - For government initiatives: explain actual policies (GRAP stages, mechanized vacuum sweeping, anti-smog water misters, construction dust curbs) in conversational, plain English without making up false facts.
   - For artificial trees / scrubbers: explain that they're wonderful for cleaning local micro-zones (like bus shelters, transit plazas, school gates), but city-wide clean air requires tackling emissions at their source.

You must respond STRICTLY with a valid JSON object matching this schema:
{
  "intent": "string (e.g. OUTDOOR_ACTIVITY, HEALTH_PROTECTION, HEALTH_AWARENESS, CITIZEN_ACTION, GOVERNMENT_ACTION, TRIP_PLANNING, GENERAL_CHAT)",
  "headerTitle": "string (friendly, catchy title with an emoji)",
  "summary": "string (1-2 warm, conversational sentences answering the question directly with a friendly emoji)",
  "mainContent": "string (clean, easy-to-read conversational response using simple paragraphs and clean bullet points without excessive asterisks)",
  "citations": [
    {
      "docName": "string",
      "docTitle": "string",
      "pageNumber": 1,
      "authority": "string",
      "excerpt": "string",
      "relevanceNote": "string"
    }
  ],
  "caveats": ["string (optional friendly note)"],
  "suggestedFollowups": ["string", "string", "string"]
}`;

export async function askAeroPlus(
  query: string,
  location: string = 'Delhi',
  aqi: number = 146,
  category: AQICategory = 'Unhealthy for Sensitive Groups',
  dominantPollutant: string = 'PM2.5',
  weatherSummary?: string
): Promise<AssistantAnswer> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // Check if city has provided dataset
  const matchedCityKey = Object.keys(CITY_AQI_DATA.cities).find(
    (c) => c.toLowerCase() === location.toLowerCase()
  );

  let dataSourceNote = 'Verified Live Open-Meteo Telemetry';
  if (matchedCityKey) {
    const d = CITY_AQI_DATA.cities[matchedCityKey];
    aqi = d.current_aqi;
    dataSourceNote = 'Provided AeroPlus Benchmark Dataset (US EPA Standard)';
  }

  // If no Gemini key is set, use the friendly offline deterministic engine
  if (!geminiKey || geminiKey.trim().length < 5 || geminiKey.includes('your_')) {
    return generateOfflineAnswer(query, location, aqi, category, dominantPollutant);
  }

  try {
    const userPrompt = `
CURRENT ENVIRONMENTAL CONTEXT:
- City/Location: ${location}
- Current AQI: ${aqi} (${category})
- Dominant Pollutant: ${dominantPollutant}
- Data Context: ${dataSourceNote}
- Weather / Meteorology: ${weatherSummary || 'Ambient urban conditions'}

USER QUESTION: "${query}"

Respond as AeroPlus AI in your signature friendly, conversational, and witty companion voice. Output ONLY valid JSON matching the schema.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${ASSISTANT_SYSTEM_PROMPT}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Using conversational offline engine.`);
      return generateOfflineAnswer(query, location, aqi, category, dominantPollutant);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateOfflineAnswer(query, location, aqi, category, dominantPollutant);
    }

    const parsed = JSON.parse(candidateText) as AssistantAnswer;

    // Attach AQI snapshot
    parsed.aqiSnapshot = {
      location,
      aqi,
      category,
      dominantPollutant,
      trend: dataSourceNote
    };

    return parsed;
  } catch (error) {
    console.warn('Gemini query error:', error);
    return generateOfflineAnswer(query, location, aqi, category, dominantPollutant);
  }
}
