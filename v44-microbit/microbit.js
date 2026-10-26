// Bryggan: micro:bit in i webbläsaren
//
// I din skiss hämtar du värdena ur microbit:
//
//     microbit.lutning
//     microbit.skak
//
// VILL DU HA ETT VÄRDE SOM INTE FINNS HÄR?
// Ändra på två ställen, i den här ordningen:
//   1. lägg till värdet i serial.writeLine längst ner i sandare.js
//   2. lägg till namnet sist i ORDNING här nedanför
// Inget annat behöver röras.
//
// Kräver Live Server och Chrome eller Edge. Safari och Firefox kan inte
// prata med kortet.

// Namnen i samma ordning som talen i sandare.js. Det är den här raden som
// kopplar ihop de två filerna.
const ORDNING = ['lutning', 'roll', 'skak', 'ljus', 'magnet', 'riktning', 'a', 'b'];

const VINKLAR = ['lutning', 'roll', 'riktning'];  // hoppar mellan -180 och 180
const DIREKTA = ['a', 'b'];                       // knappar, utjämnas inte

const UTJAMNING = 0.2;   // 0,05 segt och mjukt — 0,5 snabbt och nervöst

const microbit = {
  lutning: 0,     // -180…180   framåt och bakåt
  roll: 0,        // -180…180   i sidled
  skak: 0,        // 0…800      hur mycket kortet rör sig just nu
  ljus: 128,      // 0…255      ljusnivå, mätt med lysdioderna
  magnet: 0,      // µT         magnetfältets styrka
  riktning: -1,   // 0…359      kompassriktning, -1 tills du tryckt A+B
  a: 0,           // 0 / 1      knapp A hålls nere
  b: 0,           // 0 / 1      knapp B hålls nere

  ansluten: false,
  text: '',       // vad som händer just nu — rita den i skissen
};

let senasteRaden = null;


// Lägger en anslutningsknapp på sidan. Klicket krävs: webbläsaren släpper
// inte in serieporten utan att någon klickat.
function microbitKnapp() {
  const knapp = document.createElement('button');
  knapp.textContent = 'Anslut micro:bit';
  knapp.style.cssText = 'position:fixed;top:14px;left:14px;z-index:10;'
    + 'padding:10px 16px;border:0;border-radius:8px;cursor:pointer;'
    + 'font:15px ui-sans-serif,system-ui,sans-serif;background:#E8613C;color:#16181D';

  knapp.onclick = async () => {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    microbit.ansluten = true;
    knapp.textContent = 'Ansluten';

    // Kortet skickar en lång ström av tecken. Vi klipper den vid radbyten
    // och sparar den senast kompletta raden.
    const strom = port.readable.pipeThrough(new TextDecoderStream()).getReader();
    let rest = '';
    while (true) {
      const { value, done } = await strom.read();
      if (done) break;
      const rader = (rest + value).split('\n');
      rest = rader.pop();
      if (rader.length) senasteRaden = rader[rader.length - 1];
    }
  };

  document.body.appendChild(knapp);
}


// Vinklar hoppar mellan -180 och 180. Utan det här går utjämningen den långa
// vägen runt vid hoppet, och allt som ritas med vinkeln slår runt ett varv.
function narmare(fran, till) {
  const skillnad = ((till - fran + 540) % 360) - 180;
  return fran + skillnad * UTJAMNING;
}


// Anropa den här först i draw(), en gång per bildruta.
function microbitUppdatera() {
  microbit.text = microbit.ansluten
    ? 'micro:bit ansluten'
    : 'DEMOLÄGE — musen spelar micro:bit, musknappen är A och tangenten B är B';

  const rad = microbit.ansluten ? senasteRaden : demorad();
  if (!rad) return;

  const tal = rad.split(',').map(Number);

  ORDNING.forEach((namn, i) => {
    const v = tal[i];
    if (!isFinite(v)) return;
    if (DIREKTA.includes(namn))      microbit[namn] = v;
    else if (VINKLAR.includes(namn)) microbit[namn] = narmare(microbit[namn], v);
    else                             microbit[namn] += (v - microbit[namn]) * UTJAMNING;
  });
}


// Utan kort spelar musen micro:bit. Raden ser likadan ut som kortets, så
// resten av koden märker ingen skillnad.
let forraX = 0, forraY = 0;
function demorad() {
  const fart = Math.hypot(mouseX - forraX, mouseY - forraY) * 12;
  forraX = mouseX;
  forraY = mouseY;

  return [
    (mouseY / height) * 180 - 90,            // lutning
    (mouseX / width) * 180 - 90,             // roll
    Math.min(800, fart),                     // skak
    255 * (1 - mouseY / height),             // ljus
    40 + 30 * Math.sin(Date.now() / 900),    // magnet
    (Date.now() / 60) % 360,                 // riktning
    mouseIsPressed ? 1 : 0,                  // a
    keyIsDown(66) ? 1 : 0,                   // b
  ].join(',');
}
