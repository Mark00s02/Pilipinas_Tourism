PH.register({
  id: 'boracay', name: 'Boracay', region: 'Aklan · Western Visayas', province: 'Aklan',
  hook: 'Powder-white sand, paraw sails and the sunset', bestMonths: 'Nov – May',
  mapPin: [11.97, 121.925], mapLabel: 'left', seed: 13, sunDir: [-1, .07, .1],
  terrain: {
    vScale: 2, beachM: 6,
    colors: { greens: ['#2a5a2a', '#336430', '#3e6e34', '#4a783a'], sand: '#efe6cc', reef: '#53c2b4' },
    touchups: [{ kind: 'reefShelf', depth: 2, width: 260 }],
  },
  palette: { water: ['#167080', '#0a2232'] },
  landmarks: [
    { kind: 'paraw', at: [11.962, 121.917], spreadM: 700, count: 7 },
    { kind: 'palms', area: [11.94, 121.91, 12.01, 121.95], count: 170, maxM: 35 },
    { kind: 'cityLights', area: [11.95, 121.92, 11.98, 121.93], count: 380, maxM: 25 },
    { kind: 'bangka', area: [11.93, 121.93, 11.95, 121.96], count: 3 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Boracay', title: 'Four kilometres of powder-white sand.',
    sub: 'A small island off the north-west tip of Panay, famous for one long beach of fine white sand, shallow turquoise water and sunsets crossed by sailboats.',
    wordmark: 'BORACAY', side: 'WHITE BEACH',
    plate: { src: 'white-beach.webp', alt: 'A thatched beach umbrella on bright white sand beside turquoise water', w: 1600, h: 1067, caption: 'White Beach at midday' },
    cam: { pos: [11.94, 121.90, 260], look: [11.975, 121.93, 30] },
  },
  sections: [
    {
      id: 'white-beach', nav: 'White Beach', navAlt: 'Stations', indexLabel: 'The beach',
      eyebrow: 'The famous shore', title: 'White Beach, station by station.',
      body: 'The west coast is one long beach, split by old boat landings into Stations 1, 2 and 3. Station 1 has the widest, quietest sand; Station 2 the restaurants and nightlife; Station 3 the cheaper stays.',
      stats: [['~4 km', 'Length of White Beach'], ['3', 'Stations along the shore'], ['2018', 'Closed six months for a clean-up']],
      plates: [
        { src: 'white-beach.webp', alt: 'A thatched beach umbrella on bright white sand beside turquoise water', w: 1600, h: 1067, caption: 'White Beach, Station 1' },
      ],
      cam: { pos: [11.953, 121.906, 120], look: [11.965, 121.925, 5] },
    },
    {
      id: 'paraw', nav: 'Paraw', navAlt: 'Sailing', indexLabel: 'The sails',
      eyebrow: 'Wind-powered', title: 'Sail away on a paraw.',
      body: 'The paraw is a traditional double-outrigger sailboat, light enough to skim the shallows. Crews take visitors out from White Beach — sit on the netting between the hulls and feel the spray.',
      stats: [['2', 'Outriggers keep it stable'], ['Sunset', 'The most popular sailing hour'], ['Wind', 'No engine needed']],
      plates: [
        { src: 'paraw.webp', alt: 'A paraw sailboat with a blue and white sail on shallow turquoise water', w: 1600, h: 1200, caption: 'A paraw off White Beach' },
      ],
      cam: { pos: [11.958, 121.906, 45], look: [11.962, 121.918, 8] },
    },
    {
      id: 'puka', nav: 'Puka', navAlt: 'North shore', indexLabel: 'The north',
      eyebrow: 'The quiet end', title: 'Puka Beach and the north.',
      body: 'At the northern tip, Puka Beach is coarser and wilder, named for the small shells once gathered there. It is a short tricycle ride from the main strip and far less crowded.',
      stats: [['Puka', 'Named for its tiny shells'], ['North', 'The island\'s quiet tip'], ['Tricycle', 'How to get there']],
      plates: [
        { src: 'puka.webp', alt: 'Driftwood letters spelling PUKA on a golden beach under a blue sky', w: 1600, h: 1067, caption: 'Puka Beach' },
      ],
      cam: { pos: [12.012, 121.905, 160], look: [11.997, 121.92, 0] },
    },
    {
      id: 'sunset', nav: 'Sunset', navAlt: 'Golden hour', indexLabel: 'The sunset',
      eyebrow: 'Golden hour', title: 'Every evening, a show.',
      body: 'White Beach faces west, so the sun drops straight into the sea. Paraw sails cross the light, the beach bars switch on, and fire dancers come out after dark.',
      stats: [['West', 'The beach faces the sunset'], ['Fire', 'Dancers on the sand at night'], ['Paraw', 'Sails silhouetted at dusk']],
      plates: [
        { src: 'sunset.webp', alt: 'A palm frond and a sailboat silhouetted against a golden sunset over the sea', w: 1600, h: 1063, caption: 'Sunset over the Sibuyan Sea' },
      ],
      cam: { pos: [11.975, 121.932, 90], look: [11.96, 121.88, 30] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 05 — Plan your trip', title: 'Boracay.',
    body: 'Fly into Caticlan, hop across by boat, and stay near Station 1 for the softest sand or Station 3 for value.',
    stats: [['15 min', 'Boat from Caticlan jetty'], ['Eco fee', 'Paid on arrival'], ['Book ahead', 'Rooms are capped since 2018']],
    cam: { pos: [11.915, 121.965, 650], look: [11.97, 121.925, 0] },
  },
  trip: {
    getThere: 'Fly to Caticlan (MPH) and take the short boat ride across, or fly to Kalibo (KLO) and ride a van about two hours.',
    season: 'November to May, when the north-east wind keeps White Beach calm.',
    budget: 'Mid to high. Prices rise in the peak months.',
    mustEat: 'Calamansi muffins — a Boracay favourite — and fresh seafood grilled at D\'Talipapa market.',
  },
  quiz: {
    q: 'Roughly how long is Boracay\'s White Beach?',
    options: ['About 400 m', 'About 4 km', 'About 40 km'], answer: 1,
    hint: 'Long enough to need three “stations”, short enough to walk in an hour.',
    explain: 'White Beach runs for about four kilometres.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Boracay White Beach in day (985286231)",
      "url": "https://commons.wikimedia.org/wiki/File:Boracay_White_Beach_in_day_(985286231).jpg",
      "author": "Angelo Juan Ramos from Makati City, Philippines",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "plate": "Plate 02",
      "title": "Paraw sailboat in Boracay 2",
      "url": "https://commons.wikimedia.org/wiki/File:Paraw_sailboat_in_Boracay_2.jpg",
      "author": "Constantine Agustin",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "plate": "Plate 03",
      "title": "Puka Beach Boracay Philippines",
      "url": "https://commons.wikimedia.org/wiki/File:Puka_Beach_Boracay_Philippines.jpg",
      "author": "Paolobon140",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "plate": "Plate 04",
      "title": "Boracay sunset - panoramio",
      "url": "https://commons.wikimedia.org/wiki/File:Boracay_sunset_-_panoramio.jpg",
      "author": "Jan Hazevoet",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0"
    }
  ],
});
