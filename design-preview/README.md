# Ekipma — Breathe Pastel

The retained mobile design, with light/dark appearances, a welcome screen, returning launch, and ten connected app pages. No build step or network dependencies.

## Preview

From `docs`:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory design-preview
```

Open http://localhost:8080. The root redirects to `breath-pastel.html`, preserving hash links.

- `breath-pastel.html#home` — balance and people
- `breath-pastel.html#welcome` — first-visit welcome
- `breath-pastel.html#launch` — returning launch, with an external replay control
- `reference.png` — original visual reference
- `studies/material.html` — reference card beside the material recreation

Theme switching lives in the external design menu. Drafts and RSVPs are local demo state; reset or reload clears them. Theme preference persists in local storage. There are no real payments or invitations.

## Directory

- `breath-pastel.html` — page shell, design menu, and SVG symbols
- `assets/base.css` — structural layouts and responsive rules
- `assets/theme.css` — pastel materials, light/dark colors, squircle components, and filled navigation
- `assets/app.js` — sample data, routes, and app interactions
- `assets/theme.js` — appearance preference and accessible icon-only navigation
- `assets/fonts.css`, `assets/fonts/` — locally bundled Nunito and its SIL Open Font License
- `assets/intro.css`, `assets/intro.js` — welcome and returning-launch previews
- `studies/` — isolated material study and its cropped reference

Previous design explorations have been removed. Native CSS squircle corners are used where supported; ordinary rounded corners provide a fallback. Keyboard focus indicators remain visible.
