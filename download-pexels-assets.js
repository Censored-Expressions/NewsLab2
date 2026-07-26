const fs = require("node:fs");
const path = require("node:path");

function loadLocalEnvFile(filePath = path.join(__dirname, ".env")) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!key || process.env[key]) return;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  });
}

loadLocalEnvFile();

const apiKey = process.env.PEXELS_API_KEY || "";
const publicDir = __dirname;
const assetDir = path.join(publicDir, "assets", "pexels");

const slots = [
  ["weather-response.jpg", "storm cleanup utility crews"],
  ["legal-justice.jpg", "courthouse justice law"],
  ["global-affairs.jpg", "world news diplomacy"],
  ["family-community.jpg", "family community school"],
  ["sports-competition.jpg", "sports competition stadium"],
  ["culture-media.jpg", "music film culture"],
  ["business-economy.jpg", "business economy city"],
  ["government-civic.jpg", "government building civic"],
  ["newsroom-general.jpg", "newsroom journalism"]
];

function assertApiKey() {
  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is required. Set it in the environment before running this downloader.");
  }
}

async function pexelsSearch(query) {
  const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5`, {
    headers: { authorization: apiKey }
  });
  if (!response.ok) throw new Error(`Pexels search failed for "${query}" with HTTP ${response.status}.`);
  const payload = await response.json();
  const photo = (payload.photos || []).find(item => item?.src?.large);
  if (!photo) throw new Error(`No usable Pexels image found for "${query}".`);
  return photo;
}

async function downloadImage(url, targetPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed with HTTP ${response.status}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(targetPath, bytes);
}

async function main() {
  assertApiKey();
  fs.mkdirSync(assetDir, { recursive: true });
  const credits = [];

  for (const [fileName, query] of slots) {
    const targetPath = path.join(assetDir, fileName);
    const photo = await pexelsSearch(query);
    await downloadImage(photo.src.large, targetPath);
    credits.push({
      fileName,
      query,
      photographer: photo.photographer || "",
      photographerUrl: photo.photographer_url || "",
      pexelsUrl: photo.url || "",
      downloadedAt: new Date().toISOString()
    });
    console.log(`Saved ${fileName} from ${photo.photographer || "Pexels"}.`);
  }

  fs.writeFileSync(path.join(assetDir, "credits.json"), `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`Saved credits.json with ${credits.length} records.`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
