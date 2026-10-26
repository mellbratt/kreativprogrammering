// Bryggan: se talen innan du gör något med dem
//
// Tre delar:
//   vänster   alla värden råa, och vilket område NI faktiskt producerat
//   höger upp en farkost som följer riktning, lutning och roll
//   höger ner samma värde genom tre olika mappningar
//
// Poängen är den vänstra delen. Sensorns teoretiska område är nästan aldrig
// det område en människa kan få fram i ett klassrum, och skillnaden mellan
// de två ÄR mappningsarbetet.

// ---- SKRUVA PÅ DE HÄR ------------------------------------------------
const KANAL   = 'lutning';   // vilket värde de tre mappningarna använder
const GRANS   = 0.35;        // mappning 2: under detta händer ingenting
const GLOMSKA = 0.985;       // mappning 3: närmare 1 = glömmer långsammare
// ----------------------------------------------------------------------

// Område per värde. Byt mot det NI mäter upp — det är hela övningen.
const OMRADEN = {
  lutning: [-180, 180], roll: [-180, 180], skak: [0, 500],
  ljus: [0, 255], magnet: [0, 200], riktning: [0, 360],
};

const KANALER = ['lutning', 'roll', 'skak', 'ljus', 'magnet', 'riktning'];

let laddning = 0;
let sett = {};

function setup() {
  createCanvas(1100, 720);
  textFont('monospace');
  microbitKnapp();
  for (const k of KANALER) sett[k] = [Infinity, -Infinity];
}

function draw() {
  background(16, 24, 29);
  microbitUppdatera();

  ritaVarden();
  ritaFarkost();
  ritaMappningar();

  fill(microbit.ansluten ? color(110, 200, 150) : color(232, 160, 60));
  textSize(14);
  text(microbit.text, 48, height - 20);
}

// Gör om ett värde till 0–1 enligt kanalens område.
function normalisera(kanal, v) {
  const [lagst, hogst] = OMRADEN[kanal];
  return constrain((v - lagst) / (hogst - lagst), 0, 1);
}

// ---- vänster: värdena råa ---------------------------------------------
function ritaVarden() {
  noStroke();
  fill(140, 150, 160);
  textSize(15);
  text('VÄRDEN FRÅN KORTET', 48, 60);

  KANALER.forEach((kanal, i) => {
    const y = 92 + i * 72;
    const v = microbit[kanal];
    const finns = !(kanal === 'riktning' && v < 0);

    if (finns) {
      sett[kanal][0] = min(sett[kanal][0], v);
      sett[kanal][1] = max(sett[kanal][1], v);
    }

    fill(200, 205, 212);
    textSize(16);
    text(kanal.padEnd(9) + (finns ? nf(v, 1, 0).padStart(6) : '     –'), 48, y);

    fill(60, 68, 78);
    rect(48, y + 10, 420, 14, 7);
    if (finns) {
      fill(232, 97, 60);
      rect(48, y + 10, 420 * normalisera(kanal, v), 14, 7);
    }

    textSize(12);
    fill(120, 130, 140);
    if (finns && isFinite(sett[kanal][0])) {
      text(`sett: ${nf(sett[kanal][0], 1, 0)} … ${nf(sett[kanal][1], 1, 0)}`, 48, y + 48);
    } else {
      text('tryck A+B på kortet för att kalibrera kompassen', 48, y + 48);
    }
  });

  // knapparna
  [['a', 0], ['b', 46]].forEach(([k, dx]) => {
    fill(microbit[k] ? color(232, 97, 60) : color(60, 68, 78));
    circle(62 + dx, 556, 30);
    fill(140, 150, 160);
    textSize(12);
    textAlign(CENTER);
    text(k.toUpperCase(), 62 + dx, 584);
    textAlign(LEFT);
  });
}

// ---- höger upp: farkosten ---------------------------------------------
//
// Ritas för hand i 2D: vrid varje hörn, dela med djupet, måla ytorna
// bakifrån och fram. Nosen är orange, höger vinge grön och vänster röd —
// som lanternorna på en båt — så att rollen syns från alla håll.

const NOS = [0, 0, -112];
const FRAM = [[-17, -17, -64], [17, -17, -64], [17, 17, -64], [-17, 17, -64]];
const BAK = [[-15, -15, 74], [15, -15, 74], [15, 15, 74], [-15, 15, 74]];
const VINGE = [[16, 0, -10], [92, 0, 6], [70, 2, 40], [14, 2, 34]];
const FENA = [[0, -2, 48], [0, -54, 74], [0, -2, 82]];

const spegla = (p) => p.map(([x, y, z]) => [-x, y, z]).reverse();

