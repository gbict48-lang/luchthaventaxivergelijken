"use strict";
/* =========================================================================
   TaxiGeld — pricing engine + place data, ported 1:1 from the iOS app
   (taxi-geld/TaxiGeld/Services/Pricing/*, Geo/Geo.swift, Models/*).
   Generic: works for ANY origin/destination, not just Almere.
   Exposed on window for the React UI kit.
   ========================================================================= */

/* ---- Geo: road distance + duration estimate (Geo.swift) ---------------- */
const Geo = {
  roadFactor: 1.30,
  averageSpeedKmh: 32.0,
  haversineKm(a, b) {
    const R = 6371, toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
    const s = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  },
  metrics(a, b) {
    const straight = Geo.haversineKm(a, b);
    const km = Math.round(straight * Geo.roadFactor * 10) / 10;
    const minutes = Math.max(1, Math.round((km / Geo.averageSpeedKmh) * 60));
    return { km, minutes };
  },
};

/* ---- Tariff (Tariff.swift) --------------------------------------------- */
function tariffPrice(t, km, minutes) {
  const raw = t.base + t.perKm * km + t.perMinute * minutes + t.bookingFee;
  return Math.round(Math.max(t.minimumFare, raw) * 100) / 100;
}

/* ---- Surge (Surge.swift) ----------------------------------------------- */
function surgeMultiplier(date, sensitivity) {
  if (sensitivity <= 0) return 1.0;
  const hour = date.getHours();
  const weekday = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = weekday === 0 || weekday === 6;
  let extra = 0.0;
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) extra += 0.25; // spits
  if (hour >= 23 || hour < 5) extra += isWeekend ? 0.40 : 0.20;              // nacht
  if (isWeekend && hour >= 20 && hour <= 22) extra += 0.15;                  // uitgaan
  return 1.0 + extra * sensitivity;
}

/* ---- Providers (CompetitorProviders.swift + Provider.swift) ------------ */
const PROVIDERS = {
  TaxiGeld:     { name: "TaxiGeld",    tagline: "Onze eigen rit — gegarandeerd de scherpste prijs", tint: "var(--tg-brand)", icon: "badge-check", deepLink: false },
  Uber:         { name: "Uber",        tagline: "Geschatte prijs",            tint: "var(--tg-uber)",  icon: "car-front",   deepLink: true },
  Bolt:         { name: "Bolt",        tagline: "Geschatte prijs",            tint: "var(--tg-bolt)",  icon: "zap",         deepLink: true },
  "Lokale taxi":{ name: "Lokale taxi", tagline: "Geregeld maximumtarief",     tint: "var(--tg-local)", icon: "circle-user",  deepLink: false },
};

const TARIFFS = {
  uber:  { base: 3.50, perKm: 1.45, perMinute: 0.30, bookingFee: 2.00, minimumFare: 8.50 },
  bolt:  { base: 2.50, perKm: 1.25, perMinute: 0.25, bookingFee: 1.50, minimumFare: 7.00 },
  local: { base: 3.96, perKm: 2.50, perMinute: 0.42, bookingFee: 0.00, minimumFare: 12.00 },
  own:   { base: 2.00, perKm: 1.05, perMinute: 0.22, bookingFee: 0.00, minimumFare: 6.00 },
};

function estimate(provider, price, etaMinutes, duration, rating, surge, spread) {
  const rounded = Math.round(price * 100) / 100;
  return {
    provider, price: rounded,
    priceLow: rounded * (1 - spread), priceHigh: rounded * (1 + spread),
    pickupEtaMinutes: etaMinutes, durationMinutes: duration,
    rating, surge, isEstimate: true, isBookable: false, note: null,
  };
}

/* ---- SchipholPricing (SchipholPricing.swift) --------------------------- */
const SCHIPHOL = { lat: 52.3105, lon: 4.7683, radiusKm: 6.0 };
const SCHIPHOL_FARES = {
  almere:{sedan:65,minibus:80}, blaricum:{sedan:70,minibus:80}, bussum:{sedan:65,minibus:75},
  eemnes:{sedan:80,minibus:95}, huizen:{sedan:70,minibus:80}, laren:{sedan:70,minibus:80},
  lelystad:{sedan:100,minibus:120}, muiden:{sedan:55,minibus:65}, naarden:{sedan:60,minibus:70},
  weesp:{sedan:55,minibus:65}, zeewolde:{sedan:95,minibus:110},
};
const isSchiphol = (c) => Geo.haversineKm(c, SCHIPHOL) < SCHIPHOL.radiusKm;
const servesCity = (city) => {
  const n = (city || "").toLowerCase();
  return Object.keys(SCHIPHOL_FARES).some((k) => n.includes(k));
};
function schipholFare(trip) {
  const o = isSchiphol(trip.origin), d = isSchiphol(trip.destination);
  if (o === d) return null; // exactly one side must be Schiphol
  const cityRaw = (o ? trip.destinationCity : trip.originCity).toLowerCase();
  const key = Object.keys(SCHIPHOL_FARES).find((k) => cityRaw.includes(k));
  return key ? { city: key[0].toUpperCase() + key.slice(1), fare: SCHIPHOL_FARES[key] } : null;
}

