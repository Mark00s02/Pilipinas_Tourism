PH.register({
  id: 'cebu', name: 'Cebu', region: 'Central Visayas', province: 'Cebu',
  hook: 'Magellan\'s Cross, waterfalls, whale sharks and lechon', bestMonths: 'Dec – May',
  // mapPin is only where the map draws the spot: nudged north of Cebu City so it clears Bohol's pin.
  mapPin: [10.60, 123.93], mapLabel: 'left', seed: 23, sunDir: [-1, .09, .2],
  terrain: {
    vScale: 4, beachM: 8,
    colors: { greens: ['#2a4c24', '#335628', '#3d602c', '#476a32'], reef: '#3a9a8f' },
    touchups: [{ kind: 'reefShelf', depth: 3, width: 900 }],
  },
  landmarks: [
    { kind: 'kiosk', at: [10.2935, 123.9019], scale: 1.6 },
    { kind: 'cityLights', area: [10.22, 123.82, 10.42, 124.02], count: 2800, maxM: 200 },
    { kind: 'cityLights', area: [9.55, 123.30, 10.20, 123.95], count: 700, maxM: 60 },
    { kind: 'whaleShark', at: [9.462, 123.415], spreadM: 700, count: 3, scale: 1.6 },
    { kind: 'bangka', at: [9.466, 123.412], spreadM: 900, count: 5, scale: 1.3 },
    { kind: 'palms', area: [9.40, 123.30, 10.10, 123.70], count: 220, maxM: 40 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Cebu', title: 'Where the Philippines met the world.',
    sub: 'A long, mountainous island at the heart of the Visayas — with the country\'s oldest city at one end, and waterfalls and whale sharks down south.',
    wordmark: 'CEBU', side: 'SUGBO',
    plate: { src: 'cross.webp', alt: 'An octagonal stone kiosk with a red tiled roof housing Magellan\'s Cross', w: 1600, h: 1067, caption: 'The kiosk of Magellan\'s Cross' },
    cam: { pos: [10.12, 124.10, 2600], look: [9.98, 123.70, 400] },
  },
  sections: [
    {
      id: 'cross', nav: 'Cross', navAlt: 'Cebu City', indexLabel: 'The cross',
      eyebrow: 'Oldest city', title: 'Magellan\'s Cross, 1521.',
      body: 'In April 1521, Ferdinand Magellan\'s expedition planted a cross in Cebu as Rajah Humabon and his people were baptised. A cross said to hold the original stands in a kiosk beside the Basilica del Santo Niño, in what is now the country\'s oldest city.',
      stats: [['1521', 'Year the cross was planted'], ['1565', 'Spanish settlement founded'], ['Santo Niño', 'The basilica next door']],
      plates: [
        { src: 'cross.webp', alt: 'An octagonal stone kiosk with a red tiled roof housing Magellan\'s Cross', w: 1600, h: 1067, caption: 'Magellan\'s Cross, Cebu City' },
      ],
      cam: { pos: [10.255, 123.955, 700], look: [10.2935, 123.9019, 0] },
    },
    {
      id: 'kawasan', nav: 'Kawasan', navAlt: 'Falls', indexLabel: 'The falls',
      eyebrow: 'The south-west', title: 'Turquoise falls at Kawasan.',
      body: 'In Badian, the Kawasan River tumbles through limestone into pools of milky turquoise. Swim at the main falls, or go canyoneering: a day of jumping, sliding and swimming down the gorge.',
      stats: [['Badian', 'Town at the river mouth'], ['Canyon', 'Jump and slide down the gorge'], ['Turquoise', 'Coloured by limestone']],
      plates: [
        { src: 'kawasan.webp', alt: 'A waterfall pouring into a turquoise pool surrounded by forest', w: 1000, h: 664, caption: 'Kawasan Falls' },
      ],
      cam: { pos: [9.72, 123.27, 1600], look: [9.80, 123.38, 250] },
    },
    {
      id: 'whale-sharks', nav: 'Whale sharks', navAlt: 'Oslob', indexLabel: 'The giants',
      eyebrow: 'Gentle giants', title: 'Swimming with whale sharks.',
      body: 'Off Oslob, whale sharks — the biggest fish in the sea — gather close to shore. The feeding that brings them there is debated by scientists, so keep your distance, never touch, and consider seeing them in the wild elsewhere in the Philippines.',
      stats: [['~10 m', 'Length of a big adult'], ['Plankton', 'All they eat'], ['Butanding', 'The Filipino name']],
      plates: [
        { src: 'whale-shark.webp', alt: 'A spotted whale shark swimming through deep blue water', w: 1600, h: 1200, caption: 'A whale shark off Oslob' },
      ],
      cam: { pos: [9.415, 123.47, 1300], look: [9.462, 123.413, 0] },
    },
    {
      id: 'lechon', nav: 'Lechon', navAlt: 'Food', indexLabel: 'The feast',
      eyebrow: 'Cebu\'s pride', title: 'The best lechon in the country.',
      body: 'Cebu lechon is roasted whole over charcoal, its belly stuffed with lemongrass, garlic, spring onion and pepper, so the meat needs no sauce — and the skin cracks like glass. Every Cebuano has a favourite stall.',
      stats: [['Whole', 'Roasted on a spit over charcoal'], ['Lemongrass', 'The secret in the stuffing'], ['No sauce', 'It does not need any']],
      plates: [
        { src: 'lechon.webp', alt: 'A whole roast pig with glossy crackling skin in a display case', w: 1600, h: 1047, caption: 'Cebu lechon' },
      ],
      cam: { pos: [10.25, 124.05, 1300], look: [10.31, 123.90, 0] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 05 — Plan your trip', title: 'Cebu.',
    body: 'Spend a day in the old city, then head south along the coast for the falls and the sea — the island is long, so give it time.',
    stats: [['CEB', 'Mactan–Cebu International Airport'], ['3–4 hrs', 'City to the far south by road'], ['Ferries', 'To Bohol and beyond']],
    cam: { pos: [9.55, 124.25, 4200], look: [9.95, 123.70, 0] },
  },
  trip: {
    getThere: 'Fly into Mactan–Cebu International Airport (CEB), with flights from across Asia. Buses and vans run the length of the island.',
    season: 'December to May is driest.',
    budget: 'Budget to high — a big city with every kind of stay.',
    mustEat: 'Lechon, of course — and puso, rice cooked in little woven coconut-leaf pouches.',
  },
  quiz: {
    q: 'In what year did Magellan\'s expedition plant the cross in Cebu?',
    options: ['1492', '1521', '1898'], answer: 1,
    hint: 'The same year Magellan was killed in the battle of Mactan.',
    explain: 'The cross was planted in April 1521.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Magellan's Cross Cebu City",
      "url": "https://commons.wikimedia.org/wiki/File:Magellan%27s_Cross_Cebu_City.jpg",
      "author": "Elmer B. Domingo",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 02",
      "title": "Kawasan Falls, Cebu, Philippines1",
      "url": "https://commons.wikimedia.org/wiki/File:Kawasan_Falls,_Cebu,_Philippines1.jpg",
      "author": "Andrewhaimerl",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "plate": "Plate 03",
      "title": "Whale shark in Oslob",
      "url": "https://commons.wikimedia.org/wiki/File:Whale_shark_in_Oslob.jpg",
      "author": "Firth McEachern",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 04",
      "title": "Lechon Cebu (whole) in MCIA, Cebu",
      "url": "https://commons.wikimedia.org/wiki/File:Lechon_Cebu_(whole)_in_MCIA,_Cebu.jpg",
      "author": "Ralffralff",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
});
