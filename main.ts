// DompetKeluarga — program penyerahan (Node 22, pustaka standar saja).
// Situsnya adalah berkas statis di app/ (tanpa build step) dan potret layarnya
// di screenshots/. Program ini menyalin keduanya ke direktori keluaran dan
// menulis dossier.json memakai pustaka make.fun yang sudah divendor di
// vendor/makefun-frontend.ts — berkas vendor itu jangan diubah, karena
// penilai membangun ulang dossier dengan salinannya sendiri dan membandingkan
// byte demi byte.
//
// Di luar wadah penilai, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas penilai (maks. 4 screenshot @ 256 KiB; app/ maks. 993 berkas dan
// 16 MiB) diterapkan di sini supaya yang lolos lokal juga lolos di penilai.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
