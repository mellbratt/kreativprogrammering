// v44-3 — Kroppen som pensel
//
// Källa: skriven för Introduktion till kreativ programmering, Södertörns
// högskola, ht 2026. Samma brygga som de andra skisserna, annan utdata:
// här blir rörelsen en bild i stället för ett ljud.
//
// Tejpa kortet på handen eller armen. Lutningen är penselns läge, rörelsen
// är hur brett den målar. Står du still målar den ingenting — samma regel
// som i instrumentet, och det är med flit: ni ska kunna jämföra hur samma
// mappning känns när den styr ljud respektive bild.
//
// Kräver Live Server (localhost). Utan micro:bit målar musen.

// ---- PARAMETRAR ------------------------------------------------------
const TROSKEL   = 0.10;   // under detta målar penseln inte alls (0–1)
const BREDD_MIN = 2;      // tunnaste strecket i px
const BREDD_MAX = 70;     // bredaste strecket i px
const SKAK_MAX  = 420;    // vad som räknas som full rörelse i råa tal
const FADE      = 0;      // 0 = allt ligger kvar. 4 = blekner långsamt (0–20)
const MATTNAD   = 70;     // färgmättnad (0–100)
// ----------------------------------------------------------------------

let duk;
let forra = null;

function setup() {
  createCanvas(1100, 720);
  duk = createGraphics(width, height);
  duk.colorMode(HSB, 360, 100, 100, 100);
  duk.background(0, 0, 8);
  microbitKnapp();
  textFont('monospace');
  colorMode(RGB, 255);
}

function draw() {
  microbitUppdatera();

  const rorelse = constrain(microbit.skak / SKAK_MAX, 0, 1);

  // Lutning och roll blir ett läge på duken
  const x = map(constrain(microbit.roll, -90, 90), -90, 90, 60, width - 60);
  const y = map(constrain(microbit.lutning, -90, 90), -90, 90, 60, height - 60);

  if (FADE > 0) {
    duk.noStroke();
    duk.fill(0, 0, 8, FADE * 0.2);
    duk.rect(0, 0, width, height);
  }

  if (rorelse > TROSKEL && forra) {
    const b = BREDD_MIN + (BREDD_MAX - BREDD_MIN) * rorelse;
    // Färgen kommer från läget, inte från rörelsen — annars blir allt grått
    const ton = (map(x, 0, width, 0, 300) + frameCount * 0.2) % 360;
    duk.stroke(ton, MATTNAD, 95, 60);
    duk.strokeWeight(b);
    duk.strokeCap(ROUND);
    duk.line(forra.x, forra.y, x, y);
  }
  forra = { x, y };

  image(duk, 0, 0);

  // ---- liten panel, så man ser vad som styr ------------------------
  noStroke();
  fill(16, 24, 29, 215);
  rect(0, height - 92, width, 92);

  fill(60, 68, 78);
  rect(40, height - 60, 300, 12, 6);
  fill(rorelse > TROSKEL ? color(232, 97, 60) : color(90, 100, 112));
  rect(40, height - 60, 300 * rorelse, 12, 6);
  fill(250, 250, 247, 160);
  rect(40 + 300 * TROSKEL, height - 66, 2, 24);

  fill(200, 205, 212);
  textSize(14);
  text(rorelse > TROSKEL ? 'målar' : 'står still — målar inget', 360, height - 50);
  text('C rensar duken · S sparar en png', 620, height - 50);

  fill(microbit.ansluten ? color(110, 200, 150) : color(232, 160, 60));
  text(microbit.text, 40, height - 20);
}

function keyPressed() {
  if (key === 'c' || key === 'C') { duk.background(0, 0, 8); forra = null; }
  if (key === 's' || key === 'S') saveCanvas('penseln', 'png');
}

// ---- TRE FÖRGRENINGAR ------------------------------------------------
// Välj EN.
//
// 1. LÅT DUKEN GLÖMMA. Sätt FADE till 6. Nu är teckningen en rörelse i
//    tiden i stället för ett spår som ligger kvar. Jämför med instrumentet:
//    ljud försvinner alltid av sig självt, bild gör det bara om man ber om
//    det. Vilket av de två medierna är ärligast mot en kropp som rör sig?
//
// 2. GÖR BREDDEN TILL EN TRÖSKEL I STÄLLET FÖR EN SKALA. Byt raden
//    const b = ... mot:
//      const b = rorelse > 0.45 ? BREDD_MAX : BREDD_MIN;
//    Två bredder i stället för hundra. Blir teckningen tydligare eller
//    fattigare? Det är samma fråga som mappning 1 mot mappning 2.
//
// 3. MÅLA MED LJUSET I STÄLLET. Byt ut färgraden mot:
//      const ton = map(microbit.ljus, 0, 255, 200, 20);
//    Nu bestämmer rummets ljus färgen och kroppen bestämmer formen.
//    Två sensorer, två roller. Det är så gott som alla installationer
//    på släktväggen är byggda.
// ----------------------------------------------------------------------
