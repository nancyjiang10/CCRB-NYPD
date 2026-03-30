import fs from "fs";
import path from "node:path";

const url = "https://data.cityofnewyork.us/resource/6xgr-kwjq.json";
const response = await fetch(url);

if (!response.ok) {
	throw new Error(`Failed to fetch police data: ${response.status}`);
}

const policeRecords = await response.json();
console.log(`Fetched ${policeRecords.length} police records.`);

const dataDir = path.join("src", "lib", "data");
fs.mkdirSync(dataDir, { recursive: true });

const outputPath = path.join(dataDir, "police.json");
fs.writeFileSync(outputPath, JSON.stringify(policeRecords, null, 2));
console.log(`Saved to ${outputPath}`);