const YTOR = [
  ...[0, 1, 2, 3].map(i => [[NOS, FRAM[i], FRAM[(i + 1) % 4]], [232, 97, 60]]),
  ...[0, 1, 2, 3].map(i => [[FRAM[i], FRAM[(i + 1) % 4], BAK[(i + 1) % 4], BAK[i]], [205, 211, 219]]),
  [VINGE, [110, 200, 150]],
  [spegla(VINGE), [214, 86, 96]],
  [FENA, [196, 203, 212]],
];

// Kameran tittar snett uppifrån. Gäller allt som ritas.
function kamera([x, y, z]) {
  const c = cos(radians(-20)), s = sin(radians(-20));
  return [x, y * c - z * s, y * s + z * c];
}

// Vrider ett hörn med farkosten: roll, sedan lutning, sedan riktning.
function vrid([x, y, z]) {
  let c = cos(radians(microbit.roll)), s = sin(radians(microbit.roll));
  [x, y] = [x * c - y * s, x * s + y * c];

  c = cos(radians(-microbit.lutning)); s = sin(radians(-microbit.lutning));
  [y, z] = [y * c - z * s, y * s + z * c];

  const r = radians(max(0, microbit.riktning));
  c = cos(r); s = sin(r);
  [x, z] = [x * c + z * s, -x * s + z * c];

  return kamera([x, y, z]);
}

const platta = ([x, y, z]) => [806 + x * 560 / (560 + z), 230 + y * 560 / (560 + z)];

function ritaFarkost() {
  fill(140, 150, 160);
  noStroke();
  textSize(15);
  text('RIKTNING, LUTNING OCH ROLL', 560, 60);

  // Ringen ligger still. Det är mot den man läser av lutning och roll.
  noFill();
  stroke(62, 72, 84);
  beginShape();
  for (let g = 0; g < 360; g += 8) {
    vertex(...platta(kamera([cos(radians(g)) * 128, 0, sin(radians(g)) * 128])));
  }
  endShape(CLOSE);

  const ritade = YTOR.map(([punkter, farg]) => {
    const v = punkter.map(vrid);
    return { v, farg, djup: v.reduce((s, p) => s + p[2], 0) / v.length };
  }).sort((a, b) => b.djup - a.djup);

  noStroke();
  for (const yta of ritade) {
    fill(...yta.farg);
    beginShape();
    for (const p of yta.v) vertex(...platta(p));
    endShape(CLOSE);
  }

  fill(120, 130, 140);
  textSize(13);
  text(`riktning ${microbit.riktning < 0 ? '–' : nf(microbit.riktning, 1, 0) + '°'}`
     + `   lutning ${nf(microbit.lutning, 1, 0)}°   roll ${nf(microbit.roll, 1, 0)}°`, 560, 400);
  textSize(12);
  text('Lutning och roll kommer ur tyngdkraften och stämmer bara i ro.', 560, 422);
}

// ---- höger ner: tre svar på samma värde -------------------------------
function ritaMappningar() {
  const v = normalisera(KANAL, microbit[KANAL]);
  laddning = min(1, laddning * GLOMSKA + v * 0.05);

  noStroke();
  fill(140, 150, 160);
  textSize(15);
  text(`TRE SVAR PÅ "${KANAL.toUpperCase()}"`, 560, 474);

  [['direkt', v], ['tröskel', v > GRANS ? 1 : 0], ['minne', laddning]]
    .forEach(([namn, varde], i) => {
      const y = 500 + i * 38;
      fill(200, 205, 212);
      textSize(14);
      text(namn.padEnd(9), 560, y + 14);

      fill(60, 68, 78);
      rect(648, y + 3, 320, 14, 7);
      fill(232, 97, 60);
      rect(648, y + 3, max(2, 320 * varde), 14, 7);

      fill(200, 205, 212);
      textSize(13);
      text(nf(varde, 1, 2), 982, y + 14);
    });

  fill(120, 130, 140);
  textSize(13);
  text('Vilken av de tre känns orsakad av din rörelse?', 560, 636);
}

// ---- TRE FÖRGRENINGAR -------------------------------------------------
// 1. MÄT UPP ERT EGET OMRÅDE. Läs raden "sett:" under varje stapel och
//    skriv in de talen i OMRADEN i stället för mina gissningar.
//
// 2. BYT KANAL till 'ljus' och håll handen över kortet. Jämför hur de tre
//    mappningarna känns med en sensor som svarar ögonblickligen.
//
// 3. LÄGG TILL ETT VÄRDE. Skicka temperaturen från sandare.js och lägg till
//    'temperatur' sist i ORDNING i microbit.js och i KANALER här ovanför.
// -----------------------------------------------------------------------
