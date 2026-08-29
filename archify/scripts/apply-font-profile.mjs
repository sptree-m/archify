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

const googleFontHref = 'https://fonts.googleapis.com/css2?family=M+PLUS+1+Code:wght@400;500;600;700&display=swap';

// Replace the default JetBrains Mono Google Fonts dependency with M PLUS 1 Code.
// This keeps font metrics consistent on PCs where M PLUS 1 Code is not installed.
html = html
  .replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=JetBrains\+Mono:[^"']+/gi, googleFontHref)
  .replaceAll("'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono CJK SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', monospace", profile.cssFamily)
  .replaceAll("'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono CJK SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', monospace;", `${profile.cssFamily};`)
  .replaceAll("local('JetBrains Mono'), local('JetBrainsMono-Regular')", "local('M PLUS 1 Code'), local('MPLUS1Code-Regular')")
  .replaceAll("font-family: 'JetBrains Mono'", "font-family: 'M PLUS 1 Code'")
  .replaceAll("font-family: \'JetBrains Mono\'", "font-family: \'M PLUS 1 Code\'");

// Add an explicit marker so downstream checks can verify which profile was applied.
html = html.replace('<html ', `<html data-font-profile="${profile.id}" `);

if (!html.includes(googleFontHref)) {
  fail('Font post-process failed: M PLUS 1 Code Google Fonts reference was not applied.');
}
if (!html.includes('M PLUS 1 Code')) {
  fail('Font post-process failed: M PLUS 1 Code was not applied.');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(outputPath);
