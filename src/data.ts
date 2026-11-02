// Catalogue for the demo marketplace. Prices, agents and listings are sample data.

const U = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`
export const img = U

// Photo library (verified Unsplash IDs)
const P = {
  villaPool: '1600596542815-ffad4c1539a9',
  glassHouse: '1600585154340-be6161a56a0c',
  loungeWhite: '1600607687939-ce8a6c25118c',
  timberHouse: '1600566753190-17f0baa2a6c3',
  brickModern: '1600047509807-ba8f99d2cdde',
  palmVilla: '1564013799919-ab600027ffc6',
  cliffVilla: '1512917774080-9991f1c4c750',
  poolLong: '1613490493576-7fde63acd811',
  pinkPool: '1580587771525-78b9dba3b914',
  duskHouse: '1568605114967-8130f3a36994',
  livingSun: '1502672260266-1c1ef2d93688',
  livingRed: '1522708323590-d24dbb6b0267',
  livingOpen: '1560448204-e02f11c3d0e2',
  studioBright: '1493809842364-78817add7ffb',
  kitchen: '1484154218962-a197022b5858',
  livingArt: '1600210492486-724fe5c67fb0',
  bedroomWarm: '1540518614846-7eded433c457',
  bath: '1552321554-5fefe8c9ef14',
  livingBoho: '1505691938895-1758d7feb511',
  penthouseGlass: '1600573472550-8090b5e0745e',
  towerBlue: '1545324418-cc1a3fa10c00',
  towerGlass: '1486406146926-c627a92ad1ab',
  forestHouse: '1449844908441-8829872d2607',
  whiteCubes: '1523217582562-09d0def993a6',
  slimFacade: '1494526585095-c41746248156',
  terracePool: '1599809275671-b5942cabc7a2',
  tram: '1585208798174-6cedd86e019a',
  plaza: '1548707309-dcebeab9ea9b',
  sunsetCity: '1513735492246-483525079686',
  bedroomGrey: '1600607687644-c7171b42498f',
  bathStone: '1600566752355-35792bedcfea',
  blackFacade: '1600585154526-990dced4db0d',
  gardenModern: '1600607688969-a5bfcd646154',
  whiteVilla: '1600563438938-a9a27216b4f5',
  livingNeutral: '1618221195710-dd6b41faaea6',
  bedroomLux: '1616594039964-ae9021a400a0',
  dining: '1617806118233-18e1de247200',
  livingDark: '1600121848594-d8644e57abab',
  livingSofa: '1554995207-c18c203602cb',
} as const
export const photo = P

export type Hood = {
  id: string
  name: string
  vibe: string
  blurb: string
  avg: number // € per m²
  walk: number
  transit: number
  img: string
  // centre on the stylised map (0..100)
  x: number
  y: number
}

export const hoods: Hood[] = [
  { id: 'chiado', name: 'Chiado', vibe: 'Literary & lively', blurb: 'Cafés, bookshops and theatres on cobbled hills.', avg: 8100, walk: 98, transit: 92, img: P.plaza, x: 52, y: 52 },
  { id: 'principe-real', name: 'Príncipe Real', vibe: 'Leafy & refined', blurb: 'Garden squares, concept stores and 19th-century palacetes.', avg: 8900, walk: 94, transit: 80, img: P.livingArt, x: 44, y: 40 },
  { id: 'alfama', name: 'Alfama', vibe: 'Historic & soulful', blurb: 'Fado houses and terraces stacked above the river.', avg: 6400, walk: 90, transit: 74, img: P.tram, x: 66, y: 50 },
  { id: 'estrela', name: 'Estrela', vibe: 'Calm & elegant', blurb: 'Embassies, the basilica and a park made for Sundays.', avg: 7200, walk: 88, transit: 78, img: P.livingNeutral, x: 34, y: 50 },
  { id: 'belem', name: 'Belém', vibe: 'Riverside & open', blurb: 'Monuments, museums and long walks along the Tagus.', avg: 6100, walk: 80, transit: 70, img: P.brickModern, x: 14, y: 70 },
  { id: 'parque', name: 'Parque das Nações', vibe: 'Modern & green', blurb: 'New towers, riverside parks and the best commute east.', avg: 6800, walk: 86, transit: 88, img: P.towerGlass, x: 86, y: 24 },
  { id: 'cascais', name: 'Cascais', vibe: 'Coastal & relaxed', blurb: 'Beaches, villas and a 40-minute train into the city.', avg: 5900, walk: 76, transit: 62, img: P.cliffVilla, x: 4, y: 84 },
]

export type Agent = {
  id: string
  name: string
  role: string
  phone: string
  langs: string[]
  deals: number
  rating: number
  img: string
  focus: string[]
}

export const agents: Agent[] = [
  { id: 'ines', name: 'Inês Moreira', role: 'Senior advisor · Prime homes', phone: '+351 912 000 101', langs: ['PT', 'EN', 'FR'], deals: 142, rating: 4.9, img: '1494790108377-be9c29b29330', focus: ['principe-real', 'chiado', 'estrela'] },
  { id: 'rafael', name: 'Rafael Costa', role: 'New developments', phone: '+351 912 000 102', langs: ['PT', 'EN', 'ES'], deals: 98, rating: 4.8, img: '1507003211169-0a1dd7228f2d', focus: ['parque', 'belem'] },
  { id: 'clara', name: 'Clara Nunes', role: 'Rentals & relocation', phone: '+351 912 000 103', langs: ['PT', 'EN', 'DE'], deals: 211, rating: 4.9, img: '1438761681033-6461ffad8d80', focus: ['alfama', 'chiado'] },
  { id: 'miguel', name: 'Miguel Sousa', role: 'Coastal & villas', phone: '+351 912 000 104', langs: ['PT', 'EN'], deals: 76, rating: 4.7, img: '1500648767791-00dcc994a43e', focus: ['cascais', 'belem'] },
  { id: 'sofia', name: 'Sofia Almeida', role: 'Investors & yields', phone: '+351 912 000 105', langs: ['PT', 'EN', 'IT'], deals: 120, rating: 4.8, img: '1534528741775-53994a69daeb', focus: ['parque', 'alfama'] },
]

export type Kind = 'Apartment' | 'Penthouse' | 'House' | 'Villa' | 'Loft' | 'Studio'
export type Deal = 'buy' | 'rent'

export type Listing = {
  id: string
  title: string
  kind: Kind
  deal: Deal
  price: number // € (rent: per month)
  hood: string
  address: string
  beds: number
  baths: number
  area: number // m²
  year: number
  energy: 'A+' | 'A' | 'B' | 'C'
  floor?: string
  tags: string[]
  features: string[]
  photos: string[]
  agent: string
  blurb: string
  x: number // map position 0..100
  y: number
  listed: number // days ago
}

export const listings: Listing[] = [
  {
    id: 'pr-palacete', title: 'Restored palacete with walled garden', kind: 'House', deal: 'buy', price: 3950000, hood: 'principe-real',
    address: 'Rua da Escola Politécnica', beds: 5, baths: 5, area: 412, year: 1878, energy: 'B', tags: ['Exclusive'],
    features: ['Private garden', 'Original azulejos', 'Wine cellar', 'Lift', 'Garage for 2'],
    photos: [P.whiteVilla, P.livingArt, P.dining, P.bedroomLux, P.bathStone], agent: 'ines',
    blurb: 'A four-storey 19th-century townhouse, rebuilt around a quiet walled garden with an orange tree and a heated plunge pool.',
    x: 43, y: 38, listed: 3,
  },
  {
    id: 'ch-loft', title: 'Skylit loft above Rua Garrett', kind: 'Loft', deal: 'buy', price: 890000, hood: 'chiado',
    address: 'Rua Garrett', beds: 2, baths: 2, area: 118, year: 1910, energy: 'A', floor: '5th', tags: ['New'],
    features: ['Double-height ceiling', 'River glimpse', 'Lift', 'Underfloor heating'],
    photos: [P.livingOpen, P.kitchen, P.bedroomGrey, P.bath], agent: 'clara',
    blurb: 'Top-floor loft with exposed beams and a long skylight — five minutes on foot to the river and the opera.',
    x: 53, y: 53, listed: 1,
  },
  {
    id: 'pn-tower', title: 'Riverfront penthouse, 22nd floor', kind: 'Penthouse', deal: 'buy', price: 2150000, hood: 'parque',
    address: 'Av. D. João II', beds: 4, baths: 4, area: 268, year: 2024, energy: 'A+', floor: '22nd', tags: ['New build', '360° view'],
    features: ['Wraparound terrace', 'Concierge', 'Gym & spa', 'EV charging', 'Smart home'],
    photos: [P.towerGlass, P.penthouseGlass, P.livingDark, P.bedroomLux, P.bathStone], agent: 'rafael',
    blurb: 'Glass corner penthouse with a 140 m² terrace facing the Tagus and the Vasco da Gama bridge.',
    x: 85, y: 22, listed: 6,
  },
  {
    id: 'al-terrace', title: 'Alfama flat with river terrace', kind: 'Apartment', deal: 'rent', price: 2400, hood: 'alfama',
    address: 'Largo das Portas do Sol', beds: 2, baths: 1, area: 84, year: 1890, energy: 'B', floor: '3rd', tags: ['Furnished'],
    features: ['Terrace', 'Furnished', 'Fibre internet', 'Pets allowed'],
    photos: [P.livingSun, P.bedroomWarm, P.kitchen, P.tram], agent: 'clara',
    blurb: 'Bright two-bedroom with a private terrace over the rooftops — evening light all year round.',
    x: 67, y: 49, listed: 2,
  },
  {
    id: 'ca-cliff', title: 'Clifftop villa with infinity pool', kind: 'Villa', deal: 'buy', price: 4800000, hood: 'cascais',
    address: 'Estrada do Guincho', beds: 6, baths: 7, area: 520, year: 2021, energy: 'A+', tags: ['Ocean view', 'Exclusive'],
    features: ['Infinity pool', 'Home cinema', 'Staff quarters', 'Solar array', 'Garage for 4'],
    photos: [P.cliffVilla, P.poolLong, P.livingNeutral, P.bedroomLux, P.bath], agent: 'miguel',
    blurb: 'Contemporary villa set into the cliffs above Guincho, every room oriented to the Atlantic.',
    x: 5, y: 82, listed: 12,
  },
  {
    id: 'es-garden', title: 'Garden duplex facing Jardim da Estrela', kind: 'Apartment', deal: 'buy', price: 1290000, hood: 'estrela',
    address: 'Praça da Estrela', beds: 3, baths: 3, area: 176, year: 1935, energy: 'B', floor: 'Ground + 1', tags: ['Price drop'],
    features: ['Private garden', 'Fireplace', 'Storage room', 'Lift'],
    photos: [P.gardenModern, P.livingBoho, P.dining, P.bedroomWarm], agent: 'ines',
    blurb: 'Duplex with its own garden opposite the park — high ceilings, herringbone floors and a fireplace.',
    x: 34, y: 49, listed: 21,
  },
  {
    id: 'be-river', title: 'Riverside house near the monastery', kind: 'House', deal: 'buy', price: 1680000, hood: 'belem',
    address: 'Rua de Belém', beds: 4, baths: 3, area: 230, year: 2018, energy: 'A', tags: [],
    features: ['Roof terrace', 'Patio', 'Garage', 'Home office'],
    photos: [P.brickModern, P.livingSofa, P.kitchen, P.bedroomGrey], agent: 'miguel',
    blurb: 'Quiet modern house two streets from the river, with a roof terrace that catches the sunset.',
    x: 15, y: 68, listed: 9,
  },
  {
    id: 'pn-rent', title: 'Light-filled flat by the Oceanário', kind: 'Apartment', deal: 'rent', price: 2100, hood: 'parque',
    address: 'Alameda dos Oceanos', beds: 2, baths: 2, area: 98, year: 2019, energy: 'A', floor: '7th', tags: ['Balcony'],
    features: ['Balcony', 'Pool', 'Parking', 'Concierge'],
    photos: [P.towerBlue, P.studioBright, P.bedroomWarm, P.bath], agent: 'sofia',
    blurb: 'Two-bed in a residence with a shared pool, minutes from the metro and the river park.',
    x: 88, y: 28, listed: 4,
  },
  {
    id: 'ch-studio', title: 'Designer studio on Largo do Carmo', kind: 'Studio', deal: 'rent', price: 1350, hood: 'chiado',
    address: 'Largo do Carmo', beds: 0, baths: 1, area: 38, year: 1905, energy: 'C', floor: '2nd', tags: ['Furnished'],
    features: ['Furnished', 'Bills included', 'Fibre internet'],
    photos: [P.studioBright, P.livingRed, P.bath], agent: 'clara',
    blurb: 'A compact, fully furnished studio overlooking the Carmo convent — move in with a suitcase.',
    x: 55, y: 50, listed: 1,
  },
  {
    id: 'ca-family', title: 'Family house with pool in Quinta da Marinha', kind: 'Villa', deal: 'buy', price: 2650000, hood: 'cascais',
    address: 'Quinta da Marinha', beds: 5, baths: 5, area: 380, year: 2016, energy: 'A', tags: ['Golf'],
    features: ['Pool', 'Garden', 'Golf access', 'Guest suite'],
    photos: [P.palmVilla, P.terracePool, P.livingNeutral, P.bedroomWarm], agent: 'miguel',
    blurb: 'Walled family villa on a golf estate, with a pool garden and a separate guest suite.',
    x: 8, y: 78, listed: 15,
  },
  {
    id: 'pr-apt', title: 'Classic apartment on the garden square', kind: 'Apartment', deal: 'rent', price: 3600, hood: 'principe-real',
    address: 'Praça do Príncipe Real', beds: 3, baths: 2, area: 150, year: 1902, energy: 'B', floor: '2nd', tags: ['Furnished'],
    features: ['Balcony', 'Fireplace', 'Furnished', 'Lift'],
    photos: [P.livingArt, P.dining, P.bedroomGrey, P.bathStone], agent: 'ines',
    blurb: 'Grand second-floor apartment with balconies over the square and its century-old cedar.',
    x: 45, y: 41, listed: 7,
  },
  {
    id: 'al-invest', title: 'Renovated building, four units', kind: 'Apartment', deal: 'buy', price: 1450000, hood: 'alfama',
    address: 'Rua de São Miguel', beds: 6, baths: 4, area: 260, year: 1900, energy: 'B', tags: ['Investment', '5.8% yield'],
    features: ['4 licensed units', 'Rented', 'Roof terrace'],
    photos: [P.slimFacade, P.livingSun, P.kitchen, P.bedroomWarm], agent: 'sofia',
    blurb: 'Whole building converted into four short-let apartments, fully licensed and currently earning.',
    x: 68, y: 52, listed: 30,
  },
  {
    id: 'es-pent', title: 'Penthouse with basilica views', kind: 'Penthouse', deal: 'buy', price: 1890000, hood: 'estrela',
    address: 'Rua de São Bento', beds: 3, baths: 3, area: 190, year: 2022, energy: 'A+', floor: '6th', tags: ['New build'],
    features: ['Terrace', 'Private lift', 'Parking', 'Smart home'],
    photos: [P.blackFacade, P.livingDark, P.bedroomLux, P.bathStone], agent: 'rafael',
    blurb: 'New-build penthouse whose terrace frames the dome of the Estrela basilica.',
    x: 37, y: 46, listed: 5,
  },
  {
    id: 'be-house', title: 'Modern house with pool, Restelo', kind: 'House', deal: 'rent', price: 6800, hood: 'belem',
    address: 'Av. do Restelo', beds: 4, baths: 4, area: 300, year: 2020, energy: 'A', tags: ['Pool'],
    features: ['Pool', 'Garden', 'Garage', 'Furnished'],
    photos: [P.villaPool, P.glassHouse, P.livingNeutral, P.bedroomGrey], agent: 'miguel',
    blurb: 'Contemporary family house in Restelo with a pool garden and views down to the river.',
    x: 12, y: 62, listed: 8,
  },
  {
    id: 'pn-new', title: 'New-build 1-bed with park view', kind: 'Apartment', deal: 'buy', price: 465000, hood: 'parque',
    address: 'Rua do Bojador', beds: 1, baths: 1, area: 62, year: 2025, energy: 'A+', floor: '4th', tags: ['New build'],
    features: ['Balcony', 'Parking', 'Storage', 'Heat pump'],
    photos: [P.whiteCubes, P.studioBright, P.bedroomWarm, P.bath], agent: 'rafael',
    blurb: 'Efficient new-build one-bedroom facing the river park, ready this spring.',
    x: 83, y: 18, listed: 2,
  },
  {
    id: 'ca-coast', title: 'Coastal townhouse near the marina', kind: 'House', deal: 'buy', price: 1150000, hood: 'cascais',
    address: 'Rua da Marina', beds: 3, baths: 3, area: 170, year: 2012, energy: 'B', tags: ['Sea view'],
    features: ['Sea view', 'Patio', 'Garage'],
    photos: [P.duskHouse, P.livingBoho, P.bedroomWarm, P.bath], agent: 'miguel',
    blurb: 'Townhouse a short walk from the marina, with a sea-view bedroom and a sheltered patio.',
    x: 3, y: 86, listed: 18,
  },
  {
    id: 'ch-apt', title: 'Pombaline apartment with river view', kind: 'Apartment', deal: 'buy', price: 1340000, hood: 'chiado',
    address: 'Rua do Alecrim', beds: 3, baths: 2, area: 140, year: 1780, energy: 'B', floor: '4th', tags: ['River view'],
    features: ['River view', 'Lift', 'High ceilings', 'Balconies'],
    photos: [P.plaza, P.livingOpen, P.dining, P.bedroomGrey], agent: 'ines',
    blurb: 'Restored Pombaline flat with tall windows framing the Tagus from every room on the street side.',
    x: 50, y: 56, listed: 11,
  },
  {
    id: 'es-forest', title: 'Timber house in a private garden', kind: 'House', deal: 'buy', price: 2290000, hood: 'estrela',
    address: 'Rua do Patrocínio', beds: 4, baths: 4, area: 250, year: 2023, energy: 'A+', tags: ['Architect-designed'],
    features: ['Garden', 'Sauna', 'Studio', 'Garage'],
    photos: [P.timberHouse, P.forestHouse, P.livingSofa, P.bedroomLux], agent: 'rafael',
    blurb: 'Architect-designed house in timber and glass, hidden behind a garden wall in Campo de Ourique.',
    x: 30, y: 44, listed: 4,
  },
]

export const byId = (id: string) => listings.find((l) => l.id === id)
export const hoodOf = (id: string) => hoods.find((h) => h.id === id)!
export const agentOf = (id: string) => agents.find((a) => a.id === id)!

export const euro = (n: number) =>
  n >= 1_000_000
    ? `€${(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 0).replace(/\.?0+$/, '')}M`
    : `€${n.toLocaleString('en-GB')}`
export const priceLabel = (l: Listing) => (l.deal === 'rent' ? `${euro(l.price)}/mo` : euro(l.price))

export const compareRows: [string, (l: Listing) => string][] = [
  ['Price', priceLabel],
  ['€ / m²', (l) => (l.deal === 'buy' ? euro(Math.round(l.price / l.area)) : `${euro(Math.round((l.price / l.area) * 10) / 10)}/mo`)],
  ['Area', (l) => `${l.area} m²`],
  ['Bedrooms', (l) => (l.beds ? String(l.beds) : 'Studio')],
  ['Bathrooms', (l) => String(l.baths)],
  ['Neighbourhood', (l) => hoodOf(l.hood).name],
  ['Built', (l) => String(l.year)],
  ['Energy', (l) => l.energy],
  ['Highlights', (l) => l.features.slice(0, 3).join(', ')],
]
