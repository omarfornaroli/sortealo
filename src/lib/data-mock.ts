
export const RAFFLES = [
  {
    id: 'r1',
    title: 'Porsche 911 Carrera GTS',
    description: 'The pinnacle of German engineering. A brand new Porsche 911 with custom features.',
    prize: 'Porsche 911 Carrera GTS',
    images: ['https://picsum.photos/seed/elite-car/1200/800'],
    drawDate: '2024-12-24T20:00:00Z',
    ticketPrice: 2500,
    maxTickets: 1000000,
    soldTickets: 654321,
    status: 'active',
  },
  {
    id: 'r2',
    title: 'Ducati Panigale V4 S',
    description: 'Speed, elegance, and raw power. The ultimate superbike for adrenaline lovers.',
    prize: 'Ducati Panigale V4 S',
    images: ['https://picsum.photos/seed/elite-moto/1200/800'],
    drawDate: '2024-11-15T18:00:00Z',
    ticketPrice: 1500,
    maxTickets: 500000,
    soldTickets: 423001,
    status: 'active',
  },
  {
    id: 'r3',
    title: 'MacBook Pro M3 Max Bundle',
    description: 'Fully loaded MacBook Pro M3 Max with Studio Display and peripherals.',
    prize: 'Tech Ecosystem Bundle',
    images: ['https://picsum.photos/seed/elite-tech/1200/800'],
    drawDate: '2024-10-30T15:00:00Z',
    ticketPrice: 500,
    maxTickets: 250000,
    soldTickets: 189432,
    status: 'active',
  }
];

export const WINNERS = [
  {
    id: 'w1',
    raffleTitle: 'BMW M5 Competition',
    winnerName: 'Carlos Rodriguez',
    ticketNumber: '782910',
    date: '2024-05-20',
    image: 'https://picsum.photos/seed/winner1/400/400'
  },
  {
    id: 'w2',
    raffleTitle: 'iPhone 15 Pro Max',
    winnerName: 'Sofía Martínez',
    ticketNumber: '003412',
    date: '2024-06-05',
    image: 'https://picsum.photos/seed/winner2/400/400'
  },
  {
    id: 'w3',
    raffleTitle: 'Samsung S24 Ultra',
    winnerName: 'Marcos López',
    ticketNumber: '119283',
    date: '2024-07-12',
    image: 'https://picsum.photos/seed/winner3/400/400'
  }
];

export const FAQ = [
  {
    question: "¿Cómo participo en un sorteo?",
    answer: "Selecciona el sorteo que te guste, elige la cantidad de números o un paquete promocional, completa tus datos y realiza el pago. Una vez confirmado, recibirás tus números por email."
  },
  {
    question: "¿Cuándo se entregan los números?",
    answer: "Los números se generan y asignan automáticamente una vez que el pago es aprobado por Mercado Pago. Esto garantiza que no haya duplicados ni números reservados sin pagar."
  },
  {
    question: "¿Cómo se elige al ganador?",
    answer: "Utilizamos un sistema de generación aleatoria criptográficamente segura. El proceso es auditado y transparente, generando un hash inmutable de cada sorteo."
  }
];
