# Kreativ programmering — kod

Kodexempel till *Introduktion till kreativ programmering*, Medieteknik,
Södertörns högskola.

Varje mapp är en vecka. Varje skissmapp inuti den är ett körbart exempel som
innehåller allt den behöver.

---

## Hämta hem koden

**Antingen:** gröna knappen *Code* → *Download ZIP*, packa upp någonstans du
hittar igen. Inte i Hämtade filer.

**Eller:** `git clone` om du redan använder git.

---

## Vad du behöver

| | |
| --- | --- |
| **Webbläsare** | Chrome eller Edge. Safari och Firefox kan inte prata med micro:bit — det är inte en inställning som går att ändra |
| **Editor** | VS Code med tillägget **Live Server** |
| **Kort** | En micro:bit, v1 eller v2, och en USB-kabel som överför data |

Rena laddkablar utan datalinor finns och ser likadana ut som datakablar.
Kortet lyser, men datorn ser ingen enhet.

---

## Köra ett exempel

1. Öppna mappen i VS Code. **Vilken nivå du öppnar spelar ingen roll** — hela
   repot, en veckomapp eller en enskild skissmapp fungerar lika bra.
2. Högerklicka på `index.html` i den skiss du vill köra.
3. Välj **Open with Live Server**.
4. Adressen ska börja med `localhost` eller `127.0.0.1`.

**Dubbelklick på `index.html` fungerar inte.** Då står det `file://` i
adressfältet, och webbläsaren släpper varken in serieporten, kameran eller
mikrofonen. Sidan säger det rakt ut i stället för att bli svart.

---

## Varför varje skissmapp har sin egen p5

En skissmapp innehåller fyra filer:

```
1-brygga/
  index.html
  sketch.js        ← den här ska du läsa och ändra i
  microbit.js      ← bryggan mellan kortet och webbläsaren
  p5.min.js        ← biblioteket, lokalt
```

Inga sökvägar pekar utanför mappen. Det betyder att exemplet fungerar oavsett
var mappen ligger och vilken mapp Live Server råkar ha som rot — det vanligaste
felet när något inte startar.

Priset är att `p5.min.js` och `microbit.js` finns i flera exemplar. Originalet
av `microbit.js` ligger i veckomappen. **Ändrar du i det, kopiera ut det till
skissmapparna igen**, annars kör skisserna den gamla versionen.

---

## Innehåll

| Mapp | Vecka | Vad |
| --- | --- | --- |
| [`v44-microbit/`](v44-microbit/) | 44 | micro:bit och p5: sensorer, mappning, kroppen som instrument |

Varje veckomapp har en egen `README.md` med stegen, parametrarna och de fel som
brukar dyka upp.

---

## Hur exemplen är skrivna

Samma mönster i alla:

- **Parametrarna ligger överst**, i en namngiven block. Det är de du ska ändra
  i först.
- **En källrad** säger var exemplet kommer ifrån.
- **Tre förgreningar** längst ner: konkreta ändringar att prova, en i taget.
- Ingen byggkedja, inga beroenden att installera, ingenting som kräver
  internet när du väl hämtat hem mappen.
