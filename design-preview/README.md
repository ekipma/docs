# Ekipma — Breathe Pastel

The retained mobile design, with light/dark appearances, welcome and launch screens, and connected account, people, record, repayment, statistics, and purchase studies. No build step or network dependencies for the preview.

## Preview

From `docs`:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory design-preview
```

Open http://localhost:8080. The root redirects to `breath-pastel.html`, preserving hash links. The design menu groups all pages, and key flows also connect through the app navigation.

- `breath-pastel.html#home` — balance, people, and recent records
- `breath-pastel.html#welcome` — welcome → registration
- `breath-pastel.html#launch` — returning launch, with external replay control
- `breath-pastel.html#add` — create → review → draft or add a sample record
- `breath-pastel.html#settings` — profile, statistics, preferences, and purchases
- `breath-pastel.html#states` — loading, empty, offline, and retry scenarios
- `reference.png` — original visual reference
- `studies/material.html` — reference card beside the material recreation

Theme and English/Persian language switching live in the external design menu. Persian mode uses the bundled Iranyekan font, RTL app layout, and translated core labels; the surrounding design menu stays stable. All account and product actions are simulated in memory and reset on reload. No real payments or invitations are sent. Use sample OTP `123456` and join code `SUNDAY`.

See [FEATURES.md](FEATURES.md) for coverage, differences from the Flutter app, and prototype limits, including the QR placeholder and dedicated Persian study.

## Directory

- `breath-pastel.html` — shell, design menu, SVG symbols
- `assets/base.css` — structural layouts and responsive rules
- `assets/theme.css` — approved pastel materials, light/dark colors, squircle components, filled navigation
- `assets/app.js` — original sample data, routing, Home, people, and activity
- `assets/flows.js` — extended product flows and sample interactions
- `assets/flows.css` — additional layouts using the existing materials
- `assets/invite-qr.svg` — labeled, non-scannable QR layout placeholder
- `assets/theme.js` — external appearance preference and accessible icon-only navigation
- `assets/fonts.css`, `assets/fonts/` — bundled Nunito and license
- `assets/intro.css`, `assets/intro.js` — welcome and returning launch
- `studies/` — isolated material study and cropped reference

Previous design explorations remain removed. Native CSS squircle corners are used where supported; rounded corners provide a fallback. Keyboard focus indicators remain visible.
