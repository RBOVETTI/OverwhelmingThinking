#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { isLikelyArtworkPost, parseCaption } from './instagram-parser.mjs';
import {
  buildArtworkRecord,
  imageFilenameForPost,
  mergeArtworks,
  normalizeArtworksForSite,
  validateArtworks,
} from './instagram-importer-core.mjs';

const IG_APP_ID = '936619743392459';
const DEFAULT_USERNAME = 'riccardo.bovetti';

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const existingArtworks = await readJson(options.paintingsPath);
  const nextId = Math.max(...existingArtworks.map((artwork) => Number(artwork.id) || 0)) + 1;

  await mkdir(options.cacheDir, { recursive: true });
  await mkdir(path.dirname(options.reportPath), { recursive: true });

  const profile = options.fromCache ? await readCachedProfile(options.cacheDir) : await fetchProfile(options.username);
  if (!options.fromCache) {
    await writeJson(path.join(options.cacheDir, 'profile.json'), profile);
  }

  const { pages, items } = options.fromCache ? await readCachedFeedPages(options.cacheDir) : await fetchFeedPages(options);
  if (!options.fromCache) {
    await Promise.all(
      pages.map((page, index) => writeJson(path.join(options.cacheDir, `feed-page-${String(index + 1).padStart(3, '0')}.json`), page)),
    );
  }

  const limitedItems = options.limit ? items.slice(0, options.limit) : items;
  const skipped = [];
  const imported = [];
  let assignedId = nextId;

  for (const item of limitedItems) {
    const captionText = item?.caption?.text || '';
    const image = selectBestImage(item);

    if (!captionText.trim()) {
      skipped.push(skipItem(item, 'missing-caption'));
      continue;
    }
    if (!image) {
      skipped.push(skipItem(item, 'missing-image'));
      continue;
    }

    const importable = isLikelyArtworkPost(item);
    if (!importable) {
      skipped.push(skipItem(item, 'not-artwork-candidate'));
    }

    const record = buildArtworkRecord(item, {
      id: importable ? assignedId++ : 0,
      image: imageFilenameForPost(item),
    });
    record.instagramImportable = importable;

    imported.push({
      item,
      image,
      record,
      parsed: parseCaption(captionText),
    });
  }

  const importableRecords = imported.filter(({ record }) => record.instagramImportable);
  const normalizedExisting = normalizeArtworksForSite(existingArtworks);
  const { artworks: mergedArtworks, added, updated, removed } = mergeArtworks(
    normalizedExisting,
    imported.map(({ record }) => record),
  );
  const finalArtworks = normalizeArtworksForSite(mergedArtworks);
  const finalImportedImages = new Set(finalArtworks.map((artwork) => artwork.image));
  const importedImagesToKeep = imported.filter(({ record }) => finalImportedImages.has(record.image));
  const { downloaded, alreadyPresent, planned } = await handleImages(importedImagesToKeep, options);
  const plannedImages = new Set(importedImagesToKeep.map(({ record }) => record.image));
  const validationErrors = validateArtworks(finalArtworks, {
    imageExists: (relativeImagePath) =>
      existsSync(path.join(options.publicDir, relativeImagePath)) || (!options.apply && plannedImages.has(relativeImagePath)),
  });

  if (options.apply) {
    if (validationErrors.length) {
      throw new Error(`Import aborted because validation failed:\n${validationErrors.join('\n')}`);
    }
    await writeJson(options.paintingsPath, finalArtworks);
  }

  const report = {
    mode: options.apply ? 'apply' : 'dry-run',
    username: options.username,
    startedAt,
    finishedAt: new Date().toISOString(),
    profile: summarizeProfile(profile),
    pagesFetched: pages.length,
    totalPostsFetched: items.length,
    totalPostsConsidered: limitedItems.length,
    artworkCandidates: importableRecords.length,
    sourceReferencePosts: imported.length - importableRecords.length,
    added: added.map(reportArtwork),
    updated: updated.map(reportArtwork),
    removed: removed.map(reportArtwork),
    skipped,
    images: {
      downloaded,
      alreadyPresent,
      planned,
    },
    validationErrors,
    output: {
      paintingsPath: options.apply ? options.paintingsPath : null,
      reportPath: options.reportPath,
      cacheDir: options.cacheDir,
    },
  };

  await writeJson(options.reportPath, report);
  printSummary(report);
}

