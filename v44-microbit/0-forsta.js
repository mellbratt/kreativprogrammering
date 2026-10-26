// v44-0 — Första programmet
//
// Källa: skriven för Introduktion till kreativ programmering, Södertörns
// högskola, ht 2026. Fungerar på micro:bit v1 och v2.
//
// SYFTE: kontrollera att kortet, kabeln och nedladdningen fungerar, innan
// någon dator-kod är inblandad. Kör först i MakeCodes simulator, ladda
// sedan ner till kortet och gör exakt samma sak igen.
//
// I BLOCKS motsvarar det här fyra block:
//   vid start            -> visa ikon
//   när knapp A trycks   -> visa tal 1
//   när knapp B trycks   -> visa tal 2
//   vid skakning         -> visa ikon, pausa, rensa skärm
//
// Skriv det gärna i Blocks och växla sedan till JavaScript för att se att
// det är samma program.

basic.showIcon(IconNames.Heart)

input.onButtonPressed(Button.A, function () {
    basic.showNumber(1)
})

input.onButtonPressed(Button.B, function () {
    basic.showNumber(2)
})

input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.Asleep)
    basic.pause(400)
    basic.clearScreen()
})

// ---- VAD DET BEVISAR -----------------------------------------------
// Hjärtat syns       -> kortet får ström och displayen fungerar
// 1 och 2 syns       -> båda knapparna fungerar
// Skakningen syns    -> accelerometern fungerar
//
// Fungerar det i simulatorn men inte på kortet är felet i nedladdningen
// eller i kabeln, inte i koden.
// --------------------------------------------------------------------
