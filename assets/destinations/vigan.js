PH.register({
  id: 'vigan', name: 'Vigan', region: 'Ilocos Sur · Ilocos Region', province: 'Ilocos Sur',
  hook: 'Cobblestones, carriages and Spanish-era mansions', bestMonths: 'Nov – Apr',
  mapPin: [17.57, 120.387], seed: 19, sunDir: [-1, .08, .05],
  terrain: {
    vScale: 2.5, beachM: 5,
    colors: { greens: ['#3a5a26', '#46662a', '#52702e', '#5e7a34'], sand: '#b9a479' },
  },
  landmarks: [
    { kind: 'houses', at: [17.5713, 120.3873], heading: 0, count: 26, spacingM: 40, scale: .5 },
    { kind: 'houses', area: [17.555, 120.375, 17.585, 120.400], count: 70, maxM: 40, scale: .4 },
    { kind: 'kalesa', at: [17.5703, 120.3874], heading: 0, scale: .5 },
    { kind: 'kalesa', at: [17.5722, 120.3872], heading: 180, scale: .5 },
    { kind: 'cityLights', area: [17.555, 120.375, 17.590, 120.405], count: 600, maxM: 40 },
    { kind: 'palms', area: [17.50, 120.33, 17.64, 120.37], count: 90, maxM: 15 },
  ],
  hero: {
    eyebrow: 'Chapter 00 — Vigan, Ilocos Sur', title: 'A Spanish-era town, still lived in.',
    sub: 'On the north-west coast of Luzon, Vigan kept its grid of cobbled streets and grand old houses — a living town, not a museum.',
    wordmark: 'VIGAN', side: 'ILOCANDIA',
    plate: { src: 'crisologo.webp', alt: 'A two-storey colonial house with a stone ground floor and wooden upper floor', w: 1600, h: 1200, caption: 'Calle Crisologo' },
    cam: { pos: [17.548, 120.418, 320], look: [17.572, 120.387, 10] },
  },
  sections: [
    {
      id: 'crisologo', nav: 'Crisologo', navAlt: 'Old town', indexLabel: 'The street',
      eyebrow: 'World Heritage', title: 'Calle Crisologo after dark.',
      body: 'Vigan is the best-preserved Spanish colonial town in Asia, says UNESCO, which listed it in 1999. Its houses blend Spanish, Ilocano and Chinese styles: stone below for the heat, wood and capiz-shell windows above.',
      stats: [['1999', 'Inscribed as World Heritage'], ['1572', 'Founded as a Spanish town'], ['Capiz', 'Shell windows that glow at night']],
      plates: [
        { src: 'crisologo.webp', alt: 'A two-storey colonial house with a stone ground floor and wooden upper floor', w: 1600, h: 1200, caption: 'An old house on Calle Crisologo' },
      ],
      cam: { pos: [17.5665, 120.3905, 60], look: [17.5713, 120.3873, 0] },
    },
    {
      id: 'kalesa', nav: 'Kalesa', navAlt: 'Carriages', indexLabel: 'The kalesa',
      eyebrow: 'Clip-clop', title: 'See it all by kalesa.',
      body: 'Horse-drawn kalesas still roll over the cobblestones. Hire one for an hour and the driver will loop you past the cathedral, the plazas, the pottery kilns and the old bell tower of Bantay.',
      stats: [['1 hour', 'A good first loop of town'], ['Burnay', 'Earthen jars fired in old kilns'], ['Bantay', 'Bell tower on a hill nearby']],
      plates: [
        { src: 'kalesa.webp', alt: 'A horse-drawn kalesa on a tree-lined street in Vigan', w: 1600, h: 720, caption: 'A kalesa in the town centre' },
      ],
      cam: { pos: [17.5688, 120.3900, 130], look: [17.5712, 120.3873, 0] },
    },
    {
      id: 'empanada', nav: 'Empanada', navAlt: 'Food', indexLabel: 'The food',
      eyebrow: 'Ilocano kitchen', title: 'The bright-orange empanada.',
      body: 'Vigan\'s empanada is fried to a crunch in a rice-flour shell coloured with annatto, then stuffed with grated green papaya, egg and garlicky Vigan longganisa. Douse it in sukang Iloko — sugarcane vinegar — and eat it hot from the plaza stalls.',
      stats: [['Annatto', 'Gives the shell its colour'], ['Longganisa', 'Vigan\'s garlicky sausage'], ['Sukang Iloko', 'Cane vinegar for dipping']],
      plates: [
        { src: 'empanada.webp', alt: 'Bright orange fried empanadas stacked in a wire basket', w: 1600, h: 900, caption: 'Ilocos empanada' },
      ],
      cam: { pos: [17.583, 120.402, 220], look: [17.570, 120.386, 0] },
    },
  ],
  finale: {
    eyebrow: 'Chapter 04 — Plan your trip', title: 'Vigan.',
    body: 'Stay in a heritage house inside the old town, walk Calle Crisologo after dark when the lamps come on, and eat your way around the plaza.',
    stats: [['2 days', 'Enough for the town and Bantay'], ['Walk', 'The old town is compact'], ['Night', 'When the lamps come on']],
    cam: { pos: [17.515, 120.455, 1300], look: [17.57, 120.38, 0] },
  },
  trip: {
    getThere: 'Fly to Laoag (LAO) and drive about two hours south, or take an overnight bus from Manila.',
    season: 'November to April, the dry months.',
    budget: 'Budget to mid-range, with heritage hotels in old houses.',
    mustEat: 'Vigan empanada and crispy bagnet (deep-fried pork belly), with sukang Iloko.',
  },
  quiz: {
    q: 'Which colonial power shaped Vigan\'s old town?',
    options: ['Spain', 'Portugal', 'The Netherlands'], answer: 0,
    hint: 'The street is called “Calle” Crisologo.',
    explain: 'Vigan was founded as a Spanish colonial town in 1572, and its houses mix Spanish, Ilocano and Chinese styles.',
  },
  credits: [
    {
      "plate": "Plate 01",
      "title": "Vigan Calle Crisologo 1",
      "url": "https://commons.wikimedia.org/wiki/File:Vigan_Calle_Crisologo_1.jpg",
      "author": "Simon Burchell",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "plate": "Plate 02",
      "title": "A kalesa in Vigan",
      "url": "https://commons.wikimedia.org/wiki/File:A_kalesa_in_Vigan.jpg",
      "author": "ShiminUfesoj",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "plate": "Plate 03",
      "title": "Ilocos Empanada in Batac, Ilocos Norte",
      "url": "https://commons.wikimedia.org/wiki/File:Ilocos_Empanada_in_Batac,_Ilocos_Norte.jpg",
      "author": "Lokalpedia",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
});
