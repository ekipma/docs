# Ekipma design preview

## New conceptual collection

Open `/concepts.html` on the preview server for six separate compositions with one dominant focus:

1. **Signal** — oversized pink balance typography and a graphic accent.
2. **Constellation** — Circles as a spatial arrangement of friends and groups.
3. **Your move** — a cyan coffee-run ticket focused on the next turn.
4. **Outside** — a green event poster with an abstract landscape.
5. **Duet** — asymmetrical debt and credit panels.
6. **Zero noise** — generous negative space and one balance figure.

View them together or select a single concept. Previous/next controls move through the collection; the URL hash remembers the selected concept for sharing or reloading. Example: `/concepts.html#constellation`.

This collection uses only local `concepts.html`, `concepts.css`, and `concepts.js`, with no build step, external fonts, CDN, or Codex dependencies. Product actions are illustrative. The original thirteen designs below are preserved.

## Original collection

A standalone browser preview with thirteen selectable home-screen styles. Use the numbered selector or previous/next buttons to compare:

1. Soft matte
2. Smoky glass
3. Clean editorial
4. Orbit
5. Social ledger
6. Pocket cards
7. After-hours club
8. Ribbon
9. Quiet studio
10. Circle tiles
11. Pulse
12. Capsule
13. Shared journal

All use illustrative data and a balance-first layout, followed by Circles and recent records. They explore different typography, social layouts, balance presentations, surfaces, and activity treatments. This is a design comparison, not a working Flutter app; the depicted app navigation is decorative.

`index.html` is the standalone page to serve. `source.html` is its editable source fragment; it is not intended to be opened directly.

## Serve locally

From the `docs` directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory design-preview
```

Open http://localhost:8080 in your browser. If you already serve the entire `docs` directory, open `/design-preview/` on that server instead.

No build step or Codex session is required. The page loads Lucide icons and tooltip helpers from unpkg.com, so those enhancements need internet access. The design styles and switching logic are embedded in the page.
