// Single source of truth for facts used on the site.
// status: 'public' = public source on file · 'confirm' = from aerpace material in the brief, confirm before launch
export const COMPANY = {
  name: 'Aerpace Industries Ltd',
  exchange: 'BSE',
  scrip: '534733',
  hub: 'Pune',
  hubCoords: '18.52°N 73.86°E',
};

// at = position on the plan view (fraction of the v-top render, nose pointing down)
export const SPECS = [
  { key: 'vtol', mark: 'A', value: 'VTOL', label: 'Vertical take-off and landing', note: 'No runway. Up from the pad, down onto the pad.', status: 'confirm', at: [0.225, 0.24] },
  { key: 'h2', mark: 'B', value: 'H₂', label: 'Hydrogen-powered', note: 'Green hydrogen, produced at the dock.', status: 'public', at: [0.5, 0.3] },
  { key: 'speed', mark: 'C', value: '200', unit: 'km/h', label: 'Cruising speed', note: 'Straight lines, not ring roads.', status: 'public', at: [0.5, 0.9] },
  { key: 'range', mark: 'D', value: '500', unit: 'km', label: 'Range', note: 'City to city on one fill.', status: 'confirm', at: [0.94, 0.3] },
  { key: 'weight', mark: 'E', value: '1.5', unit: 't', label: 'Maximum weight', note: 'People, care or cargo.', status: 'confirm', at: [0.13, 0.5] },
];

export const TURNTABLE = [
  { view: 'side', label: 'Side', file: 'v-side.webp', spec: 'speed' },
  { view: 'three', label: '3/4', file: 'v-three.webp', spec: 'range' },
  { view: 'front', label: 'Front', file: 'v-front.webp', spec: 'vtol' },
  { view: 'top', label: 'Plan', file: 'v-top.webp', spec: 'weight' },
  { view: 'hover', label: 'Above', file: 'v-hover.webp', spec: 'h2' },
];

export const POWER = [
  { name: 'Sunlight', short: 'Sun', line: 'aerVolt solar panels over the dock roof.' },
  { name: 'Green hydrogen', short: 'H₂', line: 'Made at the dock, from sunlight and water.' },
  { name: 'Electric fans', short: 'Fans', line: 'Hydrogen energy drives ducted fans in the wings and the tail.' },
  { name: 'Back to the dock', short: 'Dock', line: 'Land, refuel between flights, leave again.' },
];

export const ECOSYSTEM = [
  { slug: 'aerwing', name: 'aerWing', tag: 'Aircraft', img: 'media/img/studio-side.webp',
    line: 'Hydrogen-powered aerial platform for personal transport, air taxis, cargo and emergency response.' },
  { slug: 'aerdock', name: 'aerDock', tag: 'Infrastructure', img: 'media/img/dock-core-day.webp',
    line: 'Hubs for autonomous transport, charging, green hydrogen, refuelling, logistics and maintenance.' },
  { slug: 'aercar', name: 'aerCar', tag: 'Ground', img: 'media/img/dock-tunnel.webp',
    line: 'Covers the first and last mile and hands the journey to the aircraft.' },
  { slug: 'aervolt', name: 'aerVolt', tag: 'Energy', img: 'media/img/volt-plants.webp',
    line: 'AI-enabled solar that powers the docks and makes green hydrogen.' },
  { slug: 'aershield', name: 'aerShield', tag: 'Defence', img: 'media/img/shield-s3.webp',
    line: 'Indigenous autonomous systems for surveillance and tactical logistics.' },
  { slug: 'aeros', name: 'aerOS', tag: 'Software', img: 'media/img/shield-os.webp',
    line: 'The in-house software that keeps every part of the network in sync.' },
];

