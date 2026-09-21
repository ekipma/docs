# Ekipma design preview

## Room to breathe — expanded design

Open `/breathe.html` for a connected ten-page exploration of the selected direction:

- Home with the balance medallion, a charcoal/lilac plan illustration, and readable friend balances.
- Searchable Circles and friends, plus individual group and friend pages.
- Filterable activity, a detailed plan with RSVP, and itemized payment details.
- Payment, turn, and plan draft forms; balance breakdowns; a small settings page.

Use the page menu to inspect a screen directly, or navigate inside the phone. Long pages scroll inside the device while the bottom navigation stays available. URL hashes support direct links and browser Back, e.g. `/breathe.html#friend/sara` or `/breathe.html#plan`.

The green home card is replaced by charcoal/lilac scenery. Green remains a small plan-type accent; payment and turn identifiers retain pink and cyan. This palette carries through plan details.

Interactive flows include people search, Circle selection, balance breakdowns, record filters, RSVP changes, contextual draft creation with a split preview, and list-spacing preferences. Everything is local sample data. Drafts do not change the balance totals; reload or Reset clears the demo. The three files `breathe.html`, `breathe.css`, and `breathe.js` need no build step or external resources. Earlier collections remain unchanged.

## Interactive UX collection

Open `/ux.html` for five new directions inspired by Signal, Outside, and Zero Noise:

1. **Signal, with purpose** — a bold balance with separate credit/debt breakdowns and quick Circle access.
2. **The weekend starts here** — an illustrated event home with time, location, details, and editable RSVP.
3. **A little room to breathe** — an illustrated balance medallion and a small event preview.
4. **One Circle at a time** — switch groups; the balance, record list, and record form follow that context.
5. **Just what matters now** — choose a money or plans focus without losing sight of the other.

Use the app's Home, Circles, Activity, and + controls. You can inspect balance breakdowns, open Circles, filter activity, join or leave the sample event, and save payment/turn/event drafts. Drafts appear in Activity and do not change the fixed sample balances. Each design has independent in-memory demo state; reload or use Reset to clear it. Escape or the close button dismisses dialogs. URL hashes select a design, e.g. `/ux.html#weekend`.

This collection uses only `ux.html`, `ux.css`, and `ux.js`. No build, external resources, server writes, or Codex runtime is needed. The earlier collections are unchanged.

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
