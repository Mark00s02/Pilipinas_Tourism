PH.register({
  id: 'el-nido', name: 'El Nido', region: 'Palawan · MIMAROPA', province: 'Palawan',
  hook: 'Limestone towers, hidden lagoons and island hopping', bestMonths: 'Nov – May',
  mapPin: [11.18, 119.39], seed: 11, sunDir: [-1, .08, .1],
  terrain: {
    vScale: 2.2, beachM: 5, steep: .72,
    colors: { greens: ['#1c4426', '#24502a', '#2f5e30', '#3b6a34'], rock: '#77716a', sand: '#d8cba6', reef: '#3fa59a' },
    touchups: [
      { kind: 'karst', area: [11.05, 119.28, 11.23, 119.42], count: 70, height: 160, radius: 330 },
      { kind: 'lagoon', at: [11.150, 119.322], radius: 380, depth: 4 },
      { kind: 'reefShelf', depth: 3, width: 150 },
    ],
  },
  palette: { water: ['#0f4a52', '#0a2230'] },
  landmarks: [
    { kind: 'bangka', area: [11.11, 119.31, 11.19, 119.40], count: 9 },
    { kind: 'bangka', at: [11.140, 119.330], spreadM: 400, count: 3 },
    { kind: 'palms', area: [11.15, 119.37, 11.21, 119.42], count: 70, maxM: 20 },
    { kind: 'cityLights', area: [11.17, 119.38, 11.20, 119.40], count: 300, maxM: 30 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — El Nido, Palawan', title: 'Limestone towers in a glass-green sea.',
    sub: 'Dozens of karst islands rise straight out of Bacuit Bay. Spend your days hopping between hidden lagoons, coral gardens and beaches you can only reach by boat.',
    wordmark: 'EL NIDO', side: 'BACUIT',
    plate: { src: 'lagoon.webp', alt: 'Outrigger boats at the mouth of a lagoon between towering limestone cliffs', w: 1600, h: 1067, caption: 'Big Lagoon, Miniloc' },
    cam: { pos: [11.10, 119.43, 320], look: [11.16, 119.33, 150] },
  },
  sections: [
    {
      id: 'karst', nav: 'Karst', navAlt: 'Islands', indexLabel: 'The islands',
      eyebrow: 'Born under the sea', title: 'Towers of ancient reef.',
      body: 'The cliffs of El Nido are limestone laid down on an ancient seabed some 250 million years ago, then lifted up and carved by rain into jagged towers. Swiftlets nest in the crevices — and their nests gave El Nido, “the nest”, its name.',
      stats: [['45', 'Islands and islets in Bacuit Bay'], ['~250M yrs', 'Age of the limestone'], ['Nido', 'Spanish for “nest”']],
      plates: [
        { src: 'limestone.webp', alt: 'A sheer limestone island rising from deep blue water', w: 1600, h: 1067, caption: 'A karst island in Bacuit Bay' },
      ],
      cam: { pos: [11.165, 119.355, 280], look: [11.205, 119.365, 200] },
    },
    {
      id: 'lagoons', nav: 'Lagoons', navAlt: 'Miniloc', indexLabel: 'The lagoons',
      eyebrow: 'Island hopping', title: 'Paddle into the Big Lagoon.',
      body: 'Island-hopping tours, lettered A to D, leave El Nido town every morning. Tour A slips through a gap in the cliffs of Miniloc Island into the Big Lagoon — still, emerald water walled in by rock. Most visitors paddle the last stretch by kayak.',
      stats: [['A – D', 'Island-hopping tour routes'], ['Kayak', 'How most visitors enter'], ['Miniloc', 'Home of the Big and Small Lagoons']],
      plates: [
        { src: 'lagoon.webp', alt: 'Outrigger boats at the mouth of a lagoon between towering limestone cliffs', w: 1600, h: 1067, caption: 'Entering the Big Lagoon' },
        { src: 'bangka.webp', alt: 'A white outrigger bangka moored in clear shallow water', w: 1600, h: 1067, caption: 'A bangka, the island taxi' },
      ],
      cam: { pos: [11.132, 119.338, 140], look: [11.150, 119.322, 20] },
    },
    {
      id: 'reef', nav: 'Reef', navAlt: 'Coral', indexLabel: 'The reef',
      eyebrow: 'Below the surface', title: 'A reef you can wade into.',
      body: 'Bacuit Bay is a protected area, and its coral gardens start in water shallow enough to snorkel straight off the sand. Sea turtles, clownfish and reef sharks turn up around the outer islands.',
      stats: [['1998', 'Declared a protected area'], ['Snorkel', 'Coral right off the beach'], ['Turtles', 'Regulars around the outer islands']],
      plates: [
        { src: 'coral.webp', alt: 'Branching coral under clear turquoise water', w: 1600, h: 1067, caption: 'Coral gardens, Bacuit Bay' },
      ],
      cam: { pos: [11.115, 119.305, 90], look: [11.14, 119.315, 0] },
    },
    {
      id: 'sunset', nav: 'Sunset', navAlt: 'Corong-Corong', indexLabel: 'The sunset',
      eyebrow: 'Golden hour', title: 'Sundown over Bacuit Bay.',
      body: 'In the evening the bangkas come home and the islands go black against an orange sky. Corong-Corong beach, just south of town, faces straight into the sunset.',
      stats: [['West', 'The bay faces the sunset'], ['Corong-Corong', 'Sunset beach south of town'], ['Las Cabanas', 'Another favourite at dusk']],
      plates: [
        { src: 'sunset.webp', alt: 'Swimmers silhouetted in pink water with island silhouettes on the horizon', w: 1600, h: 1067, caption: 'Dusk in Bacuit Bay' },
      ],
      cam: { pos: [11.160, 119.372, 90], look: [11.14, 119.30, 80] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 05 — Plan your trip', title: 'El Nido.',
    body: 'Base yourself in town or at Corong-Corong, book one island tour a day, and leave a spare day for the weather.',
    stats: [['4', 'Island tours, A to D'], ['Eco fee', 'Paid once, valid for ten days'], ['Cash', 'Bring pesos; ATMs can run dry']],
    cam: { pos: [11.04, 119.46, 1300], look: [11.17, 119.35, 100] },
  },
  trip: {
    getThere: 'Fly direct to El Nido from Manila, or fly to Puerto Princesa and ride a van about five to six hours north.',
    season: 'November to May. Seas are calmest from February to April.',
    budget: 'Mid to high. Island tours are priced per person, per day.',
    mustEat: 'Kinilaw — fresh fish cured in coconut vinegar — and seafood grilled on the beach.',
  },
  quiz: {
    q: 'What does the name “El Nido” mean?',
    options: ['The island', 'The nest', 'The cliff'], answer: 1,
    hint: 'Think of the swiftlets that live in the cliffs.',
    explain: 'Nido is Spanish for nest — after the edible swiftlet nests in the cliffs.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Limestone island, Bacuit Bay, El Nido, Palawan, Philippines",
      "url": "https://commons.wikimedia.org/wiki/File:Limestone_island,_Bacuit_Bay,_El_Nido,_Palawan,_Philippines.jpg",
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "plate": "Plate 02",
      "title": "Big lagoon entrance, Miniloc island - panoramio",
      "url": "https://commons.wikimedia.org/wiki/File:Big_lagoon_entrance,_Miniloc_island_-_panoramio.jpg",
      "author": "Tuderna",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0"
    },
    {
      "plate": "Plate 03",
      "title": "Traditional Philippines fishing boat, bangka, banca, El Nido Bay, Palawan",
      "url": "https://commons.wikimedia.org/wiki/File:Traditional_Philippines_fishing_boat,_bangka,_banca,_El_Nido_Bay,_Palawan.jpg",
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "plate": "Plate 04",
      "title": "Underwater coral, crystal clear turquoise water, Bacuit Bay, El Nido, Palawan, Philippines",
      "url": "https://commons.wikimedia.org/wiki/File:Underwater_coral,_crystal_clear_turquoise_water,_Bacuit_Bay,_El_Nido,_Palawan,_Philippines.jpg",
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "plate": "Plate 05",
      "title": "Tropical sunset in Bacuit Bay, El Nido, Palawan, Philippines",
      "url": "https://commons.wikimedia.org/wiki/File:Tropical_sunset_in_Bacuit_Bay,_El_Nido,_Palawan,_Philippines.jpg",
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    }
  ],
});
