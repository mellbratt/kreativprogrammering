// v44-2 — Kroppen som instrument
//
// Källa: skriven för Introduktion till kreativ programmering, Södertörns
// högskola, ht 2026. Code-along, förmiddag 2.
// Ljudet görs med webbläsarens eget Web Audio, inte med p5.sound — färre
// beroenden, och hela ljudkedjan syns i koden.
//
// TEJPA FAST KORTET och rör dig. Överarmen eller bröstet fungerar bäst:
// nära nog kroppens mitt för att lutningen ska betyda något, långt nog ut
// för att gester ska synas. Handleden funkar också men blir nervös.
//
// Tre mappningar, tre musikaliska dimensioner:
//   rörelse  ->  om det låter alls, och hur hårt
//   lutning  ->  vilken ton i skalan
//   roll     ->  hur ljust eller mörkt det låter (filtret)
//
// Står du still är det tyst. Det är designbeslutet, inte en bugg:
// instrumentet finns bara så länge kroppen gör något.
//
// Kräver Live Server (localhost) och ett klick för att starta ljudet.
// Utan micro:bit styr musen i stället — prova direkt.

// ---- PARAMETRAR ------------------------------------------------------
const TEMPO        = 100;    // slag per minut (60–160)
const UNDERDELNING = 2;      // 2 = åttondelar, 4 = sextondelar
const SKALA        = [0, 3, 5, 7, 10];  // mollpentatonisk, i halvtonssteg
const GRUNDTON     = 50;     // MIDI-nummer, 50 = D3. +12 = en oktav upp
const OKTAVER      = 3;      // hur många oktaver lutningen spänner över
const TROSKEL      = 0.16;   // hur mycket rörelse som krävs för en ton (0–1)
const VOLYM        = 0.30;   // huvudvolym (0–1)
const SKAK_MAX     = 420;    // vad som räknas som full rörelse i råa tal
// ----------------------------------------------------------------------

let ac = null, master = null, brusbuffert = null;
let nastaTid = 0, steg = 0, klocka = null;
const FRAMFORHALLNING = 0.12;   // sek att schemalägga i förväg

let sistaTon = { nr: 0, tid: -9, styrka: 0 };
let rorelse = 0, ljushet = 0.5;

function setup() {
  createCanvas(1100, 720);
  microbitKnapp();
  textFont('monospace');
}

// ---- ljudet ----------------------------------------------------------

function startaLjud() {
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain();
  master.gain.value = VOLYM;
  master.connect(ac.destination);

  // En kort brusbuffert, återanvänds för varje puls
  const n = Math.floor(ac.sampleRate * 0.2);
  brusbuffert = ac.createBuffer(1, n, ac.sampleRate);
  const d = brusbuffert.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;

  nastaTid = ac.currentTime + 0.1;
  klocka = setInterval(schemalagg, 25);
}

function tonHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Lutningen väljer ton ur skalan, över flera oktaver
function valjTon(lutning) {
  const n = SKALA.length * OKTAVER;
  const i = Math.floor(map(constrain(lutning, -80, 80), -80, 80, 0, n - 0.001));
  const oktav = Math.floor(i / SKALA.length);
  return GRUNDTON + oktav * 12 + SKALA[i % SKALA.length];
}

function spelaTon(tid, midi, styrka, ljus) {
  const osc = ac.createOscillator();
  const filt = ac.createBiquadFilter();
  const g = ac.createGain();

  osc.type = 'sawtooth';
  osc.frequency.value = tonHz(midi);
  filt.type = 'lowpass';
  filt.frequency.value = 220 + ljus * 4200;   // rollet styr ljusheten
  filt.Q.value = 6;

  const topp = 0.22 * styrka;
  g.gain.setValueAtTime(0.0001, tid);
  g.gain.exponentialRampToValueAtTime(topp, tid + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, tid + 0.45);

  osc.connect(filt); filt.connect(g); g.connect(master);
  osc.start(tid);
  osc.stop(tid + 0.5);
}

function spelaPuls(tid, styrka) {
  const k = ac.createBufferSource();
  const filt = ac.createBiquadFilter();
  const g = ac.createGain();
  k.buffer = brusbuffert;
  filt.type = 'bandpass';
  filt.frequency.value = 1800;
  filt.Q.value = 1.2;
  g.gain.setValueAtTime(0.12 * styrka, tid);
  g.gain.exponentialRampToValueAtTime(0.0001, tid + 0.06);
  k.connect(filt); filt.connect(g); g.connect(master);
  k.start(tid);
  k.stop(tid + 0.1);
}

// Schemaläggaren tittar en bit in i framtiden. Att lita på setInterval
// ensam ger hackig rytm — ljudkortets klocka är den som gäller.
function schemalagg() {
  const stegLangd = 60 / TEMPO / UNDERDELNING;
  while (nastaTid < ac.currentTime + FRAMFORHALLNING) {
    const styrka = rorelse;
    if (styrka > TROSKEL) {
      const midi = valjTon(microbit.lutning);
      spelaTon(nastaTid, midi, styrka, ljushet);
      sistaTon = { nr: midi, tid: millis(), styrka: styrka };
    }
    if (styrka > TROSKEL * 0.5 && steg % UNDERDELNING === 0) {
      spelaPuls(nastaTid, styrka);
    }
    nastaTid += stegLangd;
    steg++;
  }
}

