"use strict";

/* ----------------------------------------------------------------------------
   Gegevens — pas vrij aan met je eigen exacte tarieven.
   Schiphol-prijzen zijn de VASTE tarieven van Taxi Service Almere.
---------------------------------------------------------------------------- */

const BOOKING_URL = "https://www.airportservicealmere.nl/";
const PHONE = "0362222222";

const AIRPORTS = {
  AMS: { name: "Schiphol",            ico: "🛫", lat: 52.3105, lon: 4.7683 },
  EIN: { name: "Eindhoven Airport",   ico: "✈️", lat: 51.4501, lon: 5.3745 },
  RTM: { name: "Rotterdam The Hague", ico: "🛩️", lat: 51.9569, lon: 4.4377 },
  LEY: { name: "Lelystad Airport",    ico: "🛬", lat: 52.4604, lon: 5.5272 },
  DUS: { name: "Düsseldorf Airport",  ico: "✈️", lat: 51.2895, lon: 6.7668 },
  NRN: { name: "Weeze / Niederrhein", ico: "✈️", lat: 51.6024, lon: 6.1422 },
  BRU: { name: "Brussels Airport",    ico: "🛫", lat: 50.9014, lon: 4.4844 },
  CRL: { name: "Brussels Charleroi",  ico: "✈️", lat: 50.4592, lon: 4.4538 },
};

// Servicesteden (vertrek/bestemming) met coördinaten.
const CITIES = {
  almere:   { name: "Almere",   lat: 52.3508, lon: 5.2647 },
  blaricum: { name: "Blaricum", lat: 52.2725, lon: 5.2447 },
  bussum:   { name: "Bussum",   lat: 52.2769, lon: 5.1614 },
  eemnes:   { name: "Eemnes",   lat: 52.2592, lon: 5.2603 },
  huizen:   { name: "Huizen",   lat: 52.2992, lon: 5.2414 },
  laren:    { name: "Laren",    lat: 52.2575, lon: 5.2278 },
  lelystad: { name: "Lelystad", lat: 52.5185, lon: 5.4714 },
  muiden:   { name: "Muiden",   lat: 52.3306, lon: 5.0708 },
  naarden:  { name: "Naarden",  lat: 52.2958, lon: 5.1631 },
  weesp:    { name: "Weesp",    lat: 52.3083, lon: 5.0417 },
  zeewolde: { name: "Zeewolde", lat: 52.3306, lon: 5.5417 },
};

// VASTE Schiphol-tarieven (taxi / minibus) — exact zoals opgegeven.
const SCHIPHOL_FIXED = {
  almere:   { sedan: 65,  van: 80 },
  blaricum: { sedan: 70,  van: 80 },
  bussum:   { sedan: 65,  van: 75 },
  eemnes:   { sedan: 80,  van: 95 },
  huizen:   { sedan: 70,  van: 80 },
  laren:    { sedan: 70,  van: 80 },
  lelystad: { sedan: 100, van: 120 },
  muiden:   { sedan: 55,  van: 65 },
  naarden:  { sedan: 60,  van: 70 },
  weesp:    { sedan: 55,  van: 65 },
  zeewolde: { sedan: 95,  van: 110 },
};

/* ----------------------------------------------------------------------------
   Rekenfuncties
---------------------------------------------------------------------------- */

function haversineKm(a, b) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
const roadKm = (a, b) => haversineKm(a, b) * 1.25;
const round5 = (x) => Math.round(x / 5) * 5;

// Onze vaste prijs. Schiphol = exacte tabel; overige luchthavens = richtprijs o.b.v. afstand.
function ownFare(cityKey, airportCode) {
  const city = CITIES[cityKey], airport = AIRPORTS[airportCode];
  if (airportCode === "AMS" && SCHIPHOL_FIXED[cityKey]) {
    return { ...SCHIPHOL_FIXED[cityKey], fixed: true };
  }
  const km = roadKm(city, airport);
  const sedan = round5(km * 1.1 + 35);
  return { sedan, van: round5(sedan * 1.2), fixed: false };
}

// Concurrent-schattingen (geen vaste prijs).
function competitorFare(cityKey, airportCode, base, perKm, perMin, booking, minFare, vanFactor, isVan) {
  const km = roadKm(CITIES[cityKey], AIRPORTS[airportCode]);
  const min = Math.max(10, km * 0.8); // ~75 km/u snelweg
  let price = base + perKm * km + perMin * min + booking;
  price = Math.max(minFare, price);
  if (isVan) price *= vanFactor;
  return Math.round(price);
}

