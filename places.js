"use strict";
/* =========================================================================
   TaxiGeld — place search. The iOS app uses MKLocalSearchCompleter; the web
   build uses a curated NL dataset for instant offline suggestions and
   (when reachable) enriches with live OpenStreetMap / Nominatim results so
   ANY address works. Each place: { title, subtitle, city, lat, lon }.
   ========================================================================= */

const PLACES = [
  // Airports (Schiphol triggers TaxiGeld's fixed prices)
  { title: "Schiphol Airport", subtitle: "Luchthaven Schiphol, Haarlemmermeer", city: "Schiphol", lat: 52.3105, lon: 4.7683 },
  { title: "Eindhoven Airport", subtitle: "Luchthaven, Eindhoven", city: "Eindhoven", lat: 51.4501, lon: 5.3745 },
  { title: "Rotterdam The Hague Airport", subtitle: "Luchthaven, Rotterdam", city: "Rotterdam", lat: 51.9569, lon: 4.4377 },
  { title: "Düsseldorf Airport", subtitle: "Flughafen, Düsseldorf (DE)", city: "Düsseldorf", lat: 51.2895, lon: 6.7668 },
  { title: "Weeze / Niederrhein Airport", subtitle: "Flughafen, Weeze (DE)", city: "Weeze", lat: 51.6024, lon: 6.1422 },
  { title: "Brussels Airport", subtitle: "Luchthaven Zaventem (BE)", city: "Zaventem", lat: 50.9014, lon: 4.4844 },

  // TaxiGeld service towns (fixed Schiphol fares)
  { title: "Almere Centrum", subtitle: "Stadhuisplein, Almere", city: "Almere", lat: 52.3750, lon: 5.2197 },
  { title: "Almere Buiten", subtitle: "Almere", city: "Almere", lat: 52.3920, lon: 5.3050 },
  { title: "Almere Poort", subtitle: "Almere", city: "Almere", lat: 52.3406, lon: 5.1640 },
  { title: "Lelystad Centrum", subtitle: "Lelystad", city: "Lelystad", lat: 52.5185, lon: 5.4714 },
  { title: "Zeewolde", subtitle: "Flevoland", city: "Zeewolde", lat: 52.3306, lon: 5.5417 },
  { title: "Naarden-Vesting", subtitle: "Naarden", city: "Naarden", lat: 52.2958, lon: 5.1631 },
  { title: "Bussum", subtitle: "Gooise Meren", city: "Bussum", lat: 52.2769, lon: 5.1614 },
  { title: "Huizen", subtitle: "Het Gooi", city: "Huizen", lat: 52.2992, lon: 5.2414 },
  { title: "Laren", subtitle: "Het Gooi", city: "Laren", lat: 52.2575, lon: 5.2278 },
  { title: "Blaricum", subtitle: "Het Gooi", city: "Blaricum", lat: 52.2725, lon: 5.2447 },
  { title: "Weesp", subtitle: "Gemeente Amsterdam", city: "Weesp", lat: 52.3083, lon: 5.0417 },
  { title: "Muiden", subtitle: "Gooise Meren", city: "Muiden", lat: 52.3306, lon: 5.0708 },
  { title: "Eemnes", subtitle: "Utrecht", city: "Eemnes", lat: 52.2592, lon: 5.2603 },

  // Major NL cities (generic use)
  { title: "Amsterdam Centraal", subtitle: "Stationsplein, Amsterdam", city: "Amsterdam", lat: 52.3791, lon: 4.9003 },
  { title: "Amsterdam Zuid", subtitle: "Zuidas, Amsterdam", city: "Amsterdam", lat: 52.3389, lon: 4.8730 },
  { title: "Amsterdam RAI", subtitle: "Europaplein, Amsterdam", city: "Amsterdam", lat: 52.3411, lon: 4.8895 },
  { title: "Utrecht Centraal", subtitle: "Stationshal, Utrecht", city: "Utrecht", lat: 52.0894, lon: 5.1100 },
  { title: "Rotterdam Centraal", subtitle: "Stationsplein, Rotterdam", city: "Rotterdam", lat: 51.9249, lon: 4.4690 },
  { title: "Den Haag Centraal", subtitle: "Den Haag", city: "Den Haag", lat: 52.0808, lon: 4.3249 },
  { title: "Eindhoven Centraal", subtitle: "Eindhoven", city: "Eindhoven", lat: 51.4430, lon: 5.4797 },
  { title: "Groningen", subtitle: "Stad Groningen", city: "Groningen", lat: 53.2110, lon: 6.5665 },
  { title: "Maastricht", subtitle: "Limburg", city: "Maastricht", lat: 50.8514, lon: 5.6910 },
  { title: "Haarlem", subtitle: "Noord-Holland", city: "Haarlem", lat: 52.3874, lon: 4.6462 },
  { title: "Amersfoort", subtitle: "Utrecht", city: "Amersfoort", lat: 52.1561, lon: 5.3878 },
  { title: "Zwolle", subtitle: "Overijssel", city: "Zwolle", lat: 52.5168, lon: 6.0830 },
  { title: "Hilversum", subtitle: "Het Gooi", city: "Hilversum", lat: 52.2292, lon: 5.1669 },
  { title: "Apeldoorn", subtitle: "Gelderland", city: "Apeldoorn", lat: 52.2112, lon: 5.9699 },
  { title: "Breda", subtitle: "Noord-Brabant", city: "Breda", lat: 51.5719, lon: 4.7683 },
];

function localSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PLACES.filter((p) =>
    p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
  ).slice(0, 7);
}

/* Optional live enrichment via OpenStreetMap Nominatim (keyless, CORS-enabled).
   Fails silently in sandboxed previews; the curated list always works. */
async function liveSearch(query) {
  const q = query.trim();
  if (q.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&accept-language=nl&countrycodes=nl,be,de&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d) => {
      const a = d.address || {};
      const city = a.city || a.town || a.village || a.municipality || a.county || "";
      const name = d.name || (d.display_name || "").split(",")[0];
      const rest = (d.display_name || "").split(",").slice(1, 3).join(",").trim();
      return { title: name, subtitle: rest, city, lat: parseFloat(d.lat), lon: parseFloat(d.lon) };
    });
  } catch (e) {
    return [];
  }
}

/* Merge curated + live, de-duped by rounded coordinate. */
async function searchPlaces(query) {
  const local = localSearch(query);
  const live = await liveSearch(query);
  const seen = new Set(local.map((p) => p.title.toLowerCase()));
  const merged = local.slice();
  for (const p of live) {
    const key = (p.lat.toFixed(3) + p.lon.toFixed(3));
    if (!seen.has(p.title.toLowerCase()) && !merged.some((m) => (m.lat.toFixed(3) + m.lon.toFixed(3)) === key)) {
      merged.push(p);
    }
  }
  return merged.slice(0, 8);
}

Object.assign(window, { PLACES, localSearch, searchPlaces });