function mousePressed() { startaLjud(); }
function keyPressed()   { startaLjud(); }

// ---- bilden ----------------------------------------------------------

function draw() {
  background(16, 24, 29);
  microbitUppdatera();

  rorelse = constrain(microbit.skak / SKAK_MAX, 0, 1);
  ljushet = map(constrain(microbit.roll, -90, 90), -90, 90, 0, 1);

  if (!ac) {
    fill(232, 97, 60);
    textSize(30);
    textAlign(CENTER, CENTER);
    text('klicka för att starta ljudet', width / 2, height / 2);
    textAlign(LEFT, BASELINE);
    ritaStatus();
    return;
  }

  // skalan som en stege, den senast spelade tonen tänd
  const n = SKALA.length * OKTAVER;
  const h = 460 / n;
  for (let i = 0; i < n; i++) {
    const midi = GRUNDTON + Math.floor(i / SKALA.length) * 12 + SKALA[i % SKALA.length];
    const y = 560 - i * h;
    const aktiv = (midi === sistaTon.nr) && (millis() - sistaTon.tid < 420);
    noStroke();
    fill(aktiv ? color(232, 97, 60) : color(44, 52, 62));
    rect(90, y - h + 6, 180 + (aktiv ? 90 * sistaTon.styrka : 0), h - 8, 6);
  }
  fill(140, 150, 160);
  textSize(14);
  text('LUTNING → ton', 90, 600);

  // rörelsen som en stapel, med tröskeln utritad
  const bx = 430;
  fill(44, 52, 62);
  rect(bx, 100, 90, 460, 10);
  fill(rorelse > TROSKEL ? color(232, 97, 60) : color(90, 100, 112));
  rect(bx, 560 - 460 * rorelse, 90, 460 * rorelse, 10);
  stroke(250, 250, 247, 160);
  strokeWeight(2);
  line(bx - 10, 560 - 460 * TROSKEL, bx + 100, 560 - 460 * TROSKEL);
  noStroke();
  fill(140, 150, 160);
  text('RÖRELSE → låter alls', bx, 600);
  text('tröskel', bx + 104, 564 - 460 * TROSKEL);

  // filtret
  const fx = 700;
  fill(44, 52, 62);
  rect(fx, 100, 90, 460, 10);
  fill(120, 190, 230);
  rect(fx, 560 - 460 * ljushet, 90, 460 * ljushet, 10);
  fill(140, 150, 160);
  text('ROLL → ljushet', fx, 600);

  // pulsen
  const slag = steg % (UNDERDELNING * 4);
  for (let i = 0; i < UNDERDELNING * 4; i++) {
    fill(i === slag ? color(250, 250, 247) : color(50, 58, 68));
    circle(880 + (i % 8) * 30, 120 + Math.floor(i / 8) * 32, 16);
  }
  fill(140, 150, 160);
  text(`${TEMPO} bpm`, 880, 200);

  fill(200, 205, 212);
  textSize(15);
  text(rorelse > TROSKEL ? 'låter' : 'tyst — rör på dig', 880, 260);

  ritaStatus();
}

function ritaStatus() {
  noStroke();
  fill(microbit.ansluten ? color(110, 200, 150) : color(232, 160, 60));
  textSize(14);
  text(microbit.text, 90, height - 30);
}

// ---- TRE FÖRGRENINGAR ------------------------------------------------
// Välj EN. Ändra, spara, rör dig.
//
// 1. VÄND PÅ REGELN: gör stillheten till musiken. Byt raden i schemalagg()
//    från  if (styrka > TROSKEL)  till  if (styrka < TROSKEL).
//    Nu är det ett stycke man spelar genom att frysa. Det låter helt annat,
//    och det är ett tecken ändrat. Prova i grupp — alla fryser samtidigt.
//
// 2. LÅT ROLLET BYTA SKALA I STÄLLET FÖR FILTER. Lägg överst:
//      const SKALOR = [[0,3,5,7,10], [0,2,4,7,9], [0,1,5,7,8]];
//    och i valjTon(), byt SKALA mot:
//      const S = SKALOR[Math.floor(map(constrain(microbit.roll,-90,90),
//                                      -90, 90, 0, SKALOR.length - 0.001))];
//    (byt sedan alla SKALA i funktionen mot S). Vridningen byter tonart.
//    Är det mer eller mindre begripligt för den som tittar på? Det är
//    Frogger-kopplingarna: samma rörelse, olika tydlighet i svaret.
//
// 3. LÅT LJUSSENSORN STÄNGA AV ALLT. Lägg in först i schemalagg():
//      if (microbit.ljus < 40) { nastaTid += stegLangd; steg++; continue; }
//    Täck kortet med handen och musiken tystnar. Nu finns det två sätt att
//    tysta instrumentet — ett genom att sluta röra sig, ett genom att
//    skymma det. Vilket känns som att stänga av, och vilket som att kväva?
// ----------------------------------------------------------------------
