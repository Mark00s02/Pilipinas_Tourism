PH.register({
  id: 'banaue', name: 'Banaue', region: 'Ifugao · Cordillera', province: 'Ifugao',
  hook: 'Rice terraces carved into the mountains by hand', bestMonths: 'Feb – May',
  mapPin: [16.92, 121.06], seed: 17, sunDir: [-1, .12, -.3],
  terrain: {
    vScale: 1.3, water: false, rockM: 2300, steep: .5,
    colors: { greens: ['#244a22', '#2c5426', '#355e2a', '#3f682e'], rock: '#5d5a4c', terrace: '#86a83e' },
    touchups: [
      { kind: 'terraces', area: [16.955, 121.085, 16.990, 121.115], step: 30 },
      { kind: 'terraces', area: [16.900, 121.045, 16.935, 121.080], step: 30 },
    ],
  },
  palette: { fog: ['#4a3a38', '#060b14'], bot: ['#3a2f2c', '#03060a'] },
  landmarks: [
    { kind: 'huts', area: [16.968, 121.092, 16.982, 121.106], count: 26, scale: 1.1 },
    { kind: 'huts', area: [16.905, 121.050, 16.920, 121.068], count: 30, scale: 1.1 },
    { kind: 'cityLights', area: [16.905, 121.05, 16.92, 121.07], count: 200, maxM: 3000 },
    { kind: 'clouds', at: [16.95, 121.08], altM: 1900, radiusM: 4000, count: 10 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Banaue, Ifugao', title: 'Stairways to the sky.',
    sub: 'In the Cordillera mountains of northern Luzon, the Ifugao people carved whole valleys into rice terraces — and still farm them by hand today.',
    wordmark: 'BANAUE', side: 'IFUGAO',
    plate: { src: 'batad.webp', alt: 'A village of tin-roofed houses inside a bowl of green rice terraces', w: 1600, h: 1067, caption: 'The amphitheatre of Batad' },
    cam: { pos: [16.905, 121.135, 2300], look: [16.965, 121.09, 1100] },
  },
  sections: [
    {
      id: 'batad', nav: 'Batad', navAlt: 'Amphitheatre', indexLabel: 'The terraces',
      eyebrow: 'World Heritage', title: 'The amphitheatre of Batad.',
      body: 'Above Banaue town, a steep hike leads down to Batad, where the terraces curve around the valley like the rows of an amphitheatre. The Rice Terraces of the Philippine Cordilleras became a UNESCO World Heritage site in 1995.',
      stats: [['1995', 'Inscribed as World Heritage'], ['By hand', 'Built and kept without machines'], ['Tappiya', 'A waterfall below the village']],
      plates: [
        { src: 'batad.webp', alt: 'A village of tin-roofed houses inside a bowl of green rice terraces', w: 1600, h: 1067, caption: 'Batad village and terraces' },
      ],
      cam: { pos: [16.952, 121.118, 1900], look: [16.973, 121.098, 1150] },
    },
    {
      id: 'water', nav: 'Water', navAlt: 'Forests', indexLabel: 'The water',
      eyebrow: 'Engineering without engines', title: 'Forests on top, rice below.',
      body: 'Each terrace is fed by water caught in the forests on the peaks above, led down through channels and bamboo pipes from one level to the next. The terraces are often called 2,000 years old — some researchers now date them later, but nobody disputes the skill.',
      stats: [['Muyong', 'Family forests that feed the water'], ['Gravity', 'Moves water terrace to terrace'], ['Heirloom', 'Native rice varieties still grown']],
      plates: [
        { src: 'terraces.webp', alt: 'Green terraces stepping down a long mountain valley under a blue sky', w: 1157, h: 791, caption: 'Terraces down the valley' },
      ],
      cam: { pos: [16.885, 121.03, 1900], look: [16.918, 121.062, 1150] },
    },
    {
      id: 'ifugao', nav: 'Ifugao', navAlt: 'People', indexLabel: 'The people',
      eyebrow: 'The people of the terraces', title: 'Houses on stilts, songs that last days.',
      body: 'Traditional Ifugao houses stand on four posts, with wooden discs to stop rats climbing up to the rice stored inside. The Ifugao hudhud — long chanted epics sung at harvests and funerals — is recognised by UNESCO as intangible heritage.',
      stats: [['4 posts', 'Raise each house off the ground'], ['Hudhud', 'Chanted epics, sung for days'], ['Bulul', 'Carved rice-granary guardians']],
      plates: [
        { src: 'house.webp', alt: 'A traditional Ifugao house with a steep thatched roof on wooden posts', w: 1600, h: 1067, caption: 'A traditional Ifugao house' },
      ],
      cam: { pos: [16.955, 121.078, 2150], look: [16.976, 121.100, 1000] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 04 — Plan your trip', title: 'Banaue.',
    body: 'Give it three days: one for the Banaue viewpoints, one to hike down to Batad and its waterfall, and one spare for mountain weather.',
    stats: [['~9 hrs', 'Overnight bus from Manila'], ['Guides', 'Hire one for Batad trails'], ['Layers', 'Mornings are cool up here']],
    cam: { pos: [16.86, 121.14, 3200], look: [16.95, 121.07, 1200] },
  },
  trip: {
    getThere: 'Take an overnight bus from Manila to Banaue, about nine hours. Batad is a short ride and a steep hike from town.',
    season: 'February to May for dry trails. The terraces change colour through the planting and harvest cycle.',
    budget: 'Budget. Family homestays and simple guesthouses.',
    mustEat: 'Native red rice grown on the terraces, with etag — Cordillera smoked and cured pork.',
  },
  quiz: {
    q: 'Where does the water for the Ifugao rice terraces come from?',
    options: ['Diesel pumps from the river', 'Forests on the mountaintops above', 'Rainwater tanks on each terrace'], answer: 1,
    hint: 'Look up — what grows above the highest terrace?',
    explain: 'Forests on the peaks catch the rain, and channels lead it down from terrace to terrace.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Banaue Philippines Batad-Rice-Terraces-02",
      "url": "https://commons.wikimedia.org/wiki/File:Banaue_Philippines_Batad-Rice-Terraces-02.jpg",
      "author": "CEphoto, Uwe Aranas",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "plate": "Plate 02",
      "title": "Rice Terraces Banaue",
      "url": "https://commons.wikimedia.org/wiki/File:Rice_Terraces_Banaue.jpg",
      "author": "Magalhães",
      "license": "Public domain",
      "licenseUrl": ""
    },
    {
      "plate": "Plate 03",
      "title": "Ifugao house",
      "url": "https://commons.wikimedia.org/wiki/File:Ifugao_house.jpg",
      "author": "Ma. Yohana R. Frias",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    }
  ],
});
