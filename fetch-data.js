import fs from "fs";
import path from "node:path";

const url = "https://data.cityofnewyork.us/resource/tg4x-b46p.json?$where=eventtype='Shooting Permit'&$order=startdatetime DESC&$limit=25";
const response = await fetch(url);
const permits = await response.json();
const manhattan = permits.filter(d => d.borough === "MANHATTAN");

console.log(`Filtered ${manhattan.length} permits from Manhattan.`);

const dataDir = path.join("src", "lib", "data");
fs.mkdirSync(dataDir, { recursive: true });

const outputPath = path.join(dataDir, "permits.json");
fs.writeFileSync(outputPath, JSON.stringify(permits, null, 2));
console.log(`Saved to ${outputPath}`);


