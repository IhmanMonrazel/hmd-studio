# HMD Studio — Project Brief

## Overview

HMD Studio is an editorial web studio site. Clean, minimal, high-impact design built on a black/white/red palette.

## Stack

- **Backend:** Ruby 3.3.5 / Rails 7.1 / PostgreSQL
- **Frontend:** React (via esbuild + jsbundling-rails), Stimulus, Turbo
- **Bundler:** esbuild via Yarn
- **Animations:** GSAP (scroll-triggered) + Three.js (3D objects)
- **Server:** Puma

## Design System

| Token | Value |
|---|---|
| Primary background | `#000000` |
| Primary text | `#FFFFFF` |
| Accent / CTA | `#CC0000` |
| Font style | Editorial — minimal, high contrast |

No other colors unless explicitly approved.

## Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero video, S2–S7 sections, scroll animations |
| Work | `/work` | WorkCarousel React component |
| About | `/about` | 4 sections: Hero, The Scan, The Approach, CTA |
| Contact | `/contact` | Ticket de caisse / receipt form |
| Booking Club | `/work/booking-club` | Project case study |
| SafeMoov | `/work/safemoov` | Project case study |
| Personal Portfolio | `/work/personal-portfolio` | Project case study |

## Navigation

- **Desktop:** Fixed navbar at the top, full-width, with logo left + links right
- **Mobile:** Burger menu toggle, full-screen overlay or slide-in drawer
- Navbar behavior: transparent at top, hides on scroll down, frosted glass on scroll up (`navbar-scroll` controller)

## Animations

All scroll animations use **GSAP** (GreenSock). Preferred patterns:
- `gsap.set()` + `onEnter` + `gsap.to()` for scroll reveals (NOT `gsap.from()` + ScrollTrigger — causes elements to stay invisible if trigger misfires)
- `ScrollTrigger.batch()` for staggered groups
- `scrub: true` on timelines for scroll-linked 3D effects
- No CSS `opacity: 0` on animated elements — GSAP manages initial state via JS
- `immediateRender: false` when using `gsap.from()` with ScrollTrigger

## Stimulus Controllers

| Controller | File | Used On |
|---|---|---|
| `navbar` | `navbar_controller.js` | `<nav>` — burger toggle |
| `navbar-scroll` | `navbar_scroll_controller.js` | `<nav>` — hide/frosted on scroll |
| `scroll-reveal` | `scroll_reveal_controller.js` | Generic `.js-reveal` elements |
| `hero` | `hero_controller.js` | Home hero section |
| `home-scroll` | `home_scroll_controller.js` | Home page all sections (S2–S7 GSAP) |
| `gsap-showcase` | `gsap_showcase_controller.js` | Booking Club showcase |
| `safemoov-showcase` | `safemoov_showcase_controller.js` | SafeMoov showcase |
| `portfolio-showcase` | `portfolio_showcase_controller.js` | Personal Portfolio showcase |
| `ticket-reveal` | `ticket_reveal_controller.js` | Contact page receipt reveal |
| `about-scan` | `about_scan_controller.js` | About section 2 (progress bar + data lines) |
| `approach-reveal` | `approach_reveal_controller.js` | About section 3 (gsap.set + onEnter) |
| `cta-reveal` | `cta_reveal_controller.js` | S7 CTA word-by-word reveal (about + home) |
| `tribal3d` | `tribal3d_controller.js` | Three.js tribal canvas (about .ab-approach + home .s6) |

## Three.js — Tribal Motif

- File: `app/javascript/about_tribal_3d.js`
- Texture: `https://res.cloudinary.com/dtlybacjm/image/upload/v1774622660/GFS_Didot_8_ovxbjk.png`
- Geometry: `PlaneGeometry(4, 4)` with `MeshStandardMaterial`, `transparent: true`, `opacity: 0.45`, `alphaTest: 0.1`
- Behavior: auto-rotation (slow X+Y) + mouse lerp (smooth tilt)
- Canvas appended dynamically to `this.element` via JS (not in HTML) — `position: absolute; bottom: 40px; right: 40px`
- Size configurable via `data-tribal3d-size-value` (default 360) and `data-tribal3d-camera-z-value` (default 5.5)
- `.s6` home: `size=280`, `cameraZ=6.5` | `.ab-approach` about: `size=280`, `cameraZ=6.5`

## Architecture Notes

- Rails serves HTML shells; React components are mounted via `data-react-component` attributes
- `WorkCarousel.jsx` is a pure React component (no Remotion iframe) registered in `react_mount.js`
- `CurvedCarousel.jsx` in `remotion/` kept for video export only
- Turbo Drive is enabled — React remounts on `turbo:load`
- `turbo-progress-bar { display: none }` — hides Turbo's red progress bar
- Three.js imported via `yarn add three`, loaded dynamically (async import) to keep bundle lean
- Canvas absolute positioning: always append to the target element via JS, not HTML — avoids containing block issues

## Known Patterns & Pitfalls

- **`gsap.from()` + ScrollTrigger**: sets `opacity: 0` immediately — elements invisible before trigger fires. Use `gsap.set()` + `onEnter` + `gsap.to()` instead, or add `immediateRender: false`
- **Absolute positioning in sections**: `position: relative` on parent may be overridden by GSAP internals. Force via `element.style.position = "relative"` in JS if needed, or append canvas via JS directly
- **Three.js inline styles**: `renderer.setSize()` sets `canvas.style.width/height` inline — wrap in a div if CSS positioning conflicts
- **CSS `opacity: 0` on animated elements**: never set via CSS — GSAP manages initial state

## Development Commands

```bash
bin/dev          # starts Rails + esbuild watcher (Procfile.dev)
rails db:create  # create PostgreSQL databases
rails db:migrate # run migrations
yarn build       # one-off JS build — run after ANY JS change
```

## Conventions

- Controllers in `app/javascript/controllers/`, registered in `index.js`
- Page-level JS in `app/javascript/`
- Rails views in `app/views/` — keep thin
- All styles in `app/assets/stylesheets/application.css` — BEM-ish naming
- No inline styles in HTML except for Three.js canvas wrappers (containing block workaround)
- Commit messages: imperative mood, lowercase, no period (`add hero animation`, `fix burger menu z-index`)
