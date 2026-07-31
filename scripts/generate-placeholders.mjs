import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const output = path.join(process.cwd(), "public", "placeholders");
await mkdir(output, { recursive: true });

const assets = [
  ["hero.webp", 1800, 1320, "#7f685d", "#d5c0ae", "OUR STORY", "Replace with your hero photograph"],
  ["couple.webp", 1200, 1500, "#75635d", "#cab3a4", "MILAN + PARTNER", "Replace with your portrait"],
  ...Array.from({ length: 6 }, (_, index) => [
    "story-0" + (index + 1) + ".webp",
    index % 2 === 0 ? 1200 : 1400,
    index % 2 === 0 ? 1500 : 1050,
    ["#8d6e62", "#8b7664", "#6f776d", "#8a6b71", "#65737c", "#70677d"][index],
    ["#dfc9b6", "#d5b991", "#bdc3aa", "#d4b2ad", "#b8c7c9", "#c6b9ce"][index],
    "MEMORY " + String(index + 1).padStart(2, "0"),
    "Replace with your photograph",
  ]),
  ...Array.from({ length: 8 }, (_, index) => [
    "detail-0" + (index + 1) + ".webp",
    index % 3 === 0 ? 1500 : 1200,
    index % 3 === 0 ? 1000 : 1500,
    ["#72574e", "#8c7966", "#87646b", "#967651", "#64756b", "#657887", "#836c5f", "#67617b"][index],
    ["#cfac90", "#e0cdb1", "#d9b4b7", "#e2c08b", "#bcc6a9", "#b8ced0", "#d1b89d", "#c7bad3"][index],
    "DETAIL " + String(index + 1).padStart(2, "0"),
    "Your caption belongs here",
  ]),
];

const esc = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

for (const [name, width, height, start, end, title, subtitle] of assets) {
  const svg =
    '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + " " + height + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + start + '"/><stop offset="1" stop-color="' + end + '"/></linearGradient>' +
    '<radialGradient id="light"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
    '<rect width="100%" height="100%" fill="url(#bg)"/>' +
    '<circle cx="' + Math.round(width * 0.74) + '" cy="' + Math.round(height * 0.28) + '" r="' + Math.round(Math.min(width, height) * 0.32) + '" fill="url(#light)"/>' +
    '<path d="M-' + width * 0.1 + " " + height * 0.76 + " L" + width * 0.82 + " " + height * 0.08 + " L" + width * 1.12 + " " + height * 0.32 + " L" + width * 0.18 + " " + height * 1.05 + 'Z" fill="' + start + '" opacity=".36"/>' +
    '<rect x="' + width * 0.07 + '" y="' + height * 0.08 + '" width="' + width * 0.86 + '" height="' + height * 0.84 + '" fill="none" stroke="#fff" stroke-opacity=".28"/>' +
    '<text x="' + width * 0.1 + '" y="' + height * 0.82 + '" fill="#fff" font-family="Georgia, serif" font-size="' + Math.round(width * 0.052) + '" letter-spacing="' + Math.round(width * 0.006) + '">' + esc(title) + "</text>" +
    '<text x="' + width * 0.1 + '" y="' + height * 0.87 + '" fill="#fff" fill-opacity=".76" font-family="Arial, sans-serif" font-size="' + Math.round(width * 0.014) + '" letter-spacing="' + Math.round(width * 0.002) + '">' + esc(subtitle) + "</text></svg>";
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(path.join(output, name));
}

console.log("Generated " + assets.length + " local WebP placeholders.");