function parseArgs(argv) {
  const options = {
    username: DEFAULT_USERNAME,
    count: 12,
    maxPages: 60,
    limit: null,
    apply: false,
    fromCache: false,
    paintingsPath: 'src/data/Paintings.json',
    publicDir: 'Public',
    cacheDir: 'tmp/instagram-cache',
    reportPath: 'tmp/instagram-import-report.json',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [name, inlineValue] = arg.split('=');
    const value = inlineValue ?? argv[index + 1];

    if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--from-cache') options.fromCache = true;
    else if (name === '--username') {
      options.username = value;
      if (!inlineValue) index += 1;
    } else if (name === '--count') {
      options.count = Number(value);
      if (!inlineValue) index += 1;
    } else if (name === '--max-pages') {
      options.maxPages = Number(value);
      if (!inlineValue) index += 1;
    } else if (name === '--limit') {
      options.limit = Number(value);
      if (!inlineValue) index += 1;
    } else if (name === '--paintings') {
      options.paintingsPath = value;
      if (!inlineValue) index += 1;
    } else if (name === '--public-dir') {
      options.publicDir = value;
      if (!inlineValue) index += 1;
    } else if (name === '--cache-dir') {
      options.cacheDir = value;
      if (!inlineValue) index += 1;
    } else if (name === '--report') {
      options.reportPath = value;
      if (!inlineValue) index += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function fetchProfile(username) {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  return fetchJson(url);
}

async function fetchFeedPages(options) {
  const pages = [];
  const items = [];
  let maxId = null;

  for (let pageNumber = 1; pageNumber <= options.maxPages; pageNumber += 1) {
    const url = new URL(`https://www.instagram.com/api/v1/feed/user/${options.username}/username/`);
    url.searchParams.set('count', String(options.count));
    if (maxId) url.searchParams.set('max_id', maxId);

    const page = await fetchJson(url.toString());
    pages.push(page);
    items.push(...(page.items || []));

    if (!page.more_available || !page.next_max_id) break;
    maxId = page.next_max_id;
  }

  return { pages, items };
}

async function readCachedProfile(cacheDir) {
  return readJson(path.join(cacheDir, 'profile.json'));
}

async function readCachedFeedPages(cacheDir) {
  const pageFiles = (await readdir(cacheDir))
    .filter((fileName) => /^feed-page-\d+\.json$/.test(fileName))
    .sort();

  if (!pageFiles.length) {
    throw new Error(`No cached Instagram feed pages found in ${cacheDir}`);
  }

  const pages = await Promise.all(pageFiles.map((fileName) => readJson(path.join(cacheDir, fileName))));
  return {
    pages,
    items: pages.flatMap((page) => page.items || []),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'X-IG-App-ID': IG_APP_ID,
      Accept: 'application/json,text/plain,*/*',
      Referer: 'https://www.instagram.com/',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Instagram request failed (${response.status}) for ${url}\n${body.slice(0, 500)}`);
  }

  return response.json();
}

function selectBestImage(item) {
  const candidates = item?.image_versions2?.candidates || item?.carousel_media?.[0]?.image_versions2?.candidates || [];
  return candidates[0] || null;
}

async function handleImages(imported, options) {
  const downloaded = [];
  const alreadyPresent = [];
  const planned = [];

  for (const { image, record } of imported) {
    const targetPath = path.join(options.publicDir, record.image);
    if (existsSync(targetPath) && (await stat(targetPath)).size > 0) {
      alreadyPresent.push(record.image);
      continue;
    }

    if (!options.apply) {
      planned.push({ image: record.image, source: image.url });
      continue;
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    const response = await fetch(image.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Referer: 'https://www.instagram.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`Image download failed (${response.status}) for ${record.image}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(targetPath, buffer);
    downloaded.push(record.image);
  }

  return { downloaded, alreadyPresent, planned };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function skipItem(item, reason) {
  return {
    reason,
    code: item?.code || item?.shortcode || null,
    takenAt: item?.taken_at || null,
    titleGuess: (item?.caption?.text || '').split('\n').find(Boolean) || '',
  };
}

function summarizeProfile(profile) {
  const user = profile?.data?.user || {};
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    biography: user.biography,
    posts: user.edge_owner_to_timeline_media?.count,
    followers: user.edge_followed_by?.count,
  };
}

function reportArtwork(artwork) {
  return {
    id: artwork.id,
    publicationDate: artwork.publicationDate,
    title: artwork.title?.it,
    image: artwork.image,
  };
}

function printSummary(report) {
  console.log(`Instagram import ${report.mode}`);
  console.log(`Fetched ${report.totalPostsFetched} posts across ${report.pagesFetched} pages.`);
  console.log(`Artwork candidates: ${report.artworkCandidates}`);
  console.log(`Source reference posts: ${report.sourceReferencePosts}`);
  console.log(`Added: ${report.added.length}`);
  console.log(`Updated: ${report.updated.length}`);
  console.log(`Removed duplicates: ${report.removed.length}`);
  console.log(`Skipped: ${report.skipped.length}`);
  console.log(`Images downloaded: ${report.images.downloaded.length}`);
  console.log(`Images planned: ${report.images.planned.length}`);
  console.log(`Validation errors: ${report.validationErrors.length}`);
  console.log(`Report: ${report.output.reportPath}`);
}

function printHelp() {
  console.log(`Usage: node scripts/import-instagram-artworks.mjs [options]

Options:
  --dry-run                Fetch, parse, cache, and report without modifying site data (default)
  --apply                  Download images and write src/data/Paintings.json
  --from-cache             Read tmp Instagram cache instead of fetching live endpoints
  --username <name>        Instagram username (default: ${DEFAULT_USERNAME})
  --max-pages <number>     Maximum feed pages to fetch (default: 60)
  --count <number>         Posts per Instagram feed page (default: 12)
  --limit <number>         Only consider the first N fetched posts
  --paintings <path>       Path to Paintings.json
  --public-dir <path>      Public asset directory
  --cache-dir <path>       Raw Instagram cache directory
  --report <path>          Import report path
`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
