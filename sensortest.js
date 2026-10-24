// v44-0b — Läs en sensor, utan dator
//
// Källa: skriven för Introduktion till kreativ programmering, Södertörns
// högskola, ht 2026. Fungerar på micro:bit v1 och v2.
//
// SYFTE: se ett sensorvärde ändra sig, först på kortets egna 25 lysdioder
// och sedan som siffror och graf i MakeCodes egen konsol. Fortfarande
// ingen p5, ingen Live Server, ingen Web Serial.
//
// Så här ser du konsolen i MakeCode:
//   Simulatorn: kör programmet, så dyker "Visa konsol Simulator" upp
//   Kortet:     tryck Anslut (Connect device) först, därefter
//               "Visa konsol Enhet" / "Show console Device"
//
// MakeCode ritar automatiskt en graf över värdena. Det räcker långt innan
// vi tar in p5.

// ---- PARAMETRAR ----------------------------------------------------
const VAL = 1    // 1 = ljus, 2 = lutning, 3 = rörelse
// --------------------------------------------------------------------

serial.redirectToUSB()

basic.forever(function () {
    let v = 0

    if (VAL === 1) {
        // 0–255 från ljussensorn, skalat till 0–100
        v = Math.map(input.lightLevel(), 0, 255, 0, 100)
    } else if (VAL === 2) {
        // -90 till 90 grader framåt/bakåt, skalat till 0–100
        v = Math.map(input.rotation(Rotation.Pitch), -90, 90, 0, 100)
    } else {
        // avståndet från 1023 är hur mycket kortet rör sig just nu
        v = Math.map(Math.abs(input.acceleration(Dimension.Strength) - 1023), 0, 500, 0, 100)
    }

    v = Math.constrain(Math.round(v), 0, 100)

    led.plotBarGraph(v, 100)      // kortets egna 25 lysdioder
    serial.writeValue("v", v)     // MakeCodes konsol och graf

    basic.pause(100)
})

// ---- ATT PROVA -----------------------------------------------------
// 1. Byt VAL till 2 och sedan till 3. Samma program, tre olika sensorer.
//
// 2. Med VAL = 1: håll handen över kortet och titta på stapeln. Observera
//    att lysdioderna som ritar stapeln också är det som mäter ljuset —
//    sensorn och utdatan är samma komponent.
//
// 3. Skriv ner det minsta och största värde du faktiskt kan få fram med
//    kroppen. Det är de talen vi använder i p5-skissen sedan, inte
//    databladets område.
// --------------------------------------------------------------------
