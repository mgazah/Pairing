# Tech Session - WhatsApp Pairing Code Generator

## Overview
A Node.js/Express web application that generates WhatsApp pairing codes using the `wileys` (Baileys) library. Users can enter their phone number and receive a pairing code to link their WhatsApp account to a bot session.

## Project Structure

```
index.js        - Main Express server (port 5000)
pair.js         - Pairing code route logic using @whiskeysockets/baileys
id.js           - Utility function to generate random session IDs
pair.html       - Frontend pairing UI
main.html       - Main landing page
temp/           - Temporary auth state storage for WhatsApp sessions
package.json    - Node.js dependencies
```

## Key Details

- **Runtime**: Node.js 20
- **Port**: 5000 (bound to 0.0.0.0 for Replit compatibility)
- **Main dependency**: `@whiskeysockets/baileys` aliased from `wileys` npm package
- **Routes**:
  - `/` and `/pair` - Serves the pairing HTML page
  - `/code` - API endpoint to generate WhatsApp pairing codes (query: `?number=PHONENUMBER`)
  - `/uptime` - Returns server uptime in JSON
  - `/session-status/:id` - Polls session connection status

## Themes
4 seasonal themes that auto-rotate every 30 seconds with manual toggle:
- **Rainy** - Blue-grey palette, rain canvas animation, cloud particles
- **Sunny** - Gold/amber palette, sun glow element, floating particles
- **Snow** - Blue-grey/navy palette, snowflake canvas animation, falling particles
- **Forest** - Green palette, forest floor glow, firefly-like particles

## Running

The workflow `Start application` runs `node index.js` and serves on port 5000.

## Deployment

- Configured for autoscale deployment with `node index.js`.
- `vercel.json` included for Vercel deployment.
- GitHub repo: `https://github.com/Courtney250/Techword-bot-pair-`
