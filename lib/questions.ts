// Questions for Stage 1: Food preferences
export const stage1Questions = [
  {
    id: 'q1',
    question: 'Na co masz dziś ochotę?',
    options: [
      { value: 'light', label: 'Coś lekkiego', points: { italian: 1, hotpot: 0, sushi: 2 } },
      { value: 'hearty', label: 'Coś sytego', points: { italian: 0, hotpot: 2, sushi: 0 } },
      { value: 'fresh', label: 'Coś świeżego', points: { italian: 0, hotpot: 0, sushi: 2 } },
    ],
  },
  {
    id: 'q2',
    question: 'Jak wolisz jeść?',
    options: [
      { value: 'fork', label: 'Widelcem kulturalnie', points: { italian: 2, hotpot: 0, sushi: 0 } },
      { value: 'diy', label: 'Gotować przy stole', points: { italian: 0, hotpot: 2, sushi: 0 } },
      { value: 'chopsticks', label: 'Pałeczkami', points: { italian: 0, hotpot: 1, sushi: 2 } },
      { value: 'hands', label: 'Rękami', points: { italian: 2, hotpot: 0, sushi: 1 } },
    ],
  },
  {
    id: 'q3',
    question: 'Jakie smaki Cię kręcą?',
    options: [
      { value: 'cheese', label: 'Ser i bazylia', points: { italian: 2, hotpot: 0, sushi: 0 } },
      { value: 'spicy', label: 'Ostre i pikantne', points: { italian: 0, hotpot: 2, sushi: 0 } },
      { value: 'umami', label: 'Delikatne, umami', points: { italian: 0, hotpot: 0, sushi: 2 } },
    ],
  },
  {
    id: 'q4',
    question: 'Co brzmi lepiej?',
    options: [
      { value: 'pasta', label: 'Pizza albo makaron', points: { italian: 2, hotpot: 0, sushi: 0 } },
      { value: 'soup', label: 'Gorący bulion', points: { italian: 0, hotpot: 2, sushi: 0 } },
      { value: 'raw', label: 'Surowa ryba', points: { italian: 0, hotpot: 0, sushi: 2 } },
    ],
  },
  {
    id: 'q5',
    question: 'Temperatura jedzenia?',
    options: [
      { value: 'hot', label: 'Gorące, wręcz wrzące', points: { italian: 1, hotpot: 2, sushi: 0 } },
      { value: 'warm', label: 'Ciepłe', points: { italian: 2, hotpot: 1, sushi: 0 } },
      { value: 'cold', label: 'Zimne też jest OK', points: { italian: 0, hotpot: 0, sushi: 2 } },
    ],
  },
  {
    id: 'q6',
    question: 'Co z sosami?',
    options: [
      { value: 'tomato', label: 'Pomidorowy sos', points: { italian: 2, hotpot: 0, sushi: 0 } },
      { value: 'broth', label: 'Intensywny bulion', points: { italian: 0, hotpot: 2, sushi: 0 } },
      { value: 'soy', label: 'Sos sojowy i wasabi', points: { italian: 0, hotpot: 0, sushi: 2 } },
    ],
  },
];

// Questions for Stage 2: Activity selection
export const stage2Questions = [
  {
    id: 'q1',
    question: 'Czego dziś potrzebujesz?',
    options: [
      { value: 'culture', label: 'Kultury i sztuki', points: { museum: 2, walk: 0, bowling: 0, pool: 0, picnic: 0 } },
      { value: 'fresh_air', label: 'Świeżego powietrza', points: { museum: 0, walk: 2, bowling: 0, pool: 0, picnic: 0 } },
      { value: 'sport', label: 'Ruchu i rywalizacji', points: { museum: 0, walk: 0, bowling: 2, pool: 1, picnic: 0 } },
      { value: 'intimacy', label: 'Relaksu i intymności', points: { museum: 0, walk: 0, bowling: 0, pool: 1, picnic: 2 } },
    ],
  },
  {
    id: 'q2',
    question: 'Jaki poziom aktywności?',
    options: [
      { value: 'chill', label: 'Spokojnie, bez ruchu', points: { museum: 2, walk: 0, bowling: 0, pool: 0, picnic: 2 } },
      { value: 'light', label: 'Spacer, lekki ruch', points: { museum: 0, walk: 2, bowling: 0, pool: 1, picnic: 0 } },
      { value: 'medium', label: 'Trochę się poruszamy', points: { museum: 0, walk: 1, bowling: 1, pool: 1, picnic: 0 } },
      { value: 'active', label: 'Pełna aktywność!', points: { museum: 0, walk: 0, bowling: 1, pool: 2, picnic: 0 } },
    ],
  },
  {
    id: 'q3',
    question: 'Jaką atmosferę preferujesz?',
    options: [
      { value: 'elegant', label: 'Cicha i elegancka', points: { museum: 2, walk: 0, bowling: 0, pool: 1, picnic: 1 } },
      { value: 'romantic', label: 'Romantyczna i intymna', points: { museum: 0, walk: 1, bowling: 0, pool: 0, picnic: 2 } },
      { value: 'competitive', label: 'Aktywna i rywalizacyjna', points: { museum: 0, walk: 0, bowling: 2, pool: 1, picnic: 0 } },
      { value: 'calm', label: 'Spokojna i relaksująca', points: { museum: 1, walk: 1, bowling: 0, pool: 2, picnic: 1 } },
    ],
  },
  {
    id: 'q4',
    question: 'Wolisz spędzać czas:',
    options: [
      { value: 'indoors', label: 'Poza domem', points: { museum: 1, walk: 0, bowling: 1, pool: 0, picnic: 0 } },
      { value: 'home', label: 'W domu', points: { museum: 0, walk: 0, bowling: 0, pool: 0, picnic: 2 } },
      { value: 'outdoors', label: 'Na świeżym powietrzu', points: { museum: 0, walk: 2, bowling: 0, pool: 1, picnic: 0 } },
      { value: 'water', label: 'W wodzie', points: { museum: 0, walk: 0, bowling: 0, pool: 2, picnic: 0 } },
    ],
  },
  {
    id: 'q5',
    question: 'To co finalnie?',
    options: [
      { value: 'museum', label: '🎨 Muzeum', points: { museum: 2, walk: 0, bowling: 0, pool: 0, picnic: 0 } },
      { value: 'walk', label: '🚶 Spacer', points: { museum: 0, walk: 2, bowling: 0, pool: 0, picnic: 0 } },
      { value: 'bowling', label: '🎳 Kręgle', points: { museum: 0, walk: 0, bowling: 2, pool: 0, picnic: 0 } },
      { value: 'pool', label: '🏊 Basen', points: { museum: 0, walk: 0, bowling: 0, pool: 2, picnic: 0 } },
      { value: 'picnic', label: '🧺 Piknik w domu', points: { museum: 0, walk: 0, bowling: 0, pool: 0, picnic: 2 } },
      { value: 'cinema', label: '🎬 Kino', points: { museum: 0, walk: 0, bowling: 0, pool: 0, picnic: 0 } }, // Easter egg
    ],
  },
];

