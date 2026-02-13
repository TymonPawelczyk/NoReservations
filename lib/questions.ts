// Questions for Stage 1: Food preferences
export const stage1Questions = [
  {
    id: 'q1',
    question: 'Na co masz dziś ochotę?',
    options: [
      { value: 'light', label: 'Coś lekkiego', points: { italian: 1, hotpot: 0 } },
      { value: 'hearty', label: 'Coś sytego', points: { italian: 0, hotpot: 1 } },
    ],
  },
  {
    id: 'q2',
    question: 'Jak wolisz jeść?',
    options: [
      { value: 'fork', label: 'Widelcem po kulturze', points: { italian: 1, hotpot: 0 } },
      { value: 'diy', label: 'Gotować przy stole', points: { italian: 0, hotpot: 1 } },
    ],
  },
  {
    id: 'q3',
    question: 'Jakie smaki Cię kręcą?',
    options: [
      { value: 'cheese', label: 'Ser i bazylia', points: { italian: 1, hotpot: 0 } },
      { value: 'spicy', label: 'Ostre i pikantne', points: { italian: 0, hotpot: 1 } },
    ],
  },
  {
    id: 'q4',
    question: 'Co brzmi lepiej?',
    options: [
      { value: 'pasta', label: 'Pizza albo makaron', points: { italian: 1, hotpot: 0 } },
      { value: 'soup', label: 'Gorący bulion', points: { italian: 0, hotpot: 1 } },
    ],
  },
];

// Questions for Stage 2: Activity selection
export const stage2Questions = [
  {
    id: 'q1',
    question: 'Czego potrzebujesz dziś?',
    options: [
      { value: 'culture', label: 'Kultury i sztuki', activity: 'museum' },
      { value: 'fun', label: 'Śmiechu i zabawy', activity: 'funhouse' },
      { value: 'sport', label: 'Ruchu i rywalizacji', activity: 'bowling' },
      { value: 'relax', label: 'Relaksu w wodzie', activity: 'pool' },
    ],
  },
  {
    id: 'q2',
    question: 'Jaki poziom aktywności?',
    options: [
      { value: 'chill', label: 'Spokojnie, oglądamy', activity: 'museum' },
      { value: 'medium', label: 'Trochę się poruszamy', activity: 'funhouse' },
      { value: 'active', label: 'Pełna aktywność!', activity: 'bowling' },
      { value: 'water', label: 'W wodzie', activity: 'pool' },
    ],
  },
  {
    id: 'q3',
    question: 'Jaką atmosferę preferujesz?',
    options: [
      { value: 'quiet', label: 'Cicha i elegancka', activity: 'museum' },
      { value: 'crazy', label: 'Zwariowana!', activity: 'funhouse' },
      { value: 'competitive', label: 'Rywalizacyjna', activity: 'bowling' },
      { value: 'calm', label: 'Spokojna i wodna', activity: 'pool' },
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
];
