import { countries } from "../data/index.js";

const HISTORICAL_TO_ID = {
  "West Germany": "germany",
  "East Germany": null,
  "Soviet Union": null,
  "Yugoslavia": null,
  "FR Yugoslavia": null,
  "Serbia and Montenegro": null,
  "Czechoslovakia": null,
  "Zaire": "dr-congo",
  "DR Congo": "dr-congo",
  "Dutch East Indies": "indonesia",
  "Ivory Coast": "ivory-coast",
  "Côte d'Ivoire": "ivory-coast",
  "South Korea": "south-korea",
  "North Korea": "north-korea",
  "United States": "usa",
  "USA": "usa",
  "Republic of Ireland": "republic-of-ireland",
  "Bosnia & Herzegovina": "bosnia-and-herzegovina",
  "Bosnia and Herzegovina": "bosnia-and-herzegovina",
  "Trinidad and Tobago": "trinidad-and-tobago",
  "Trinidad & Tobago": "trinidad-and-tobago",
  "Northern Ireland": "northern-ireland",
  "Türkiye": "turkey",
  "Czechia": "czech-republic",
};

const NAME_TO_ID = Object.fromEntries(countries.map((c) => [c.name, c.id]));

export function opponentCountryId(name) {
  if (name in HISTORICAL_TO_ID) return HISTORICAL_TO_ID[name];
  return NAME_TO_ID[name] ?? null;
}
