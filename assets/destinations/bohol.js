PH.register({
  id: 'bohol', name: 'Bohol', region: 'Central Visayas', province: 'Bohol',
  hook: 'The Chocolate Hills, tarsiers and a lazy jade river', bestMonths: 'Dec – May',
  mapPin: [9.83, 124.17], seed: 5, sunDir: [-.9, .1, -.5],
  terrain: {
    vScale: 2.2, beachM: 4,
    colors: { greens: ['#2c4a22', '#3a5a26', '#4b6a2c', '#5d7434'], rock: '#7a6a4c' },
    touchups: [{ kind: 'cones', area: [9.78, 124.10, 9.91, 124.24], count: 200, height: 120, radius: 520 }],
  },
  landmarks: [
    { kind: 'belfry', at: [9.623, 123.912], scale: 1.4, heading: 20 },
    { kind: 'palms', area: [9.56, 123.88, 9.66, 124.12], count: 140, maxM: 25 },
    { kind: 'cityLights', area: [9.60, 123.88, 9.66, 124.05], count: 500, maxM: 60 },
    { kind: 'bangka', area: [9.57, 123.88, 9.61, 124.0], count: 4 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Bohol', title: 'Hills like scattered chocolate.',
    sub: 'More than a thousand grassy cones roll to the horizon in the heart of Bohol, a short ride from river villages and the coral-stone churches of the coast.',
    wordmark: 'BOHOL', side: 'BOHOLANO',
    plate: { src: 'hills.webp', alt: 'Rows of rounded brown hills fading into the distance at sunset', w: 1600, h: 1067, caption: 'The hills at golden hour' },
    cam: { pos: [9.70, 124.10, 1100], look: [9.84, 124.17, 150] },
  },
  sections: [
    {
      id: 'hills', nav: 'Hills', navAlt: 'Carmen', indexLabel: 'The hills',
      eyebrow: 'A geological wonder', title: 'Over a thousand hills, one horizon.',
      body: 'Spread across the towns of Carmen, Batuan and Sagbayan, the Chocolate Hills are mounds of old marine limestone shaped by rain and erosion. In the dry season their grass burns brown — and the name explains itself.',
      stats: [['1,200+', 'Hills, most of them 30 to 50 m tall'], ['50 km²', 'Of rolling hills around Carmen'], ['1988', 'Declared a National Geological Monument']],
      plates: [
        { src: 'hills-day.webp', alt: 'Green cone-shaped hills rising out of forest under a bright sky', w: 1600, h: 1067, caption: 'Green after the rains, Carmen' },
        { src: 'hills.webp', alt: 'Brown hills in rows under a cloudy sunset sky', w: 1600, h: 1067, caption: 'Chocolate-brown at sunset' },
      ],
      cam: { pos: [9.78, 124.13, 650], look: [9.85, 124.18, 100] },
    },
    {
      id: 'tarsier', nav: 'Tarsier', navAlt: 'Corella', indexLabel: 'The tarsier',
      eyebrow: 'Pocket-sized primate', title: 'Eyes bigger than its brain.',
      body: 'The Philippine tarsier fits in the palm of a hand, yet each of its eyes is as large as its brain. It hunts insects by night and stresses easily, so the sanctuary in Corella keeps visits quiet: whispers, no flash, no touching.',
      stats: [['~12 cm', 'Body length, not counting the tail'], ['180°', 'It can turn its head almost all the way round'], ['Nocturnal', 'Sleeps by day in the forest']],
      plates: [
        { src: 'tarsier.webp', alt: 'Close-up of a Philippine tarsier with huge round eyes', w: 1600, h: 1067, caption: 'A Philippine tarsier' },
      ],
      cam: { pos: [9.65, 123.97, 380], look: [9.70, 123.93, 120] },
    },
    {
      id: 'loboc', nav: 'Loboc', navAlt: 'River', indexLabel: 'The river',
      eyebrow: 'Down the river', title: 'Lunch afloat on the Loboc.',
      body: 'Bamboo raft restaurants drift down the jade-green Loboc River past nipa huts and coconut palms, often with a band playing along the way. Downstream the river meets the sea at Loay.',
      stats: [['Floating', 'Lunch cruises on bamboo rafts'], ['Jade', 'Water tinted by the forest'], ['Loay', 'Where the river meets the sea']],
      plates: [
        { src: 'loboc.webp', alt: 'A wide green river between dense jungle-covered banks', w: 1600, h: 1067, caption: 'The Loboc River' },
      ],
      cam: { pos: [9.60, 124.00, 420], look: [9.64, 124.035, 30] },
    },
    {
      id: 'baclayon', nav: 'Baclayon', navAlt: 'Church', indexLabel: 'The church',
      eyebrow: 'Coral-stone faith', title: 'Churches built from the sea.',
      body: 'Baclayon Church, one of the oldest stone churches in the Philippines, was raised from blocks of coral — bound, the story goes, with egg whites. Its square bell tower still looks out over the Bohol Sea.',
      stats: [['1727', 'Year the church was completed'], ['Coral', 'Blocks cut from the reef'], ['2013', 'Earthquake damage, since restored']],
      plates: [
        { src: 'baclayon.webp', alt: 'A white coral-stone church with a massive square bell tower', w: 1600, h: 1200, caption: 'Baclayon Church and its belfry' },
      ],
      cam: { pos: [9.598, 123.94, 280], look: [9.623, 123.912, 30] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 05 — Plan your trip', title: 'Bohol.',
    body: 'Hire a driver or rent a scooter: the hills, the tarsiers and the river all fit into one long countryside day from Tagbilaran or Panglao.',
    stats: [['1 day', 'Hills, tarsiers and river in one loop'], ['Panglao', 'Beaches and dive sites next door'], ['2 hrs', 'Fast ferry from Cebu City']],
    cam: { pos: [9.58, 124.16, 2300], look: [9.80, 124.10, 200] },
  },
  trip: {
    getThere: 'Fly into Bohol–Panglao International Airport (TAG), or take the fast ferry from Cebu City to Tagbilaran, about two hours.',
    season: 'December to May is drier. The hills are greenest after the rains and brownest late in the dry season.',
    budget: 'Budget to mid-range. Countryside tours are easy to book on arrival.',
    mustEat: 'Kalamay — a sticky coconut-and-rice sweet sold in halved coconut shells.',
  },
  quiz: {
    q: 'Why are the Chocolate Hills called “chocolate”?',
    options: ['Their soil is rich in cocoa', 'Their grass turns brown in the dry season', 'A chocolate company named them'], answer: 1,
    hint: 'Think about what happens to grass when the rain stops.',
    explain: 'In the dry season the grass on the hills dries to a chocolate brown.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Chocolate Hills Carmen Bohol 2019",
      "url": "https://commons.wikimedia.org/wiki/File:Chocolate_Hills_Carmen_Bohol_2019.jpg",
      "author": "Wolfgang Hägele",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 02",
      "title": "Bohol Hills, Chocolate Hills, Sunset, Philippines",
      "url": "https://commons.wikimedia.org/wiki/File:Bohol_Hills,_Chocolate_Hills,_Sunset,_Philippines.jpg",
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "plate": "Plate 03",
      "title": "Philippine Tarsier Bohol",
      "url": "https://commons.wikimedia.org/wiki/File:Philippine_Tarsier_Bohol.jpg",
      "author": "John Martin PERRY",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 04",
      "title": "Loboc River Bohol 2017 1x",
      "url": "https://commons.wikimedia.org/wiki/File:Loboc_River_Bohol_2017_1x.jpg",
      "author": "Øyvind Holmstad",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 05",
      "title": "Baclayon church Bohol",
      "url": "https://commons.wikimedia.org/wiki/File:Baclayon_church_Bohol.jpg",
      "author": "Bengoeswhere",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
});
