# CLAUDE.md — TrueGrant (GIA Digital Beneficiary ID)

Read before changing **frontend** code. **Backend is teammate-owned** — stay flexible; adapt types/endpoints when they land.

---

## Brand

- **App name:** **TrueGrant**
- **Tagline:** **Authentic IDs, Authentic Impact.**

Use everywhere titles/metadata need a name + line (splash, auth, About, `<title>`).

---

## Product & stack

**Hackathon:** AI × legal systems — Grant-in-Aid **beneficiary identification**; narrative: **fraud reduction, deduplication, right recipient, explainable outcomes**.

**Frontend (Claude’s scope):** **React** + **GSAP**. **Mobile-first responsive web** — must run well **on phones** (touch targets, safe areas, viewport, bottom nav). This is a **web app** in the browser (PWA optional); **not** a requirement for native iOS/Android store builds unless the team adds Capacitor/React Native later. Dark/light themes; **`prefers-reduced-motion`**; readable contrast.

**Visual & motion:** **Cool, professional** art direction (refined palette, type, subtle depth, quality icons — not playful/cheap). **Smooth UX:** sane transitions, avoid layout thrash, lazy-load heavy assets, throttle/debounce search, clean route transitions; GSAP only where it pays off (see §GSAP).

**Backend:** Teammates implement; **Claude does not build backend now.** Wire UI through a **thin API adapter** once shapes/URLs are known; until then **mocks** are fine.

### Backend capabilities (context only — map UI when APIs exist)

| Area | Frontend touchpoint (when integrated) |
|------|----------------------------------------|
| **User management** | Auth session, profile, role; no hardcoded user logic in components. |
| **Duplication detection** | Verify/Agents: show flags, scores, or “linked applicant” narrative from API. |
| **Fraud detection** | Same — outcomes + justification from server, not invented numbers in production paths. |
| **Eligibility** | Scheme apply → result states + reasons from server. |
| **Geo integrity (optional)** | If present: map/badge/explain panel; if absent, omit or stub in mocks only. |

Do **not** assume endpoint paths or payloads; **sync `src/types` + adapter** when backend shares contracts.

---

## Roles & routes

Post-auth **role:** Individual | NGO | Government Officer | Admin — persist locally (+ server when available). **“Applying as”** / **“View schemes for”** — never label as “Sort by.” **Admin:** separate layout/route (e.g. `/admin`). **Change role** in header or Profile.

---

## Workflow (screens)

**0 — Splash:** Logo + **TrueGrant**; short/skippable; light motion if motion OK.

**1 — Auth / sign-up screen only** (pre-login; **not** Splash, **not** any logged-in route)  
- **Background:** **No video file.** Use a dedicated **React component** behind content: **dark professional gradient** + **two large blurred ellipses** with **slow GSAP drift** (loop); **optional subtle SVG grain overlay**. On **`prefers-reduced-motion: reduce`**: show **static** gradient (no drifting shapes / minimal grain).  
- **Readability:** **Scrim / overlay** over the animated layer so **top and bottom UI stay legible**.  
- **Layout:** **Top-center:** **TrueGrant** + tagline **Authentic IDs, Authentic Impact.** **Bottom-center:** **Sign in** / **Sign up** (or single Google CTA per team).  
- T&C as team decides. **No bottom nav.** GSAP: subtle entrance on title/CTA in addition to the slow ellipse drift (respect reduced motion).

**Post-login shell:** Header — left **Welcome, {name}**; right **theme** toggle. Bottom nav: **Home** | **Agents** | **My schemes** | **Profile** (Account, About, Settings, Help; **Logout** last).

**Role picker** after first login (session).

**Home (~6 schemes):** Search; **mic in/attached to search** (or FAB above nav, not on nav center); STT → query + **fallback chips**; tiny privacy line by mic. Filter by **role** + query; **Change role** available.

**Scheme detail:** Sections — Description, Who can apply, Criteria, Benefits, Clauses. **Simplify** toggle = same facts, plain language + mode badge. Collapsibles optional on mobile.

**Apply:** (1) requirements checklist (2) **form + uploads** — required before verdict (3) submit → server or mock.

**Verify / outcome:** GSAP “integrity” pass (ring/ticks); states e.g. Approved / Under review / Blocked + **justification**; optional graph/receipt if time. Approve = restrained; block = calm. **Back** to edit when useful.

**Agents:** 5–6 modules (labels aligned with dup/fraud/eligibility/geo when backend sends them) — status + detail + optional log stream.

**My schemes:** Status badges; empty state + CTA.

**Profile:** As above.

**Optional:** Long-press logo → **Judge mode** (preset demo personas).

---

## GSAP

Hero moments only (splash, auth reveal, verify, list stagger). **`gsap.context` + cleanup** on unmount. Respect **reduced motion** → fades or static.

---

## Backend integration (lenient)

- **One configurable base URL** (e.g. `VITE_API_URL`); **no** scattered hardcoded origins.
- **Single module** (e.g. `services/api.ts`) for HTTP; components use **hooks** or thin wrappers — not raw `fetch` everywhere.
- **Types:** `src/types/api.ts` (or team package) — **update when backend changes**; don’t guess long-term schemas in UI.
- **`VITE_USE_MOCK_API`** (or equivalent) → mocks/MSW so demo works without server.
- **Errors:** user-visible feedback on failed submit/load.

Voice: client STT + text search **or** backend endpoint — whichever team ships.

---

## Folder hint

`components/layout`, `schemes`, `application`, `verify`, `agents`, `profile`, `admin`; `services`, `hooks`, `types`, `mocks`, `assets`. PascalCase components; kebab-case assets.

**State:** Auth + role + theme persisted; React Query optional for server data.

---

## Claude do / don’t

**Do:** Match workflow § above; polished visuals + smooth interactions; mocks when API missing.  
**Don’t:** Implement backend; bake in unconfirmed routes/bodies; skip apply/upload before verify; use “Sort by” for roles; leak secrets in components; refactor backend dirs without ask.

---

## Demo checklist

Splash → Auth (TrueGrant + tagline + gradient/GSAP background component **on this screen only**) → Role → Home (search/voice) → Detail (Simplify) → Apply → Verify + justification → Nav + Profile → Optional Judge/Admin.

---

*Update this file when UX or integration decisions change.*
