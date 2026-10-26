// micro:bit-sändaren
//
// Klistra in den här i makecode.microbit.org: nytt projekt, växla från
// Blocks till JavaScript, markera allt som står där, klistra in, Ladda ner.
// Gör det EN gång. Samma sändare driver alla fyra p5-skisserna.
//
// Den skickar en rad med åtta tal tjugo gånger i sekunden:
//
//     lutning,roll,skak,ljus,magnet,riktning,a,b
//
// VILL DU SKICKA NÅGOT ANNAT?
// Lägg till en rad bland värdena nedan, och lägg till den sist i
// serial.writeLine. Lägg sedan till samma namn sist i ORDNING i
// microbit.js. De två listorna måste ha samma ordning.

let kompassKlar = false

serial.redirectToUSB()
serial.setWriteLinePadding(0)

// A+B kalibrerar kompassen: leken där man lutar kortet tills alla 25
// lysdioder tänts. Kontrollen efteråt behövs — utan den frågar loopen
// efter riktningen fast kalibreringen misslyckades, och då startar leken
// om varje varv.
input.onButtonPressed(Button.AB, function () {
    input.calibrateCompass()
    kompassKlar = input.compassHeading() >= 0
})

basic.forever(function () {
    let lutning = input.rotation(Rotation.Pitch)
    let roll = input.rotation(Rotation.Roll)
    let skak = Math.abs(input.acceleration(Dimension.Strength) - 1023)
    let ljus = input.lightLevel()
    let magnet = Math.round(input.magneticForce(Dimension.Strength))
    let riktning = kompassKlar ? input.compassHeading() : -1
    let a = input.buttonIsPressed(Button.A) ? 1 : 0
    let b = input.buttonIsPressed(Button.B) ? 1 : 0

    serial.writeLine(lutning + "," + roll + "," + skak + "," + ljus + ","
        + magnet + "," + riktning + "," + a + "," + b)

    basic.pause(50)
})

// ---- ATT PROVA -----------------------------------------------------
// 1. Byt 50 mot 200 i basic.pause. Vad händer med känslan i p5-skissen?
//    Mjukt och segt, eller hackigt och ärligt?
//
// 2. Ta bort serial.writeLine helt och rita på kortet i stället:
//        led.plotBarGraph(skak, 500)
//    Ingen dator inblandad. Vad förlorade du, och vad vann du?
// --------------------------------------------------------------------
