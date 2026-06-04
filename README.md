# LuchthaventaxiVergelijken 🛫

Statische website om **luchthaventaxi-prijzen** te vergelijken vanaf Almere en omgeving naar
Schiphol, Eindhoven, Rotterdam, Lelystad, Düsseldorf, Weeze, Brussel en Charleroi.
Vaste prijzen vergelijken met Uber/Bolt-schattingen en in één klik boeken via Airportservice Almere.

## Structuur
```
.
├─ index.html              # de pagina
├─ assets/
│  ├─ style.css            # styling
│  ├─ app.js               # prijzen + rekenlogica (pas tarieven hier aan)
│  └─ favicon.svg
├─ robots.txt
└─ .github/workflows/deploy.yml   # auto-deploy naar GitHub Pages bij elke push
```

## Tarieven aanpassen
Alle prijzen staan bovenin [`assets/app.js`](assets/app.js):
- `SCHIPHOL_FIXED` — de **vaste** Schiphol-tarieven per stad (taxi + minibus).
- `AIRPORTS` / `CITIES` — luchthavens en servicesteden (met coördinaten).
- Overige luchthavens krijgen automatisch een **richtprijs** (afstand × tarief) tot je ze vastlegt.

## Automatisch online (GitHub Pages)
Bij elke push naar `main` draait de workflow en zet de site live.

**Eenmalig instellen:** repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
De site komt dan op `https://gbict48-lang.github.io/luchthaventaxivergelijken/`.

### Eigen domein koppelen (bijv. luchthaventaxivergelijken.nl)
1. Repo → **Settings → Pages → Custom domain** → vul je domein in (maakt een `CNAME`-bestand).
2. Bij je domeinprovider (Vimexx) een **CNAME**-record naar `gbict48-lang.github.io`
   (of A-records naar GitHub's Pages-IP's voor het hoofddomein).

## Lokaal bekijken
Open gewoon `index.html` in je browser — geen build nodig.
