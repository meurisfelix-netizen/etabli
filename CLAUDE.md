# Établi

A single-page bench calculator for a jewellery student. Three calculations they'd
otherwise look up every week: what a wax model weighs once cast, what a piece of
stock weighs, and ring sizing including blank length.

It is deliberately small. Resist growing it.

---

## Hard constraints

These are not preferences. Breaking any of them breaks the point of the project.

- **One page.** `index.html` holds all HTML, CSS and JS inline. The only other
  files are `sw.js` (offline cache), `manifest.webmanifest`, `icon.svg` and the
  icon PNGs generated from it — none of them contain app logic. Don't add more.
- **No build step.** No `package.json`, no bundler, no transpiler, no framework.
  If a change requires npm, it is the wrong change.
- **Vanilla JS, conservative syntax.** No modules, no JSX, no TypeScript.
- **Works offline.** It is used at a bench, sometimes with no signal. `sw.js`
  caches the page, manifest and icons on first load and serves them cache-first
  afterwards (refreshing in the background). The Google Fonts stylesheet and font
  files are cached the same way once fetched; if never fetched, the system
  fallback stack is used. The app must be opened once online for this to work.
- **Installs to iOS home screen.** The `apple-mobile-web-app-*` meta tags, the
  `apple-touch-icon`, the manifest and the `env(safe-area-inset-*)` padding exist
  for this. Don't remove them.

---

## Audience and language

The user is a French-speaking jewellery student in Belgium.

- **UI is French.** All labels, hints, empty states, `aria-label`s.
- **Impersonal register.** Instructions use infinitives — *Indiquer le poids*,
  *Renseigner les dimensions*. Never `tu`, never `vous`.
- **Comma decimals, both directions.** Inputs are `type="text"` with
  `inputmode="decimal"` precisely so one can type `16,5`; `num()` normalises the
  comma before parsing. Output goes through `fr(n, decimals)`. Do not switch the
  inputs back to `type="number"` — it fights the comma on some browsers.
- **French typography.** Non-breaking space before `%` (`&nbsp;%`).

### Vocabulary — keep these exact terms

| Concept | Term to use | Not |
|---|---|---|
| Jeweller's bench | Établi | Banc |
| Lost-wax casting | Fonte | Coulée, Casting |
| Stock / material | Matière | Stock |
| Sheet | Plaque | Tôle, Feuille |
| Round wire | Fil rond | Câble |
| Sprues and button | Tiges et culot | Canaux, Bouton |
| Ring circumference | Tour de doigt | Circonférence |
| White gold | Or gris | Or blanc |
| Neutral axis | Fibre neutre | Axe neutre |

Alloys are named in **millièmes**, not carats: `Argent 925`, `Or 750`, `Or gris 750`.
That is what is stamped on stock and what Belgian schools teach. `18k` is the
Anglo-Saxon convention and is wrong for this audience.

---

## Design

The palette is carving wax — the deep green-teal of a Ferris block — with gold for
outputs, because gold is the thing being calculated toward. This is a deliberate
choice grounded in the materials. Don't neutralise it into a generic dark theme.

```
--wax    #163A33   page ground
--wax-2  #1E4941   raised surfaces, selected states
--wax-3  #12302A   inset surfaces, inputs, result plates
--turq   #4FC3A1   interactive / accent
--steel  #A9B8B2   body text
--silver #EDF1EF   high-emphasis text
--gold   #E7B04A   result numerals only
```

Type, three roles:

- **Syne** 600/800 — display. Headings and the big result numerals.
- **IBM Plex Mono** — all data, labels, readouts. Instrument register.
- **IBM Plex Sans** — body copy and controls.

Dark ground is intentional: bright bench lamp, phone held with dirty hands.

### Two signature elements

1. **The alloy picker is a row of colour swatches**, not a dropdown. At a bench you
   reach for stock by its colour. Selection is shared across the Fonte and Matière
   tabs — one choice carries.
2. **Results sit in an inset "stamped" plate** — inset box-shadow, gold tabular
   numerals, letterspaced mono label. Everything else on the page stays quiet.

---

