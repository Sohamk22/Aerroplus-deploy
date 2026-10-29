import { AssistantAnswer, CitationSource, AQICategory } from './types';
import { CITY_AQI_DATA } from './city-data';

export function generateOfflineAnswer(
  query: string,
  location: string = 'Delhi',
  aqi: number = 146,
  category: AQICategory = 'Unhealthy for Sensitive Groups',
  dominantPollutant: string = 'PM2.5'
): AssistantAnswer {
  const q = query.toLowerCase().trim();

  // If query mentions another known city or location matches, sync with provided dataset
  let targetCity = location;
  for (const c of Object.keys(CITY_AQI_DATA.cities)) {
    if (q.includes(c.toLowerCase())) {
      targetCity = c;
      break;
    }
  }

  const cityEntry = CITY_AQI_DATA.cities[targetCity];
  if (cityEntry) {
    aqi = cityEntry.current_aqi;
    category = cityEntry.weekly_series[0]?.status as AQICategory || category;
  }

  // Statutory Citations
  const caqmCitation: CitationSource = {
    docName: 'CAQM_Act_2021.pdf',
    docTitle: 'Commission for Air Quality Management (CAQM) Act 2021',
    pageNumber: 14,
    authority: 'Ministry of Law & Justice / CAQM',
    excerpt: 'Statutory mandate empowering CAQM to issue binding directions, regulate emissions, and coordinate mitigation across states.',
    relevanceNote: 'Empowers official air quality guidelines.'
  };

  const grapCitation: CitationSource = {
    docName: 'GRAP_Revised_Order_2024.pdf',
    docTitle: 'Graded Response Action Plan (GRAP 2024)',
    pageNumber: 6,
    authority: 'Sub-Committee on GRAP / CPCB',
    excerpt: 'Direction No. 77: Multi-stage emergency schedule for road misting, anti-smog guns, and construction curbs.',
    relevanceNote: 'Binding municipal protocols for smog mitigation.'
  };

  const gnctdCitation: CitationSource = {
    docName: 'GNCTD_Mitigation_Plan.pdf',
    docTitle: 'Comprehensive Air Pollution Mitigation Plan',
    pageNumber: 22,
    authority: 'Environment Department',
    excerpt: 'Mechanized vacuum sweeping, anti-smog guns on construction sites, and 24/7 Green War Room monitoring.',
    relevanceNote: 'Field enforcement initiatives.'
  };

  // 1. SPECIFIC CITY CURRENT AQI QUERY
  if (q.includes('current aqi') || (q.includes('aqi') && (q.includes('what') || q.includes('how much') || q.includes('delhi') || q.includes('mumbai') || q.includes('chennai') || q.includes('hyderabad') || q.includes('kolkata') || q.includes('bengaluru')))) {
    return {
      intent: 'CURRENT_AQI',
      headerTitle: `📍 Air Quality Snapshot for ${targetCity}`,
      summary: `I checked the AQI for you! 😊 In ${targetCity}, the current AQI is ${aqi} (${category}).`,
      mainContent:
        `Here is a quick look at the air today:\n` +
        `• **Current AQI:** ${aqi} (${category})\n` +
        `• **Main Contributor:** ${dominantPollutant} (fine inhalable dust)\n` +
        `• **Week Outlook:** Based on the 7-day series, readings range between ${cityEntry ? cityEntry.clamp_bounds.aqi_min : aqi - 20} and ${cityEntry ? cityEntry.clamp_bounds.aqi_max : aqi + 40}.\n\n` +
        `If you have outdoor plans or want to know whether you need a mask, just let me know!`,
      citations: [caqmCitation],
      caveats: ['Based on provided city benchmark series.'],
      suggestedFollowups: [
        'Is it safe to go outside today?',
        'Should I wear a mask?',
        'What measures are authorities taking?'
      ],
      aqiSnapshot: {
        location: targetCity,
        aqi,
        category,
        dominantPollutant,
        trend: 'Provided Benchmark Dataset (US EPA Standard)'
      }
    };
  }

  // 2. OUTDOOR ACTIVITY / RUNNING / SPORTS
  if (q.includes('outside') || q.includes('run') || q.includes('jog') || q.includes('walk') || q.includes('exercise') || q.includes('tomorrow') || q.includes('play')) {
    const isChallenging = aqi > 140;
    return {
      intent: 'OUTDOOR_ACTIVITY',
      headerTitle: '🏃 Outdoor Plans & Exercise Check',
      summary: isChallenging
        ? `I checked the air for you! 😊 With an AQI of ${aqi} in ${targetCity} (${category}), I would recommend keeping strenuous workouts indoors today.`
        : `I checked the forecast for you! 😊 With an AQI of ${aqi} in ${targetCity}, it looks pretty good to head out for a light jog or walk. What plans do you have?`,
      mainContent: isChallenging
        ? `Here is the friendly breakdown:\n` +
          `• **Why take it easy:** When you run or cycle, you inhale 5 to 10 times more air, pulling fine dust deeper into your lungs.\n` +
          `• **Best window:** If you really want some outdoor fresh air, the early afternoon (12 PM to 3 PM) is usually better than early mornings, as the sun helps disperse the lower smog layer.\n` +
          `• **Indoor alternatives:** A quick gym session, treadmill walk, or indoor yoga is your safest bet today!`
        : `Here are a couple of quick tips for heading out:\n` +
          `• **Best hours:** Mid-day and early afternoons generally have the best air circulation.\n` +
          `• **Choose green paths:** Running near parks or tree-lined lanes is much nicer than beside bumper-to-bumper traffic.\n` +
          `• **Stay hydrated:** Drinking plenty of water keeps your airways clear and comfortable!`,
      citations: [grapCitation],
      caveats: ['Guidance is informative for general wellness.'],
      suggestedFollowups: [
        'Should I wear a mask outside?',
        'How does air pollution affect my health?',
        'What is the outlook for the rest of the week?'
      ],
      aqiSnapshot: {
        location: targetCity,
        aqi,
        category,
        dominantPollutant,
        trend: 'Provided Benchmark Series'
      }
    };
  }

  // 3. MASKS & PERSONAL PROTECTION
  if (q.includes('mask') || q.includes('respirator') || q.includes('n95') || q.includes('wear')) {
    const needMask = aqi > 100;
    return {
      intent: 'HEALTH_PROTECTION',
      headerTitle: '😷 Mask Advice for Today',
      summary: needMask
        ? `Yes, grabbing a good mask is a smart move today! 😊 With ${targetCity}'s AQI at ${aqi} (${category}), an N95 will keep you feeling fresh.`
        : `With ${targetCity}'s AQI at ${aqi} (${category}), masks are optional for healthy folks, though sensitive individuals might still prefer one! 😊`,
      mainContent:
        `Here is what you need to know about masks:\n` +
        `• **What works best:** A certified N95 or KN95 respirator with a snug seal over your nose and mouth filters out over 95% of micro-particles (PM2.5).\n` +
        `• **Cloth & surgical masks:** While great for coughing, they are too loose to stop microscopic smog particles from slipping around the edges.\n` +
        `• **Quick tip:** Pinch the metal nose strip tightly so your glasses don't fog up and air doesn't leak in!`,
      citations: [grapCitation],
      caveats: ['Ensure an airtight seal along the cheeks for proper filtering.'],
      suggestedFollowups: [
        'Is it safe to go for a morning run?',
        'What can I do at home to stay protected?',
        'What are authorities doing under GRAP?'
      ],
      aqiSnapshot: {
        location: targetCity,
        aqi,
        category,
        dominantPollutant
      }
    };
  }

  // 4. HEALTH EFFECTS & SENSITIVE GROUPS
  if (q.includes('health') || q.includes('affect') || q.includes('symptom') || q.includes('asthma') || q.includes('lung') || q.includes('cough')) {
    return {
      intent: 'HEALTH_AWARENESS',
      headerTitle: '🌿 How the Air Affects Your Body',
      summary: `I've got you covered! 😊 In ${targetCity}, today's AQI is ${aqi} (${category}), mainly driven by fine particles (${dominantPollutant}).`,
      mainContent:
        `Here is a straightforward look at what happens:\n` +
        `• **What PM2.5 does:** These tiny dust particles are about 30 times thinner than a single strand of hair, so they can slip past your throat and cause throat tickles or dry eyes.\n` +
        `• **Common signs:** You might feel a slight scratch in your throat, mild cough, or heavier breathing if you spend hours outside.\n` +
        `• **If you have asthma:** Keep your inhaler handy and avoid rush-hour traffic corridors.\n` +
        `• **Easy daily habits:** Drink plenty of warm water, wash your face after coming inside, and keep your windows closed during morning rush hours.`,
      citations: [caqmCitation],
      caveats: ['Check in with a doctor if you experience persistent wheezing or chest tightness.'],
      suggestedFollowups: [
        'Which precautions should I take today?',
        'Should I wear an N95 mask outside?',
        'What measures are authorities taking?'
      ],
      aqiSnapshot: {
        location: targetCity,
        aqi,
        category,
        dominantPollutant
      }
    };
  }

  // 5. GOVERNMENT MEASURES & GRAP
  if (q.includes('government') || q.includes('authorities') || q.includes('grap') || q.includes('caqm') || q.includes('action') || q.includes('measure')) {
    return {
      intent: 'GOVERNMENT_ACTION',
      headerTitle: '🏛️ What Authorities Are Doing Right Now',
      summary: `Authorities are actively rolling out clean-air initiatives! 😊 In major metropolitan areas, teams operate under the Graded Response Action Plan (GRAP) and CAQM guidelines.`,
      mainContent:
        `Here are the real initiatives currently in action:\n` +
        `• **Anti-Smog Guns & Water Sprinklers:** Specialized trucks spray fine water mist over busy intersections and dust hotspots to keep particles from floating into the air.\n` +
        `• **Mechanized Road Sweeping:** High-efficiency vacuum sweeping vehicles clean major road corridors daily instead of dry broom sweeping.\n` +
        `• **Construction Site Curbs:** Registered construction sites must install dust barrier screens and anti-smog misters, and cover all debris piles.\n` +
        `• **Traffic & Emission Checks:** Municipal teams ramp up checks on vehicle PUC certificates and restrict older high-emission commercial trucks.`,
      citations: [grapCitation, gnctdCitation],
      caveats: ['Enforcement steps escalate according to designated GRAP stages.'],
      suggestedFollowups: [
        'What can I do to reduce my personal emissions?',
        'How does an artificial tree clean air?',
        'Should I wear a mask today?'
      ],
      aqiSnapshot: {
        location: targetCity,
        aqi,
        category,
        dominantPollutant
      }
    };
  }

  // 6. CITIZEN ACTION & PERSONAL EMISSIONS
  if (q.includes('reduce') || q.includes('contribution') || q.includes('help') || q.includes('do my part') || q.includes('emission') || q.includes('citizen')) {
    return {
      intent: 'CITIZEN_ACTION',
      headerTitle: '🌱 Simple Ways You Can Help Clear the Air',
      summary: `It is awesome that you want to help! 😊 Small everyday choices really do add up across the city.`,
      mainContent:
        `Here are five super practical things you can do today:\n` +
        `• **Hop on the Metro or Bus:** Choosing public transit or carpooling takes private cars off the road during peak smog hours.\n` +
        `• **Cut Engine Idling:** If you're stuck at a traffic signal longer than 20 seconds, switch your engine off.\n` +
        `• **Never Burn Waste:** Don't burn leaves, paper, or plastic. Report any open burning on municipal civic apps.\n` +
        `• **Check Vehicle Health:** Keep your tires properly inflated and your PUC certificate current.\n` +
        `• **Add Indoor Greenery:** Plants like Areca Palms, Snake Plants, and Money Plants add oxygen and brighten up your room!`,
      citations: [gnctdCitation],
      caveats: ['Community action combined with civic enforcement creates lasting airshed improvement.'],
      suggestedFollowups: [
        'What is the government doing under GRAP?',
        'What is the current AQI in Delhi?',
        'Should I wear a mask outside?'
      ],
      aqiSnapshot: {
        location: targetCity,
        aqi,
        category,
        dominantPollutant
      }
    };
  }

  // 7. TRAVEL & TRIP PLANNING
  if (q.includes('trip') || q.includes('travel') || q.includes('visit') || q.includes('next week') || q.includes('plan')) {
    return {
      intent: 'TRIP_PLANNING',
      headerTitle: `✈️ Planning Your Visit to ${targetCity}`,
      summary: `Heading to ${targetCity}? 😊 I've checked the air outlook for you so you can plan a smooth, fun trip!`,
      mainContent:
        `Here are a few handy travel tips:\n` +
        `• **Air quality outlook:** In ${targetCity}, current AQI sits around ${aqi} (${category}). The weekly series indicates similar trends over the next few days.\n` +
        `• **Pack smart:** Toss a couple of comfortable N95 masks in your daypack for airport or station commutes.\n` +
        `• **Best timing for sightseeing:** Plan outdoor monuments and markets between 11:30 AM and 4:00 PM when sunshine disperses mist, and enjoy indoor cafes and museums in the early morning!`,
      citations: [caqmCitation],
      caveats: ['Always re-check weather and wind shifts a day before departure.'],
      suggestedFollowups: [
        'What is the current AQI in Mumbai?',
        'Should I wear a mask outside?',
        'Is it safe to go for a run?'
      ],
      aqiSnapshot: {
        location: targetCity,
        aqi,
        category,
        dominantPollutant
      }
    };
  }

  // DEFAULT / GENERAL GUIDANCE
  return {
    intent: 'GENERAL_CHAT',
    headerTitle: `🌿 Welcome to AeroPlus for ${targetCity}`,
    summary: `I'm happy to help! 😊 Air quality in ${targetCity} is currently at an AQI of ${aqi} (${category}).`,
    mainContent:
        `Feel free to ask me anything about your day:\n` +
        `• **Morning Runs & Sports:** Ask if it's safe to exercise outside or what hours are best.\n` +
        `• **Health & Masks:** Find out whether an N95 mask is needed for your commute.\n` +
        `• **Government Measures:** Learn what authorities are doing under the GRAP clean air action plan.\n\n` +
        `What can I look up for you?`,
    citations: [caqmCitation],
    caveats: ['Based on provided city benchmark observations.'],
    suggestedFollowups: [
      'Is it safe to go outside today?',
      'Should I wear an N95 mask?',
      'What measures are authorities taking under GRAP?',
      'What can I do to reduce my emissions?'
    ],
    aqiSnapshot: {
      location: targetCity,
      aqi,
      category,
      dominantPollutant
    }
  };
}
