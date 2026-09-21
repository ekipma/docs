# Ekipma design preview

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