## Domain data

Densities in g/cm³. Real alloys vary by recipe; treat all of these as ±2%.

| Alloy | ρ | Alloy | ρ |
|---|---|---|---|
| Argent 925 | 10.36 | Or gris 750 | 15.50 |
| Argent 999 | 10.49 | Platine | 20.70 |
| Or 375 | 11.30 | Palladium | 12.00 |
| Or 585 | 13.10 | Laiton | 8.50 |
| Or 750 | 15.60 | Bronze | 8.80 |
| Or 916 | 17.80 | Cuivre | 8.96 |
| Or fin | 19.32 | | |

**Known soft spot:** white gold density depends heavily on the whitening metal.
Nickel-white runs near 14.7, palladium-white near 15.7. The table uses 15.50 as a
midpoint. If the school specifies an alloy, use that number instead.

---

## Formulas

Each is written out so it can be checked rather than trusted.

**Casting weight.** Carving wax is taken at 1.00 g/cm³, so:

```
metal = wax_weight × (ρ_metal / ρ_wax)   →   wax_weight × ρ_metal
order = metal × (1 + allowance/100)
```

Allowance covers sprues and the button. Offered at 0 / 10 / 15 / 20%.
The UI shows the bare casting weight *and* the multiplier, so the common one
gets learnt by heart.

**Sheet.** `L × W × T` in mm³, divided by 1000 for cm³, times ρ.

**Round wire.** `π × (d/2)² × L` in mm³, divided by 1000, times ρ.

**Ring sizing.** Everything routes through circumference in mm.

```
EU/FR size = circumference in mm      (size 52 = 52 mm around)
US:  C = 36.537 + 2.5535 × size       (inverse used for US output)
Ø  = C / π
```

UK is a lookup table, not a formula — indexed from US 1 in half-size steps.

**Blank length.** The one that matters most, and the one students get wrong:

```
length = π × (inner_Ø + thickness)
```

The strip stretches on the outside and compresses on the inside; the true length
is measured along the middle of the metal, so thickness is part of the sum.

The Ø computed by the sizing rows is pushed into the blank-length Ø field
automatically (`pushBlankDia`) until the user types in that field; clearing it
by hand hands control back. Only the thickness needs entering.

---

## Quality floor

Already in place — keep it there.

- Visible `:focus-visible` outlines on every control
- `prefers-reduced-motion` respected
- `aria-selected` on tabs, `aria-pressed` on swatches and segments
- `aria-label` on swatches announcing alloy and density
- `font-variant-numeric: tabular-nums` on all readouts
- Responsive to narrow phones; swatch row scrolls horizontally

---

## Open questions

Don't guess these — ask.

1. **French ring sizes.** The tool treats FR/EU as circumference in mm (52 = 52 mm),
   which is the modern convention (ISO 8653, what Belgian schools use). An older
   French system uses circumference − 40, making that same ring a 12. A hint on the
   Bague tab states the convention and the −40 relation, so the user can't be misled
   silently — but it has not been confirmed with the school. If they teach the old
   one, swap it or show both rows.
2. **White gold density**, per the note above.

---

## Deliberately not included

Each of these was considered and cut. Don't add them without asking.

- Stone/carat weight estimation — plausible, but not requested
- Gauge (B&S) conversion — European work is in mm; the chart would be dead weight
- Solder melting temperatures — reference data, not a calculation
- Light/dark toggle — the dark ground is the design
- Remembering anything beyond the last-used alloy — the alloy is kept in
  `localStorage` (`etabli.metal`); inputs and the allowance stay ephemeral

---

## Deploy

Hosted on GitHub Pages from the `main` branch of
`github.com/meurisfelix-netizen/etabli`. Live at
`https://meurisfelix-netizen.github.io/etabli/`.

To update: edit `index.html`, **bump `VERSION` in `sw.js`** (otherwise phones keep
the old cache), commit, push. Pages redeploys in about a minute; an installed app
picks up the new version on its second launch after that.

On the phone, in Safari: Share → *Sur l'écran d'accueil*. Open it once while online;
after that it launches fullscreen and works with no signal.
