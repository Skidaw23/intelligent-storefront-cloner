/**
 * Shopify MCP server
 *
 * This server provides endpoints to interact with a Shopify store via the
 * Admin API.  It enables uploading of assets such as the 3D scroll section
 * (Liquid, CSS, JS) and image frames, as well as listing available themes.
 *
 * Configure the following environment variables before running:
 *   SHOPIFY_STORE      - your Shopify store subdomain (e.g. 'myshop')
 *   SHOPIFY_ACCESS_TOKEN - an Admin API access token with write_themes scope
 *   API_VERSION        - the Shopify API version (e.g. '2024-04')
 *   THEME_ID           - optional default theme id used for auto-watch mode
 *   WATCH_FILES        - set to 'true' to watch local files and auto-update the theme
 *   PORT               - the port the server listens on (default: 3000)
 *
 * To install dependencies: `npm install`
 * To run: `node mcp_shopify_server.js`
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
require('dotenv').config();

// Dynamic import of node-fetch to support both CommonJS and ESM environments
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json({ limit: '50mb' }));

const {
  SHOPIFY_STORE,
  SHOPIFY_ACCESS_TOKEN,
  API_VERSION = '2024-04',
  THEME_ID,
  WATCH_FILES,
} = process.env;

if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
  console.error(
    'Error: SHOPIFY_STORE and SHOPIFY_ACCESS_TOKEN environment variables must be set.',
  );
  process.exit(1);
}

/**
 * Performs a request against the Shopify Admin API.
 * @param {string} endpoint - The endpoint relative to /admin/api/{version}
 * @param {string} method - HTTP method (GET, POST, PUT)
 * @param {Object} body - Optional request body
 * @returns {Promise<any>} Parsed JSON response
 */
async function shopifyRequest(endpoint, method = 'GET', body) {
  const url = `https://${SHOPIFY_STORE}.myshopify.com/admin/api/${API_VERSION}${endpoint}`;
  const options = {
    method,
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Shopify API error ${res.status} on ${endpoint}: ${text}`,
    );
  }
  return res.json();
}

/**
 * Uploads an asset to a given theme.  The asset content is read from the
 * provided string.  Binary data must be converted to base64 outside this
 * function.
 * @param {string|number} themeId
 * @param {string} key - The key within the theme (e.g. 'sections/file.liquid')
 * @param {string} content - Raw text content
 */
async function uploadAsset(themeId, key, content) {
  const payload = {
    asset: {
      key,
      attachment: Buffer.from(content).toString('base64'),
    },
  };
  return shopifyRequest(`/themes/${themeId}/assets.json`, 'PUT', payload);
}

/**
 * Lists all themes for the authenticated store.
 */
app.get('/themes', async (req, res) => {
  try {
    const data = await shopifyRequest('/themes.json');
    res.json(data.themes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Publishes the 3D scroll section and assets to a theme.
 * Expects JSON body: { themeId: <id> }
 */
app.post('/publish-section', async (req, res) => {
  const { themeId } = req.body;
  if (!themeId) {
    return res.status(400).json({ error: 'themeId is required' });
  }
  try {
    const liquid = fs.readFileSync(
      path.join(__dirname, 'product-3d-scroll.liquid'),
      'utf8',
    );
    const css = fs.readFileSync(
      path.join(__dirname, 'product-3d-scroll.css'),
      'utf8',
    );
    const js = fs.readFileSync(
      path.join(__dirname, 'product-3d-scroll.js'),
      'utf8',
    );
    await uploadAsset(themeId, 'sections/product-3d-scroll.liquid', liquid);
    await uploadAsset(themeId, 'assets/product-3d-scroll.css', css);
    await uploadAsset(themeId, 'assets/product-3d-scroll.js', js);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Uploads a set of frames to the assets folder of a theme.
 * Expects JSON body: { themeId: <id>, frames: [ { name: 'product_frames/frame1.jpg', content: '<base64>' }, ... ] }
 */
app.post('/upload-frames', async (req, res) => {
  const { themeId, frames } = req.body;
  if (!themeId || !frames || !Array.isArray(frames)) {
    return res
      .status(400)
      .json({ error: 'themeId and frames array are required' });
  }
  try {
    for (const frame of frames) {
      // Each frame should include the relative name within assets
      await uploadAsset(themeId, `assets/${frame.name}`, Buffer.from(frame.content, 'base64'));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Optional file watcher to automatically sync section and asset changes to a default theme.
 */
function setupWatcher() {
  if (WATCH_FILES !== 'true' || !THEME_ID) return;
  const watchFiles = [
    'product-3d-scroll.liquid',
    'product-3d-scroll.css',
    'product-3d-scroll.js',
  ];
  const keyMap = {
    'product-3d-scroll.liquid': 'sections/product-3d-scroll.liquid',
    'product-3d-scroll.css': 'assets/product-3d-scroll.css',
    'product-3d-scroll.js': 'assets/product-3d-scroll.js',
  };
  const watcher = chokidar.watch(watchFiles, { ignoreInitial: true });
  watcher.on('change', async (filePath) => {
    const fileName = path.basename(filePath);
    const key = keyMap[fileName];
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    try {
      await uploadAsset(THEME_ID, key, content);
      console.log(`${fileName} updated on theme ${THEME_ID}`);
    } catch (err) {
      console.error(`Failed to update ${fileName}: ${err.message}`);
    }
  });
  console.log(
    `Watching ${watchFiles.join(
      ', ',
    )} for changes.  Updates will sync to theme ${THEME_ID}.`,
  );
}

setupWatcher();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MCP Shopify server running on port ${port}`);
});