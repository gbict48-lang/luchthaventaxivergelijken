# TaxiGeld — taxi vergelijken (React web app) 🌍🚕

Een **coole React-website** die taxiprijzen vergelijkt — **TaxiGeld, Uber, Bolt en lokale taxi** —
voor **elke route** en **elk vertrekmoment**, met de **echte prijslogica van de TaxiGeld-app**
1:1 naar JavaScript geport.

> Werkt vanaf **elke locatie** (niet alleen Almere). Typ een vertrek- en bestemmingsadres,
> kies wanneer, en vergelijk.

## ✨ Wat het doet
1. **Vertrekpunt / Waar naartoe?** → zoekscherm met directe suggesties (NL-dataset + live
   OpenStreetMap waar mogelijk).
2. **Voor wanneer?** (datum/tijd of snelle keuze) → bepaalt de **drukte-toeslag** op Uber/Bolt.
3. **Vergelijk prijzen** → de **wereldbol duikt in**, prijzen worden berekend, kaarten verschijnen
   (goedkoopste eerst, met 🥇🥈🥉 en "bespaar €X").
4. Sorteer (Goedkoopst / Snelst / Best beoordeeld); **Boeken/Openen** opent de juiste app/site
   (TaxiGeld → airportservicealmere.nl, Uber deep-link, Bolt).

## 🎨 De "super cool" extra's
- **DotGlobe** ([Globe.jsx](Globe.jsx)) — een draaiende canvas-bol van groene stippen met
  gloeiende route-bogen; draait sneller tijdens een vergelijking.
- **TrafficBackground** ([Background.jsx](Background.jsx)) — een levende straat (auto's, bussen,
  trams, fietsen, bomen, huizen, mensen) die **versnelt als je scrollt** en **een inzoomende
  auto + rimpel spawnt waar je tikt**.

## 🗂 Bestanden
| Bestand | Rol |
|---|---|
| `index.html` | App-shell + React-state (route, tijd, sortering, resultaten). |
| `app.css` + `colors_and_type.css` | Donker thema + alle styling/design-tokens. |
| `data.js` | **Prijslogica** (Tariff, Surge, providers, MyTaxi-onderbieding, SchipholPricing, Geo, `quotesFor`). |
| `places.js` | NL/luchthaven-plaatsen + `searchPlaces()` (lokaal + live OSM/Nominatim). |
| `Globe.jsx` · `Background.jsx` · `Compare.jsx` · `Icon.jsx` | UI-componenten. |

## 💶 Tarieven aanpassen
Alle prijslogica staat in [`data.js`](data.js): vaste **Schiphol-tarieven** per stad,
de 0,93-onderbieding, Uber/Bolt-tarieven en de drukte-toeslag.

## 🚀 Online (geen build nodig)
React + Babel + Lucide komen van een CDN; `.jsx` wordt in de browser getranspileerd — dus de map
kan direct als statische site draaien.

**Auto-deploy:** bij elke push naar `main` zet [deploy.yml](.github/workflows/deploy.yml) de site
live op **GitHub Pages**.

**Eenmalig instellen:** repo → **Settings → Pages → Source: GitHub Actions**.
Live op: `https://gbict48-lang.github.io/luchthaventaxivergelijken/`

### Eigen domein
Settings → Pages → **Custom domain** (bijv. `luchthaventaxivergelijken.nl`), en bij Vimexx een
**CNAME** naar `gbict48-lang.github.io`.

## Lokaal bekijken
Open `index.html` in je browser (gebruik eventueel een lokale server zodat de `.jsx`-bestanden
laden, bv. `python -m http.server`).

---
Uber/Bolt-prijzen zijn **gelabelde schattingen** (geen officiële API), exact zoals de app het stelt.
