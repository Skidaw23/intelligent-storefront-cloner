# 3D Scroll Product Showcase for Shopify

This repository contains everything you need to add a high‑performance, scroll‑driven 3D product viewer to your Shopify theme and manage it through a local MCP server.  It includes:

- **product‑3d‑scroll.liquid** – A Shopify section that renders the 3D scroll viewer and exposes customizable settings.
- **product‑3d‑scroll.css** – Styling for the viewer, ensuring full‑viewport display and responsive behaviour.
- **product‑3d‑scroll.js** – A vanilla JavaScript module that lazily loads the image sequence, detects WebP support and handles scroll and drag events.
- **mcp_shopify_server.js** – A Node/Express server that can upload the section and its assets to your store’s theme and optionally watch for changes.
- **mcp_package.json** – Lists the server dependencies (copy this file to `package.json` when running the server).

## Prerequisites

1. **Node.js** 16 or newer (required for optional `node-fetch` dynamic import and global `fetch` support).
2. A **Shopify Admin API access token** with `write_themes` scope.
3. Your **Shopify store subdomain** (e.g. `mystore` if your admin is at `mystore.myshopify.com`).

## Adding the Section to Your Theme

1. Place your image sequence in your theme’s **assets** folder.  Each frame must be named sequentially as `frame1.jpg`, `frame2.jpg`, etc.  For WebP support, you can also provide `frame1.webp`, `frame2.webp`, etc.; the script will automatically prefer WebP if the browser supports it.
2. Create a folder in `assets/` for your frames, e.g. `product_frames/earbuds`, and upload all images there (you can use the MCP server or the Shopify admin UI).
3. Upload the files:
   - **product‑3d‑scroll.liquid** to `sections/`
   - **product‑3d‑scroll.css** to `assets/`
   - **product‑3d‑scroll.js** to `assets/`

You can do this manually via the Shopify Code Editor or automatically using the MCP server described below.

4. In the Shopify Customizer, add the **3D Scroll Product Showcase** section to your product template and configure:
   - **Frames folder path**: e.g. `product_frames/earbuds`
   - **Number of frames**: the total number of images in your sequence
   - **Enable touch drag**: whether users can rotate the view by dragging on touch devices and desktops

## Using the MCP Shopify Server

The provided MCP server simplifies deploying the section and assets to your Shopify store and can watch for local file changes to automatically sync them.

### Installation

```bash
git clone <repository-url>
cd <repository-folder>
# copy the package definition for the MCP server
cp mcp_package.json package.json
npm install
```

### Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Your Shopify store subdomain (do not include .myshopify.com)
SHOPIFY_STORE=mystore

# Admin API access token with write_themes permissions
SHOPIFY_ACCESS_TOKEN=shpat_********************************

# Shopify API version (optional, defaults to 2024-04)
API_VERSION=2024-04

# Optional: default theme ID used for file watching
THEME_ID=123456789

# Set to 'true' to enable file watching and automatic syncing
WATCH_FILES=true

# Local port for the server (optional)
PORT=3000
```

### Running the Server

```bash
npm start
```

### Endpoints

- `GET /themes` – Returns a list of available themes in your store.
- `POST /publish-section` – Uploads the 3D scroll section and its assets to a given theme.  Body: `{ "themeId": <theme-id> }`.
- `POST /upload-frames` – Uploads a set of frame images to a theme.  Body: `{ "themeId": <theme-id>, "frames": [ { "name": "product_frames/earbuds/frame1.jpg", "content": "<base64>" }, ... ] }`.

If `WATCH_FILES` is set to `true` and `THEME_ID` is provided, the server will monitor `product‑3d‑scroll.liquid`, `product‑3d‑scroll.css` and `product‑3d‑scroll.js` for changes and automatically push updates to the specified theme.

## Frame Naming Conventions

The JavaScript assumes frames are named sequentially without zero padding (`frame1.jpg`, `frame2.jpg`, …).  If you prefer to zero‑pad your filenames (`frame001.jpg`, `frame002.jpg`, …), adjust the naming logic in **product‑3d‑scroll.js** accordingly.

## Security Considerations

The access token used by the MCP server grants write access to your themes.  Keep it secret and secure.  When exposing the server publicly (e.g. on a cloud host), protect the endpoints with authentication or IP whitelisting.

## Support

This codebase is provided as a production‑ready starting point.  You can extend it to suit your workflow—such as integrating with CI/CD pipelines, enabling real‑time previews or adding additional endpoints for other assets.