/* ---- MyTaxiProvider (MyTaxiProvider.swift) ----------------------------- */
const UNDERCUT = 0.93, ABS_MIN = 5.00;
function myTaxiQuote(trip, competitorMin, date) {
  const match = schipholFare(trip);
  if (match) {
    const price = match.fare.sedan;
    return {
      provider: "TaxiGeld", price, priceLow: price, priceHigh: price,
      pickupEtaMinutes: 0, durationMinutes: trip.durationMinutes, rating: 4.9,
      surge: 1.0, isEstimate: false, isBookable: true,
      note: `Vaste prijs · tot 4 pers. · minibus €${Math.round(match.fare.minibus)} (tot 8)`,
    };
  }
  if (!servesCity(trip.originCity)) return null;
  const surge = surgeMultiplier(date, 0.3);
  const own = tariffPrice(TARIFFS.own, trip.distanceKm, trip.durationMinutes) * surge;
  const finalPrice = competitorMin != null
    ? Math.max(ABS_MIN, Math.min(own, competitorMin * UNDERCUT))
    : own;
  const rounded = Math.round(finalPrice * 100) / 100;
  return {
    provider: "TaxiGeld", price: rounded, priceLow: rounded, priceHigh: rounded,
    pickupEtaMinutes: 3, durationMinutes: trip.durationMinutes, rating: 4.9,
    surge, isEstimate: false, isBookable: true, note: null,
  };
}

/* ---- PricingEngine (PricingEngine.swift) ------------------------------- */
function quotesFor(trip, date) {
  const competitors = [
    estimate("Uber",        tariffPrice(TARIFFS.uber,  trip.distanceKm, trip.durationMinutes) * surgeMultiplier(date, 1.0), 4, trip.durationMinutes, 4.6, surgeMultiplier(date, 1.0), 0.12),
    estimate("Bolt",        tariffPrice(TARIFFS.bolt,  trip.distanceKm, trip.durationMinutes) * surgeMultiplier(date, 0.8), 5, trip.durationMinutes, 4.4, surgeMultiplier(date, 0.8), 0.12),
    estimate("Lokale taxi", tariffPrice(TARIFFS.local, trip.distanceKm, trip.durationMinutes), 8, trip.durationMinutes, 4.1, 1.0, 0.05),
  ];
  const competitorMin = Math.min(...competitors.map((q) => q.price));
  const all = competitors.slice();
  const mine = myTaxiQuote(trip, competitorMin, date);
  if (mine) all.push(mine);
  return all.sort((a, b) => a.price - b.price);
}

/* ---- Currency (RideQuote.swift nl_NL formatter) ------------------------ */
const euroFmt = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const euro = (n) => euroFmt.format(Math.round(n));
const euroRange = (lo, hi) => `${euro(lo)} – ${euro(hi)}`;

/* ---- Booking deep-links (BookingLinks.swift) --------------------------- */
const Booking = {
  phone: "0362222222",
  taxiGeldSite: "https://www.airportservicealmere.nl/",
  boltWeb: "https://bolt.eu/nl-nl/",
  uberURL(from, to) {
    let s = "https://m.uber.com/ul/?action=setPickup";
    s += `&pickup[latitude]=${from.lat}&pickup[longitude]=${from.lon}`;
    s += `&dropoff[latitude]=${to.lat}&dropoff[longitude]=${to.lon}`;
    return s.replace(/\[/g, "%5B").replace(/\]/g, "%5D");
  },
  open(provider, from, to) {
    let url = this.taxiGeldSite;
    if (provider === "Uber") url = this.uberURL(from, to);
    else if (provider === "Bolt") url = this.boltWeb;
    else if (provider === "Lokale taxi") url = "tel:" + this.phone;
    window.open(url, "_blank", "noopener");
  },
};

Object.assign(window, {
  Geo, surgeMultiplier, quotesFor, euro, euroRange,
  PROVIDERS, Booking, servesCity, isSchiphol,
});
