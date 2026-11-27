// HearthBudget — the program that hands this entry in.
//
// The entry itself is a plain static site: app/ holds the pages, styles
// and scripts, and screenshots/ holds four real renders of it in a
// browser. There is no build step and nothing is fetched over the network,
// so handing the entry in means copying those two folders into the
// grader's output directory and writing the dossier beside them.
//
// The dossier is the summary the judge reads — the screenshots, the files
// a first load fetches and their sizes, and the site's source — built by
// the make.fun library vendored at vendor/makefun-frontend.ts. That file
// must stay byte-for-byte as the kit shipped it: the scorer rebuilds the
// dossier from its own copy and the two have to match exactly.
//
// Run it locally with:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader runs it with no environment variable, so the output
// directory defaults to /output there. Node 22 or newer, standard
// library only, and the same input always writes the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// This file's own folder is the repository root; the handoff goes here.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own limits, from the kit's RULES.txt. The dossier text is
// capped at 160 KiB; screenshots are at most four, each at most 256 KiB;
// app/ holds at most 993 files and directories and 16 MiB in total. The
// whole of /output shares the platform's 1,000-entry, 64 MiB cap, so the
// dossier is refused — and the entry with it — if any of these is past.
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function copyFolder(name, required) {
  const from = join(repoRoot, name);
  if (!existsSync(from)) {
    // A missing app/ means the repository is broken; fail loudly instead
    // of handing in an empty entry. A missing screenshots/ is the same
    // kind of build mistake — the gate refuses an entry without them, so
    // a clear error here is worth more than a silent partial handoff.
    if (required) throw new Error(`missing folder in repository: ${name}/`);
    return false;
  }
  cpSync(from, join(outputDir, name), { recursive: true });
  return true;
}

// Copy the site first, then its screenshots, and only then build the
// dossier from what actually landed in the output directory — that way
// the dossier can never describe files that are not really there.
mkdirSync(outputDir, { recursive: true });
copyFolder('app', true);
copyFolder('screenshots', true);

const dossier = buildDossier(outputDir, DOSSIER_OPTIONS);
if (!dossier || dossier.length === 0) {
  throw new Error('buildDossier returned an empty dossier');
}
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, dossier);

console.log(`HearthBudget handed in to ${outputDir} (dossier.json: ${dossier.length} bytes)`);
