// v44-4 — Spökdetektorn
//
// Källa: skriven för Introduktion till kreativ programmering, Södertörns
// högskola, ht 2026. Läser magnetfältet och ritar det över tid.
//
// Kortets kompass mäter magnetfält i mikrotesla. Gå runt i huset med kortet
// och byggnaden avslöjar sig: laptops, högtalare, hissen, elcentralen,
// stålbalkar i golvet. Ingenting av det syns, och allt finns där.
//
// Ingen kalibrering behövs. Magnetometern kalibrerar sig inte mot jordens
// fält när man bara mäter styrkan, så fältet finns så fort sändaren kör.
// A+B behövs bara om man vill ha kompassRIKTNINGEN, och den används inte här.
//
// Kräver Live Server (localhost). Utan micro:bit simuleras ett fält.

// ---- PARAMETRAR ------------------------------------------------------
const FONSTER     = 420;   // hur många mätpunkter kurvan minns (60–1200)
const NOLL_SEK    = 3;     // sekunder som används för att sätta nollnivån
const UTSLAG      = 60;    // µT över nollnivån som räknas som fullt utslag
// ----------------------------------------------------------------------

let spar = [];
let nolla = null;
let nollprov = [];
let start = 0;

function setup() {
  createCanvas(1100, 720);
  microbitKnapp();
  textFont('monospace');
  start = millis();
}

function draw() {
  background(16, 24, 29);
  microbitUppdatera();

  const v = microbit.magnet;
  const harData = true;

  // De första sekunderna används för att bestämma vad "ingenting" är.
  // Stå still mitt i rummet medan den räknar.
  if (harData && nolla === null) {
    nollprov.push(v);
    if (millis() - start > NOLL_SEK * 1000 && nollprov.length > 10) {
      nolla = nollprov.reduce((a, b) => a + b, 0) / nollprov.length;
    }
  }

  const avvikelse = nolla === null ? 0 : v - nolla;
  const n = constrain(Math.abs(avvikelse) / UTSLAG, 0, 1);

  spar.push(avvikelse);
  if (spar.length > FONSTER) spar.shift();

  // ---- kurvan över tid ----------------------------------------------
  const mitt = 330;
  stroke(44, 52, 62);
  strokeWeight(1);
  line(60, mitt, width - 60, mitt);
  noStroke();
  fill(90, 100, 112);
  textSize(13);
  text('nollnivå', width - 150, mitt - 10);

  noFill();
  stroke(232, 97, 60);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < spar.length; i++) {
    const x = map(i, 0, FONSTER, 60, width - 60);
    const y = mitt - constrain(spar[i] / UTSLAG, -1.6, 1.6) * 180;
    vertex(x, y);
  }
  endShape();
  noStroke();

  // ---- ringen: nuet ---------------------------------------------------
  const cx = width / 2, cy = 520;
  for (let r = 3; r >= 1; r--) {
    fill(232, 97, 60, 26 * r * n);
    circle(cx, cy, 70 + r * 70 * n);
  }
  fill(250, 250, 247, 220);
  circle(cx, cy, 56);
  fill(16, 24, 29);
  textSize(17);
  textAlign(CENTER, CENTER);
  text(nf(n, 1, 2), cx, cy);
  textAlign(LEFT, BASELINE);

  // ---- siffror ---------------------------------------------------------
  fill(200, 205, 212);
  textSize(16);
  text(`fält      ${nf(v, 1, 1)} µT`, 60, 90);
  text(`nollnivå  ${nolla === null ? '—' : nf(nolla, 1, 1) + ' µT'}`, 60, 116);
  text(`avvikelse ${nf(avvikelse, 1, 1)} µT`, 60, 142);

  if (!harData) {
    fill(232, 160, 60);
    textSize(19);
    text('Ingen data från kortet än.', 60, 190);
    textSize(14);
    fill(140, 150, 160);
    text('Klicka på Anslut micro:bit uppe till vänster, eller rör musen för demoläge.', 60, 214);
  } else if (nolla === null) {
    fill(232, 160, 60);
    textSize(19);
    text('Stå still mitt i rummet … sätter nollnivå', 60, 190);
  }

  fill(120, 130, 140);
  textSize(14);
  text('N sätter om nollnivån där du står', 60, height - 56);
  fill(microbit.ansluten ? color(110, 200, 150) : color(232, 160, 60));
  text(microbit.text, 60, height - 30);
}

function keyPressed() {
  if (key === 'n' || key === 'N') { nolla = null; nollprov = []; start = millis(); spar = []; }
}

// ---- TRE FÖRGRENINGAR ------------------------------------------------
// Välj EN.
//
// 1. GÖR DEN HÖRBAR. Ett fält man ser kräver att man tittar på skärmen,
//    vilket är fel när man går runt i ett hus. Lägg till Web Audio och låt
//    avvikelsen styra en tons höjd — då kan ni gå med skärmen i fickan.
//    Det är skillnaden mellan ett mätinstrument och en metalldetektor.
//
// 2. RITA HUSET I STÄLLET FÖR TIDEN. Spara avvikelsen tillsammans med var
//    ni står (skriv in rummets namn med tangenterna) och bygg en karta över
//    våningen. Mimi Onuohas fråga, ställd baklänges: vad finns det data om
//    här, som ingen samlar in?
//
// 3. LÅT NOLLNIVÅN DRIVA. Byt den fasta nollan mot ett glidande medelvärde:
//      nolla += (v - nolla) * 0.002;
//    Nu anpassar sig instrumentet långsamt till var det befinner sig, och
//    visar bara förändringar. Jämför: en sensor som minns var den var,
//    mot en som ständigt glömmer. Vilken av dem ljuger minst?
// ----------------------------------------------------------------------