// Questions for Stage 3: Quiz
export const stage3Questions = [
  {
    id: 'q1',
    question: 'Który film wygrał Oscara w 2020?',
    options: [
      { value: 'parasite', label: 'Parasite', correct: true },
      { value: 'joker', label: 'Joker', correct: false },
      { value: '1917', label: '1917', correct: false },
    ],
  },
  {
    id: 'q2',
    question: 'Stolica Australii to:',
    options: [
      { value: 'sydney', label: 'Sydney', correct: false },
      { value: 'canberra', label: 'Canberra', correct: true },
      { value: 'melbourne', label: 'Melbourne', correct: false },
    ],
  },
  {
    id: 'q3',
    question: 'Ile planet w Układzie Słonecznym?',
    options: [
      { value: '7', label: '7', correct: false },
      { value: '8', label: '8', correct: true },
      { value: '9', label: '9', correct: false },
    ],
  },
  {
    id: 'q4',
    question: 'Kto napisał "Romeo i Julia"?',
    options: [
      { value: 'shakespeare', label: 'Shakespeare', correct: true },
      { value: 'dickens', label: 'Dickens', correct: false },
      { value: 'wilde', label: 'Wilde', correct: false },
    ],
  },
  {
    id: 'q5',
    question: 'W którym roku spadł mur berliński?',
    options: [
      { value: '1987', label: '1987', correct: false },
      { value: '1989', label: '1989', correct: true },
      { value: '1991', label: '1991', correct: false },
    ],
  },
  {
    id: 'q6',
    question: 'Który ocean jest największy?',
    options: [
      { value: 'atlantic', label: 'Atlantycki', correct: false },
      { value: 'pacific', label: 'Spokojny', correct: true },
      { value: 'indian', label: 'Indyjski', correct: false },
    ],
  },
  {
    id: 'q7',
    question: 'Ile kości ma dorosły człowiek?',
    options: [
      { value: '186', label: '186', correct: false },
      { value: '206', label: '206', correct: true },
      { value: '226', label: '226', correct: false },
    ],
  },
  {
    id: 'q8',
    question: 'Kto namalował "Gwiaździstą noc"?',
    options: [
      { value: 'monet', label: 'Monet', correct: false },
      { value: 'vangogh', label: 'Van Gogh', correct: true },
      { value: 'picasso', label: 'Picasso', correct: false },
    ],
  },
  {
    id: 'q9',
    question: 'Jaki jest najdłuższy river na świecie?',
    options: [
      { value: 'amazon', label: 'Amazonka', correct: false },
      { value: 'nile', label: 'Nil', correct: true },
      { value: 'mississippi', label: 'Missisipi', correct: false },
    ],
  },
  {
    id: 'q10',
    question: 'W jakim kraju znajduje się Machu Picchu?',
    options: [
      { value: 'bolivia', label: 'Boliwia', correct: false },
      { value: 'peru', label: 'Peru', correct: true },
      { value: 'colombia', label: 'Kolumbia', correct: false },
    ],
  },
  {
    id: 'q11',
    question: 'Ile wynosi prędkość światła (w przybliżeniu)?',
    options: [
      { value: '200k', label: '200 000 km/s', correct: false },
      { value: '300k', label: '300 000 km/s', correct: true },
      { value: '400k', label: '400 000 km/s', correct: false },
    ],
  },
  {
    id: 'q12',
    question: 'Który pierwiastek ma symbol "Au"?',
    options: [
      { value: 'silver', label: 'Srebro', correct: false },
      { value: 'gold', label: 'Złoto', correct: true },
      { value: 'copper', label: 'Miedź', correct: false },
    ],
  },
];
