#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { resolveFontProfile } from '../renderers/shared/font-profile.mjs';

function fail(message) {
  console.error(message);
  process.exit(2);
}

const input = process.argv[2];
const output = process.argv[3] || input;
if (!input) fail('Usage: node scripts/apply-font-profile.mjs <input.html> [output.html]');

const inputPath = path.resolve(input);
const outputPath = path.resolve(output);
const profile = resolveFontProfile('mplus-1-code');
let html = fs.readFileSync(inputPath, 'utf8');

// Remove all Google Fonts network dependencies. The resulting artifact is
// intentionally local-only: if M PLUS 1 Code is unavailable, CSS falls back
// to the next locally installed Japanese monospace-capable font.
html = html
  .replace(/\s*<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"[^>]*>\s*/gi, '\n')
  .replace(/\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=JetBrains\+Mono:[^>]*>\s*/gi, '\n')
  .replace(/\s*<noscript>\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=JetBrains\+Mono:[^>]*>\s*<\/noscript>\s*/gi, '\n');

// Replace the renderer/viewer font stack and standalone SVG export fallback.
html = html
  .replaceAll("'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono CJK SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', monospace", profile.cssFamily)
  .replaceAll("'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono CJK SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', monospace;", `${profile.cssFamily};`)
  .replaceAll("local('JetBrains Mono'), local('JetBrainsMono-Regular')", "local('M PLUS 1 Code'), local('MPLUS1Code-Regular')")
  .replaceAll("font-family: 'JetBrains Mono'", "font-family: 'M PLUS 1 Code'")
  .replaceAll("font-family: \'JetBrains Mono\'", "font-family: \'M PLUS 1 Code\'");

// Add an explicit marker so downstream checks can verify which profile was
// applied without relying on visual inspection.
html = html.replace('<html ', `<html data-font-profile="${profile.id}" `);

if (/fonts\.(googleapis|gstatic)\.com/i.test(html)) {
  fail('Font post-process failed: external Google Fonts reference remains.');
}
if (!html.includes('M PLUS 1 Code')) {
  fail('Font post-process failed: M PLUS 1 Code was not applied.');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(outputPath);
