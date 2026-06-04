# LuchthaventaxiVergelijken 🛫 + TaxiGeld-app 🌍

Twee oppervlakken in één site:

| URL | Wat | Stijl |
|---|---|---|
| **`/`** | **Marketing-landing** — luchthaventaxi vergelijken (Schiphol, Eindhoven, Düsseldorf …), vaste prijzen, boeken. SEO-geoptimaliseerd. | Licht, groen |
| **`/app/`** | **TaxiGeld-app** — vergelijk élke taxirit (TaxiGeld/Uber/Bolt/lokaal) vanaf elke locatie, met wereldbol, bewegende achtergrond, locatie-autocomplete en "voor wanneer". | Donker |

De landing linkt naar de app via **🚕 App** in de navigatie; de app linkt terug via het logo.

## Structuur
```
/
├─ index.html              # marketing-landing (React via CDN)
├─ kit.css                 # landing-styling
├─ data.js                 # luchthaven-tarieven + compareFares()
├─ Header/Hero/Results/Sections/Scene.jsx
├─ colors_and_type.css     # gedeelde design-tokens
├─ assets/ (favicon.svg, og.png)
├─ robots.txt · sitemap.xml
├─ app/                    # de TaxiGeld-app
│  ├─ index.html · app.css
│  ├─ data.js · places.js  # prijslogica + locatie-autocomplete
│  └─ Globe/Background/Compare/Icon.jsx
└─ .github/workflows/deploy.yml
```

## SEO
- Volledige `<head>`: title, description, keywords, canonical, Open Graph + Twitter-card (`assets/og.png`).
- **Gestructureerde data** (JSON-LD): `TaxiService` + `FAQPage` → kans op rich results in Google.
- `sitemap.xml`, `robots.txt`, `noscript`-kop, semantische content (luchthavens, waarom, FAQ).

### Jouw domeinen
Je hebt o.a. `luchthaventaxivergelijken.nl`, `schipholtaxivergelijken.nl`,
`taxinaarschipholboeken.nl`, `taxinaarschipholbestellen.nl`, `taxinaarschipholvergelijken.nl`.
**Aanpak voor Google:** kies **`luchthaventaxivergelijken.nl` als hoofd-domein** (canonical) en laat
de andere domeinen **301-doorverwijzen** naar dit domein bij Vimexx (zo voorkom je "dubbele content"
en bundel je alle SEO-kracht op één site). In GitHub Pages stel je het hoofd-domein in onder
**Settings → Pages → Custom domain**.

## Snelheid
React/ReactDOM laden nu als **productie-build** (kleiner/sneller) + `preconnect`. JSX wordt nog in de
browser getranspileerd (Babel) zodat er geen build-stap nodig is. Voor maximale snelheid kan later een
**Vite-build** worden toegevoegd (zie hieronder).

## Auto-deploy
Elke push naar `main` → [deploy.yml](.github/workflows/deploy.yml) zet de site live op GitHub Pages.
Eenmalig: **Settings → Pages → Source: GitHub Actions**.

## Vite (later)
Een Vite-build (geen browser-Babel, geminificeerde bundel) maakt de eerste load nóg sneller. Dat vereist
een ESM-migratie van de componenten en wordt apart getest opgezet (faalt een build, dan blijft de huidige
live site gewoon staan).