export const MENU_GROUPS = [
  ['Fly', [['aerwing', 'aerWing'], ['aerdock', 'aerDock'], ['aerverse', 'aerVerse']]],
  ['Ecosystem', [['aercar', 'aerCar'], ['aervolt', 'aerVolt'], ['aershield', 'aerShield'], ['aeros', 'aerOS']]],
  ['Company', [['about', 'About'], ['rnd', 'R&D + Manufacturing'], ['projects', 'Projects'], ['racers', 'aerpace Racers'], ['maketime', '#MakeTime'], ['sustainability', 'Sustainability']]],
  ['Connect', [['newsroom', 'Newsroom'], ['events', 'Events'], ['investors', 'Investors'], ['careers', 'Careers'], ['resources', 'Resources'], ['contact', 'Contact']]],
];

export const NEWS = [
  { date: '2026-06-30', label: '30 Jun 2026', cat: 'coverage', catLabel: 'Coverage', img: 'media/img/valley.webp',
    title: 'aerpace outlines aerVerse: six verticals, one ecosystem',
    body: 'aerWing, aerCar, aerDock, aerVolt, aerShield and aerOS, described as one connected framework for mobility and energy.',
    source: 'ScanX', url: 'https://scanx.trade/stock-market-news/companies/aerpace-industries-outlines-aerverse-ecosystem-connecting-mobility-and-energy/44386369' },
  { date: '2025-08-12', label: '12 Aug 2025', cat: 'coverage', catLabel: 'Coverage', img: 'media/img/volt-business.webp',
    title: 'Pune hub completes core infrastructure',
    body: 'Manufacturing, R&D and administration in one hub. Solar line equipment delivered; aerRecon and aerStriker prototypes complete.',
    source: 'DSIJ', url: 'https://insights.dsij.in/dsijarticledetail/penny-stock-hit-upper-circuit-after-company-updates-on-pune-facility-solar-line-commissioning-defense-drones-demos-and-urban-air-mobility-plans-id001-51609' },
  { date: '2024-09-29', label: '29 Sep 2024', cat: 'coverage', catLabel: 'Coverage', img: 'media/img/dock-glass.webp',
    title: 'Exclusive Middle East partnership for aerWing',
    body: 'Distribution rights for aerWing and a dedicated R&D centre in the region.',
    source: 'DSIJ', url: 'https://insights.dsij.in/dsijarticledetail/drone-penny-stock-at-rs-5080-hit-upper-circuit-52-week-high-as-company-enters-into-agreement-with-a-prominent-company-in-the-middle-east-id001-42519' },
];

export const CONFIGS = [
  { key: 'drive', code: 'DRV', name: 'aerDrive', use: 'Personal', verb: 'Drive in. Fly out.',
    copy: 'Your car docks into aerWing and the trip carries on in the air. You never change seats.',
    scene: 'Home → airport, without leaving the car', media: { type: 'video', src: 'media/video/drive-holo.mp4', poster: 'media/video/drive-holo.jpg' } },
  { key: 'taxi', code: 'TXI', name: 'aerTaxi', use: 'Air taxi', verb: 'Book a seat. Skip the city.',
    copy: 'A shared cabin between docks, above the traffic, at the price of a seat.',
    scene: 'Across the city, dock to dock', media: { type: 'img', src: 'media/img/cfg-taxi.webp' } },
  { key: 'care', code: 'CRE', name: 'aerCare', use: 'Emergency response', verb: 'When minutes decide.',
    copy: 'A medical configuration that flies straight to where help is needed, with nothing in the way.',
    scene: 'Hospital → remote district', media: { type: 'img', src: 'media/img/cfg-care.webp' } },
  { key: 'cargo', code: 'CGO', name: 'aerCargo', use: 'Logistics', verb: 'Freight, off the highway.',
    copy: 'A cargo module in place of the cabin. Loads leave the road network behind.',
    scene: 'Port → industrial zone', media: { type: 'cargo' } },
];

