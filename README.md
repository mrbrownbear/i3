# CreativeWeb local build

This repository contains a self contained static website build.

## Runtime behaviour

All visual assets, CSS and JavaScript are embedded directly in `index.html`.
The Content Security Policy blocks runtime network connections with `connect-src 'none'`.
The site uses no remote fonts, CDN files, analytics, embeds, frames or third party scripts.
The contact form stores its demo enquiry in browser local storage only and does not submit to a server.

## Run locally

Use any static file server from the repository root. For example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.
