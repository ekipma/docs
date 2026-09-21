# Ekipma design preview

A standalone browser preview with three selectable home-screen styles:

1. Soft matte
2. Smoky glass
3. Clean editorial

All three use illustrative data and the same balance-first layout, followed by friends/groups and recent records. This is a design comparison, not a working Flutter app; the depicted app navigation is decorative.

## Serve locally

From the `docs` directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory design-preview
```

Open http://localhost:8080 in your browser. If you already serve the entire `docs` directory, open `/design-preview/` on that server instead.

No build step or Codex session is required. The page loads Lucide icons and tooltip helpers from unpkg.com, so those enhancements need internet access. The design styles and switching logic are embedded in the page.