export const SAFETY = [
  { key: 'battery', name: 'Backup batteries', line: 'Reserve power kept apart from the primary supply, so the aircraft always has enough to land.' },
  { key: 'thrust', name: 'Cold gas thrusters', line: 'Compressed-gas thrusters that steady the aircraft in an emergency.' },
  { key: 'sense', name: 'Collision avoidance', line: 'Sensors watch the airspace around the aircraft, all the time.' },
  { key: 'fire', name: 'Automated fire safety', line: 'Detection and suppression that act on their own, without waiting for a person.' },
  { key: 'chute', name: 'Ballistic parachute', line: 'A whole-aircraft parachute, fired by a ballistic charge. The last layer.' },
];

export const ENGINEERING = [
  { key: 'inside', name: 'Inside', title: 'A cabin built around *people.*', line: 'Seats, controls and storage under one sweep of glass. You see where you are going.', img: 'media/img/cabin-front.webp' },
  { key: 'vtol', name: 'Vertical take-off', title: 'No runway. *Ever.*', line: 'aerWing rises straight up from a pad and lands the same way, so a dock fits where an airport never could.', img: 'media/img/dock-pad.webp' },
  { key: 'h2', name: 'Hydrogen', title: 'Sunlight in. *Hydrogen* out.', line: 'aerVolt solar powers the dock. The dock makes green hydrogen. The hydrogen powers the aircraft.', img: 'media/img/svc-fuel.webp' },
  { key: 'prop', name: 'Propulsion', title: 'Fans inside *the wing.*', line: 'Ducted electric fans set into the wings and the tail. The ducts keep every blade enclosed.', img: 'media/img/fans.webp' },
  { key: 'smart', name: 'Systems', title: 'Always *aware.*', line: 'Sensors read the airspace around the aircraft, and aerOS keeps it in step with the docks and the network.', img: 'media/img/nose.webp' },
  { key: 'aero', name: 'Aerodynamics', title: 'One wing, *nose to tip.*', line: 'The body is the wing. One continuous surface from the nose to the wingtips.', img: 'media/img/wing-edge.webp' },
];

export const PHASES = [
  { name: 'Point to point', line: 'Airport transfers and direct hops inside a metro.' },
  { name: 'City networks', line: 'Docks across a city, connected to each other.' },
  { name: 'Intercity', line: 'City pairs within aerWing range, dock to dock.' },
  { name: 'One network', line: 'People, cargo and care on one network, powered by aerVolt.' },
];

export const ICAO = {
  Mumbai: 'VABB', Pune: 'VAPO', Nashik: 'VAOZ', Delhi: 'VIDP', Jaipur: 'VIJP', Agra: 'VIAG', Chandigarh: 'VICG', Bengaluru: 'VOBL',
  Chennai: 'VOMM', Mysuru: 'VOMY', Hyderabad: 'VOHS', Vijayawada: 'VOBZ', Kolkata: 'VECC', Bhubaneswar: 'VEBS', Ahmedabad: 'VAAH',
  Surat: 'VASU', Lucknow: 'VILK', Guwahati: 'VEGT', Shillong: 'VEBI', Kochi: 'VOCI', Nagpur: 'VANP', Panaji: 'VOGO',
};

export const ROUTES = {
  metros: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'],
  intercity: [['Mumbai', 'Pune'], ['Mumbai', 'Nashik'], ['Mumbai', 'Surat'], ['Ahmedabad', 'Surat'], ['Delhi', 'Jaipur'], ['Delhi', 'Agra'],
    ['Delhi', 'Chandigarh'], ['Bengaluru', 'Chennai'], ['Bengaluru', 'Mysuru'], ['Hyderabad', 'Vijayawada'], ['Kolkata', 'Bhubaneswar'], ['Pune', 'Panaji']],
  care: [['Guwahati', 'Shillong'], ['Nagpur', 'Hyderabad'], ['Kochi', 'Bengaluru'], ['Lucknow', 'Agra']],
  cargo: [['Surat', 'Ahmedabad'], ['Chennai', 'Vijayawada'], ['Kolkata', 'Bhubaneswar']],
};
