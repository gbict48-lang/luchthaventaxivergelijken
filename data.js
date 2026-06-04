"use strict";
/* Fare data + logic — lifted & lightly trimmed from the production assets/app.js
   (gbict48-lang/luchthaventaxivergelijken). Exposed on window for the UI kit. */

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

function haversineKm(a, b) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
const roadKm = (a, b) => haversineKm(a, b) * 1.25;
const round5 = (x) => Math.round(x / 5) * 5;

function ownFare(cityKey, airportCode) {
  const city = CITIES[cityKey], airport = AIRPORTS[airportCode];
  if (airportCode === "AMS" && SCHIPHOL_FIXED[cityKey]) {
    return { ...SCHIPHOL_FIXED[cityKey], fixed: true };
  }
  const km = roadKm(city, airport);
  const sedan = round5(km * 1.1 + 35);
  return { sedan, van: round5(sedan * 1.2), fixed: false };
}

function competitorFare(cityKey, airportCode, base, perKm, perMin, booking, minFare, vanFactor, isVan) {
  const km = roadKm(CITIES[cityKey], AIRPORTS[airportCode]);
  const min = Math.max(10, km * 0.8);
  let price = base + perKm * km + perMin * min + booking;
  price = Math.max(minFare, price);
  if (isVan) price *= vanFactor;
  return Math.round(price);
}

const euro = (n) => "€" + Math.round(n);

/* Build the three sorted comparison rows for a query. */
function compareFares(cityKey, airportCode, paxType) {
  const isVan = paxType === "van";
  const own = ownFare(cityKey, airportCode);
  const ownPrice = isVan ? own.van : own.sedan;
  const uber = competitorFare(cityKey, airportCode, 3.5, 1.45, 0.30, 2.0, 8.5, 1.6, isVan);
  const bolt = competitorFare(cityKey, airportCode, 2.5, 1.25, 0.25, 1.5, 7.0, 1.55, isVan);

  const rows = [
    { name: "Onze luchthaventaxi", ico: "🚕", price: ownPrice, own: true, fixed: own.fixed,
      sub: own.fixed ? "Vaste prijs · vaste chauffeur" : "Vaste richtprijs · vaste chauffeur",
      book: BOOKING_URL },
    { name: "Uber", ico: "⬛", price: uber, sub: "Schatting · prijs varieert met drukte" },
    { name: "Bolt", ico: "🟩", price: bolt, sub: "Schatting · prijs varieert met drukte" },
  ].sort((a, b) => a.price - b.price);

  const dearest = Math.max(...rows.map((r) => r.price));
  const cheapest = rows[0].price;
  return { rows, dearest, cheapest, fixed: own.fixed, isVan };
}

Object.assign(window, {
  BOOKING_URL, PHONE, AIRPORTS, CITIES, SCHIPHOL_FIXED,
  ownFare, compareFares, euro,
});
