PH.register({
  id: 'mayon', name: 'Mayon', region: 'Albay · Bicol', province: 'Albay',
  hook: 'The near-perfect cone of an active volcano', bestMonths: 'Mar – May',
  mapPin: [13.257, 123.685], seed: 29, sunDir: [-1, .1, .35],
  terrain: {
    vScale: 1.8, beachM: 5, rockM: 1100, summitM: 2050,
    colors: { greens: ['#2a4a22', '#335426', '#3c5e2a', '#46682e'], rock: '#5c5049', summit: '#4a3f3a' },
  },
  landmarks: [
    { kind: 'belfry', at: [13.166, 123.711], ruin: true, scale: 1.8, color: 0x7d7468 },
    { kind: 'summitGlow', at: [13.257, 123.685], altM: 2420 },
    { kind: 'clouds', at: [13.257, 123.685], altM: 2150, radiusM: 2600, count: 8 },
    { kind: 'cityLights', area: [13.12, 123.70, 13.17, 123.77], count: 900, maxM: 80 },
    { kind: 'palms', area: [13.10, 123.66, 13.20, 123.80], count: 160, maxM: 120 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Albay, Bicol', title: 'The most perfect cone on Earth.',
    sub: 'Rising straight out of the Albay plain, Mayon is famous for its symmetry — and for being the most active volcano in the Philippines.',
    wordmark: 'MAYON', side: 'MAGAYON',
    plate: { src: 'mayon.webp', alt: 'Mayon Volcano\'s symmetrical cone rising behind a green hill and a bay', w: 1600, h: 1067, caption: 'Mayon from Legazpi' },
    cam: { pos: [13.12, 123.80, 700], look: [13.257, 123.685, 1500] },
  },
  sections: [
    {
      id: 'cone', nav: 'Cone', navAlt: 'Symmetry', indexLabel: 'The cone',
      eyebrow: 'Daragang Magayon', title: 'Beautiful from every side.',
      body: 'Mayon\'s name comes from the Bikol word magayon — beautiful. Layers of lava and ash, laid down eruption after eruption, built its almost perfectly symmetrical cone. Legend says it rose over the grave of two young lovers.',
      stats: [['2,463 m', 'Height above the sea'], ['Stratovolcano', 'Built of lava and ash layers'], ['Magayon', 'Bikol for “beautiful”']],
      plates: [
        { src: 'mayon.webp', alt: 'Mayon Volcano\'s symmetrical cone rising behind a green hill and a bay', w: 1600, h: 1067, caption: 'The cone from the coast' },
      ],
      cam: { pos: [13.17, 123.60, 800], look: [13.257, 123.685, 1600] },
    },
    {
      id: 'fire', nav: 'Fire', navAlt: 'Active', indexLabel: 'The fire',
      eyebrow: 'Still awake', title: 'The country\'s most active volcano.',
      body: 'Mayon has erupted around fifty times in the last four centuries. A six-kilometre permanent danger zone rings the summit, and PHIVOLCS watches it day and night — on some evenings you can see the crater glow.',
      stats: [['~50', 'Eruptions in about 400 years'], ['6 km', 'Permanent danger zone'], ['PHIVOLCS', 'Keeps watch around the clock']],
      plates: [
        { src: 'summit.webp', alt: 'Close-up of Mayon\'s summit with a plume of ash rising into a blue sky', w: 1600, h: 1067, caption: 'Ash rising from the crater' },
      ],
      cam: { pos: [13.21, 123.75, 2300], look: [13.257, 123.685, 2200] },
    },
    {
      id: 'cagsawa', nav: 'Cagsawa', navAlt: 'Ruins', indexLabel: 'The ruins',
      eyebrow: 'February 1814', title: 'The belfry that survived.',
      body: 'On 1 February 1814, Mayon\'s deadliest eruption buried the town of Cagsawa. Today only the old church belfry rises from the lava field, with the volcano framed behind it — the classic photograph of Albay.',
      stats: [['1814', 'Mayon\'s deadliest eruption'], ['Belfry', 'All that remains of the church'], ['ATV', 'Lava-trail rides start nearby']],
      plates: [
        { src: 'cagsawa.webp', alt: 'A ruined stone bell tower overgrown with plants among trees', w: 1600, h: 900, caption: 'Cagsawa belfry' },
      ],
      cam: { pos: [13.153, 123.725, 170], look: [13.166, 123.711, 60] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 04 — Plan your trip', title: 'Mayon.',
    body: 'Base yourself in Legazpi, catch the cone at sunrise from the Ligñon Hill lookout, and keep an eye on PHIVOLCS alerts before you go.',
    stats: [['DRP', 'Bicol International Airport'], ['Sunrise', 'When the cone is clearest'], ['Alerts', 'Check PHIVOLCS before visiting']],
    cam: { pos: [13.09, 123.85, 1500], look: [13.25, 123.69, 1200] },
  },
  trip: {
    getThere: 'Fly into Bicol International Airport (DRP) near Legazpi, or ride an overnight bus from Manila.',
    season: 'March to May, when the summit is most often clear of clouds.',
    budget: 'Budget to mid-range.',
    mustEat: 'Bicol Express — pork stewed in coconut milk with chillies — and pili-nut sweets.',
  },
  quiz: {
    q: 'What happened to the town of Cagsawa in 1814?',
    options: ['A typhoon flattened it', 'A Mayon eruption buried it', 'An earthquake toppled it'], answer: 1,
    hint: 'Look at what towers over the ruins.',
    explain: 'Mayon\'s eruption of 1 February 1814 buried Cagsawa, leaving only the belfry standing.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Mayon Volcano and the Sleeping Lion",
      "url": "https://commons.wikimedia.org/wiki/File:Mayon_Volcano_and_the_Sleeping_Lion.jpg",
      "author": "Chrizluminario",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 02",
      "title": "Erickson Banzuela Balderama - Mayon Volcano Up-close",
      "url": "https://commons.wikimedia.org/wiki/File:Erickson_Banzuela_Balderama_-_Mayon_Volcano_Up-close.jpg",
      "author": "Erickson Banzuela Balderama",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 03",
      "title": "Cagsawa ruins",
      "url": "https://commons.wikimedia.org/wiki/File:Cagsawa_ruins.jpg",
      "author": "Alienscream",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  ],
});
