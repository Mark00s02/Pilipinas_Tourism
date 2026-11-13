PH.register({
  id: 'siargao', name: 'Siargao', region: 'Surigao del Norte · Mindanao', province: 'Surigao del Norte',
  hook: 'Cloud 9 surf, island hopping and Sugba Lagoon', bestMonths: 'Mar – Oct · surf Sep – Nov',
  mapPin: [9.85, 126.05], mapLabel: 'up', seed: 9, sunDir: [-1, .09, .2],
  terrain: {
    vScale: 4.5, beachM: 4,
    colors: { greens: ['#2a5226', '#34602a', '#3f6c2e', '#4b7834'], sand: '#e0d3ad', reef: '#41b0a2' },
    touchups: [{ kind: 'reefShelf', depth: 2, width: 420 }],
  },
  palette: { water: ['#114b5a', '#0a2232'] },
  landmarks: [
    { kind: 'boardwalk', at: [9.8115, 126.1650], heading: 95, length: 9 },
    { kind: 'surfer', at: [9.812, 126.175], spreadM: 250, count: 5 },
    { kind: 'palms', area: [9.70, 125.90, 10.05, 126.20], count: 320, maxM: 60 },
    { kind: 'bangka', area: [9.74, 126.13, 9.79, 126.17], count: 5 },
    { kind: 'cityLights', area: [9.77, 126.14, 9.80, 126.17], count: 220, maxM: 20 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Siargao', title: 'The surfing capital of the Philippines.',
    sub: 'A teardrop island off the north-east tip of Mindanao, where the Pacific breaks over shallow reef and the mangroves hide a lagoon the colour of jade.',
    wordmark: 'SIARGAO', side: 'CLOUD 9',
    plate: { src: 'boardwalk.webp', alt: 'A wooden boardwalk and viewing tower on stilts over the sea at dusk', w: 1600, h: 1067, caption: 'The Cloud 9 tower' },
    cam: { pos: [9.77, 126.215, 280], look: [9.85, 126.08, 80] },
  },
  sections: [
    {
      id: 'cloud9', nav: 'Cloud 9', navAlt: 'Surf', indexLabel: 'The wave',
      eyebrow: 'A reef break', title: 'Riding the Cloud 9 barrel.',
      body: 'Swells rolling in from the Pacific hit a shallow reef off General Luna and stand up into a thick, hollow right-hander. A long boardwalk leads out to a viewing tower where you can watch surfers drop in.',
      stats: [['Sep – Nov', 'Peak surf season'], ['Right', 'A fast, hollow right-hand reef break'], ['Tower', 'Watch from the end of the boardwalk']],
      plates: [
        { src: 'boardwalk.webp', alt: 'A wooden boardwalk and viewing tower on stilts over the sea at dusk', w: 1600, h: 1067, caption: 'The Cloud 9 boardwalk' },
      ],
      cam: { pos: [9.7925, 126.1575, 200], look: [9.8125, 126.1720, -25] },
    },
    {
      id: 'islands', nav: 'Islands', navAlt: 'Hopping', indexLabel: 'The islands',
      eyebrow: 'Three-island tour', title: 'Naked, Daku and Guyam.',
      body: 'A short bangka ride from General Luna takes in three islands: Naked, a bare white sandbar; Daku, the big one, with a fishing village; and Guyam, a tiny palm-topped islet ringed by reef.',
      stats: [['3', 'Islands on the classic tour'], ['Sandbar', 'Naked Island has no trees at all'], ['Half day', 'Enough for all three']],
      plates: [
        { src: 'island.webp', alt: 'A grassy island meadow with coconut palms and green hills across the water', w: 1600, h: 1067, caption: 'Island meadow, Siargao' },
      ],
      cam: { pos: [9.735, 126.135, 220], look: [9.765, 126.16, 0] },
    },
    {
      id: 'sugba', nav: 'Sugba', navAlt: 'Lagoon', indexLabel: 'The lagoon',
      eyebrow: 'Deep in the mangroves', title: 'Sugba Lagoon.',
      body: 'On the west side of the island, boats from Del Carmen thread through one of the largest mangrove forests in the country to Sugba — a calm, turquoise lagoon for paddleboarding, cliff jumps and swimming.',
      stats: [['Mangroves', 'Among the largest stands in the country'], ['Del Carmen', 'Where boats to the lagoon leave'], ['Paddle', 'Kayak or SUP across the lagoon']],
      plates: [
        { src: 'sugba.webp', alt: 'Turquoise lagoon with kayakers, a wooden jump platform and forested cliffs', w: 1600, h: 1067, caption: 'Sugba Lagoon' },
      ],
      cam: { pos: [9.84, 126.06, 450], look: [9.88, 126.0, 10] },
    },
    {
      id: 'palms', nav: 'Palms', navAlt: 'Inland', indexLabel: 'The palms',
      eyebrow: 'The open road', title: 'A sea of coconut palms.',
      body: 'Rent a scooter and ride the island road: endless coconut groves, rice paddies, the rock pools at Magpupungko and viewpoints over the palms.',
      stats: [['Scooter', 'The easiest way around'], ['Magpupungko', 'Natural rock pools at low tide'], ['Coconut', 'Grown across most of the island']],
      plates: [
        { src: 'palms.webp', alt: 'A rider on a scooter at a viewpoint over coconut palms and hills', w: 1600, h: 1067, caption: 'Coconut Trees View Deck' },
      ],
      cam: { pos: [9.84, 126.15, 380], look: [9.90, 126.07, 40] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 05 — Plan your trip', title: 'Siargao.',
    body: 'Stay in General Luna, surf in the morning, island-hop at midday and watch the sun go down from the Cloud 9 tower.',
    stats: [['General Luna', 'Where most visitors stay'], ['IAO', 'Sayak Airport, on the island'], ['Island time', 'Plan slow days']],
    cam: { pos: [9.69, 126.25, 1500], look: [9.86, 126.08, 0] },
  },
  trip: {
    getThere: 'Fly into Sayak Airport (IAO) from Manila or Cebu, or take a ferry from Surigao City.',
    season: 'March to October for calm seas and island hopping; September to November for the biggest surf.',
    budget: 'Budget to mid-range, with plenty of surf hostels.',
    mustEat: 'Fresh kinilaw and a cold buko — young coconut — straight from the tree.',
  },
  quiz: {
    q: 'Which ocean sends the waves to Cloud 9?',
    options: ['The Indian Ocean', 'The Pacific Ocean', 'The South China Sea'], answer: 1,
    hint: 'Siargao faces east, toward the open ocean.',
    explain: 'The swells roll in across the Pacific Ocean.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Cloud 9 Boardwalk, Siargao",
      "url": "https://commons.wikimedia.org/wiki/File:Cloud_9_Boardwalk,_Siargao.jpg",
      "author": "JupitReyes",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 02",
      "title": "Corregidor or Casolian Island, Siargao",
      "url": "https://commons.wikimedia.org/wiki/File:Corregidor_or_Casolian_Island,_Siargao.jpg",
      "author": "Michael Angelo Luna",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 03",
      "title": "SUGBA LAGOON (MAY 2019)",
      "url": "https://commons.wikimedia.org/wiki/File:SUGBA_LAGOON_(MAY_2019).jpg",
      "author": "Lucky Ambago Purok Otso",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 04",
      "title": "Coconut Trees View Deck in Siargao",
      "url": "https://commons.wikimedia.org/wiki/File:Coconut_Trees_View_Deck_in_Siargao.jpg",
      "author": "Michael Angelo Luna",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
});
