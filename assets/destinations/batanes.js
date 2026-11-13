PH.register({
  id: 'batanes', name: 'Batanes', region: 'Batanes · Cagayan Valley', province: 'Batanes',
  hook: 'Rolling green hills, stone houses and sea cliffs', bestMonths: 'Mar – May',
  mapPin: [20.45, 121.97], seed: 31, sunDir: [-1, .1, .1],
  terrain: {
    vScale: 2.2, beachM: 4, steep: .55,
    colors: { greens: ['#4f7a34', '#5c8a3a', '#6a963f', '#78a046'], rock: '#6d6a60', sand: '#c9b88e' },
  },
  palette: { water: ['#123e57', '#081c2a'] },
  landmarks: [
    { kind: 'lighthouse', at: [20.4537, 121.9654], scale: 1.6 },
    { kind: 'cattle', area: [20.385, 121.965, 20.410, 121.990], count: 26, maxM: 300 },
    { kind: 'houses', area: [20.30, 121.86, 20.33, 121.885], count: 18, maxM: 60, style: 'stone', scale: 1 },
    { kind: 'houses', area: [20.36, 121.90, 20.39, 121.93], count: 14, maxM: 60, style: 'stone', scale: 1 },
    { kind: 'cityLights', area: [20.44, 121.955, 20.46, 121.98], count: 220, maxM: 40 },
    { kind: 'clouds', at: [20.47, 122.01], altM: 950, radiusM: 2500, count: 8 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Batanes', title: 'The edge of the Philippines.',
    sub: 'The country\'s northernmost islands sit in the channel between Luzon and Taiwan: green hills dropping into a wild sea, stone villages and wide, empty skies.',
    wordmark: 'BATANES', side: 'IVATAN',
    plate: { src: 'island.webp', alt: 'Green hills ending in sea cliffs above crashing waves', w: 1600, h: 1068, caption: 'The island of winds' },
    cam: { pos: [20.37, 122.04, 750], look: [20.45, 121.97, 300] },
  },
  sections: [
    {
      id: 'hills', nav: 'Hills', navAlt: 'Pasture', indexLabel: 'The hills',
      eyebrow: 'Racuh a Payaman', title: 'Hills that roll into the sea.',
      body: 'In Mahatao, the communal pasture of Racuh a Payaman — nicknamed Marlboro Country — rolls over the hills to the cliffs, grazed by cattle and carabao that belong to the whole town.',
      stats: [['Communal', 'The pasture belongs to the town'], ['Cattle', 'Grazing free on the hills'], ['Cliffs', 'Where the hills meet the sea']],
      plates: [
        { src: 'hills.webp', alt: 'A grassy ridge path running towards the sea with a mountain island beyond', w: 1600, h: 542, caption: 'Racuh a Payaman' },
      ],
      cam: { pos: [20.375, 122.005, 380], look: [20.40, 121.978, 120] },
    },
    {
      id: 'stone-houses', nav: 'Houses', navAlt: 'Stone', indexLabel: 'The houses',
      eyebrow: 'Built for the storms', title: 'Walls a metre thick.',
      body: 'Ivatan houses are built from limestone and coral with walls up to a metre thick and roofs of dense cogon grass — made to ride out the typhoons that sweep the islands. Savidug, on Sabtang, is lined with them.',
      stats: [['~1 m', 'Thickness of the walls'], ['Cogon', 'Grass thatch, tied down tight'], ['Sabtang', 'Island of stone villages']],
      plates: [
        { src: 'houses.webp', alt: 'A woman in a fibre headdress looking out of a window in a stone house', w: 1600, h: 1067, caption: 'Savidug stone houses' },
      ],
      cam: { pos: [20.298, 121.895, 170], look: [20.315, 121.872, 20] },
    },
    {
      id: 'lighthouse', nav: 'Lighthouse', navAlt: 'Naidi', indexLabel: 'The lighthouse',
      eyebrow: 'Naidi Hills', title: 'A lighthouse at the top of the country.',
      body: 'Above Basco, the white lighthouse on Naidi Hills looks out over the port and Mount Iraya. Climb it at sunset, when the hills turn gold and the fishing boats come in.',
      stats: [['Basco', 'The capital and port'], ['Iraya', 'The volcano behind town'], ['Sunset', 'The time to climb']],
      plates: [
        { src: 'lighthouse.webp', alt: 'A white lighthouse with a red top on a grassy hill under a pink sky', w: 1600, h: 1067, caption: 'Basco Lighthouse, Naidi Hills' },
      ],
      cam: { pos: [20.436, 121.990, 280], look: [20.4537, 121.9654, 90] },
    },
    {
      id: 'islands', nav: 'Islands', navAlt: 'Winds', indexLabel: 'The islands',
      eyebrow: 'Islands of the winds', title: 'Closer to Taiwan than to Manila.',
      body: 'Ten islands make up Batanes, only three of them lived on. The Ivatan language, the vakul rain cape and an honesty café with no shopkeeper are part of what makes the place feel like its own small world.',
      stats: [['10', 'Islands in the province'], ['3', 'Of them inhabited'], ['Vakul', 'A head cover woven against sun and rain']],
      plates: [
        { src: 'island.webp', alt: 'Green hills ending in sea cliffs above crashing waves', w: 1600, h: 1068, caption: 'Sea cliffs of Batan' },
      ],
      cam: { pos: [20.33, 121.94, 520], look: [20.42, 121.98, 300] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 05 — Plan your trip', title: 'Batanes.',
    body: 'Fly into Basco, rent a bike or a tricycle for Batan island, and cross to Sabtang by falowa boat when the sea allows. Leave spare days — the weather decides.',
    stats: [['BSO', 'Basco Airport'], ['Falowa', 'The boat to Sabtang'], ['Spare days', 'Flights wait on the weather']],
    cam: { pos: [20.27, 122.09, 1600], look: [20.40, 121.95, 200] },
  },
  trip: {
    getThere: 'Fly to Basco (BSO) from Manila or Tuguegarao. Flights depend on the weather, so keep your plans loose.',
    season: 'March to May for calm seas and clear skies. Typhoon season runs roughly June to October.',
    budget: 'Mid to high — flights and boat transfers add up.',
    mustEat: 'Uvud balls, made from the pith of the banana stalk, and fresh fish dried in the Ivatan way.',
  },
  quiz: {
    q: 'Why are traditional Ivatan houses built with such thick walls?',
    options: ['To keep out wild animals', 'To stand up to typhoons', 'To store rainwater'], answer: 1,
    hint: 'Batanes sits right in the path of the storms.',
    explain: 'Thick limestone walls and heavy thatch let the houses ride out typhoons.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Marlboro country",
      "url": "https://commons.wikimedia.org/wiki/File:Marlboro_country.jpg",
      "author": "Greenthumb331",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 02",
      "title": "Savidug Stone Houses",
      "url": "https://commons.wikimedia.org/wiki/File:Savidug_Stone_Houses.jpg",
      "author": "CharMel Creations",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 03",
      "title": "Basco (Naidi) Lighthouse",
      "url": "https://commons.wikimedia.org/wiki/File:Basco_(Naidi)_Lighthouse.jpg",
      "author": "CharMel Creations",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 04",
      "title": "Batanes Island of Winds",
      "url": "https://commons.wikimedia.org/wiki/File:Batanes_Island_of_Winds.jpg",
      "author": "EdseastresD600",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
});