/* ----------------------------------------------------------------------------
   UI
---------------------------------------------------------------------------- */

const $ = (id) => document.getElementById(id);

function fillSelects() {
  const citySel = $("city");
  Object.keys(CITIES).forEach((k) => {
    const o = document.createElement("option");
    o.value = k; o.textContent = CITIES[k].name; citySel.appendChild(o);
  });
  const airSel = $("airport");
  Object.keys(AIRPORTS).forEach((k) => {
    const o = document.createElement("option");
    o.value = k; o.textContent = AIRPORTS[k].name; airSel.appendChild(o);
  });
}

function euro(n) { return "€" + Math.round(n); }

function render(cityKey, airportCode, paxType) {
  const isVan = paxType === "van";
  const own = ownFare(cityKey, airportCode);
  const ownPrice = isVan ? own.van : own.sedan;

  const uber = competitorFare(cityKey, airportCode, 3.5, 1.45, 0.30, 2.0, 8.5, 1.6, isVan);
  const bolt = competitorFare(cityKey, airportCode, 2.5, 1.25, 0.25, 1.5, 7.0, 1.55, isVan);

  const rows = [
    { name: "Onze luchthaventaxi", ico: "🚕", price: ownPrice, own: true,
      sub: own.fixed ? "Vaste prijs · vaste chauffeur" : "Vaste richtprijs · vaste chauffeur",
      book: BOOKING_URL },
    { name: "Uber", ico: "⬛", price: uber, sub: "Schatting · prijs varieert met drukte" },
    { name: "Bolt", ico: "🟩", price: bolt, sub: "Schatting · prijs varieert met drukte" },
  ].sort((a, b) => a.price - b.price);

  const cheapest = rows[0].price;
  const dearest = Math.max(...rows.map((r) => r.price));

  $("results").innerHTML = rows.map((r, i) => {
    const best = i === 0;
    const save = dearest - r.price;
    return `
      <div class="result ${best ? "best" : ""}" style="animation-delay:${i * 70}ms">
        <div class="ico">${r.ico}</div>
        <div class="info">
          <h3>${["🥇","🥈","🥉"][i] || ""} ${r.name}
            ${best ? '<span class="badge">Goedkoopste</span>' : ""}
            ${r.own && !best ? '<span class="badge gray">Vaste prijs</span>' : ""}
          </h3>
          <div class="sub">${r.sub}${save >= 1 ? " · bespaar " + euro(save) : ""}</div>
        </div>
        <div class="price">
          <div class="amount">${euro(r.price)}</div>
          ${r.book
            ? `<a class="book" href="${r.book}" target="_blank" rel="noopener">Boek nu</a>`
            : `<a class="book ghost" href="tel:${PHONE}">Bel ons</a>`}
        </div>
      </div>`;
  }).join("");

  const cityName = CITIES[cityKey].name, airName = AIRPORTS[airportCode].name;
  $("resultsMeta").innerHTML =
    `<span>🚗 ${cityName} ⇄ ${airName} · ${isVan ? "5–8 personen" : "1–4 personen"}</span>` +
    `<span>💸 Bespaar tot ${euro(dearest - cheapest)}</span>`;

  $("disclaimer").textContent = own.fixed
    ? "Schipholprijs is een vaste prijs (excl. eventuele tol/parkeren). Uber/Bolt zijn schattingen ter vergelijking."
    : "Prijs voor deze luchthaven is een richtprijs — bel of boek voor de exacte vaste prijs. Uber/Bolt zijn schattingen.";

  $("results").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function buildAirportGrid() {
  $("airportGrid").innerHTML = Object.keys(AIRPORTS).map((code) => {
    const from = ownFare("almere", code);
    return `
      <div class="airport-card" data-code="${code}">
        <div class="a-ico">${AIRPORTS[code].ico}</div>
        ${AIRPORTS[code].name}
        <span class="a-from">v.a. ${euro(from.sedan)}</span>
      </div>`;
  }).join("");
  document.querySelectorAll(".airport-card").forEach((el) => {
    el.addEventListener("click", () => {
      $("airport").value = el.dataset.code;
      render($("city").value, el.dataset.code, $("pax").value);
      document.getElementById("vergelijk").scrollIntoView({ behavior: "smooth" });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillSelects();
  buildAirportGrid();
  $("year").textContent = new Date().getFullYear();

  $("fareForm").addEventListener("submit", (e) => {
    e.preventDefault();
    render($("city").value, $("airport").value, $("pax").value);
  });

  // Toon meteen een voorbeeld: Almere → Schiphol.
  render("almere", "AMS", "sedan");
});
