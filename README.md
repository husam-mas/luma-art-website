# Luma ART — Luxury Personalized Gifts Platform

**Website:** Luxury B2C + B2B corporate gifting platform  
**Brand:** Premium crystal engraving, wood burning, metal & acrylic personalization  
**Language:** English  
**Sales Model:** Direct checkout (B2C) + Quote requests (B2B)

---

## 📋 Project Structure

```
luma-art-website/
├── README.md                          # This file
├── DESIGNER_BRIEF.md                  # Designer requirements and prototype scope
├── WIREFRAMES/
│   ├── index.html                     # Homepage and journey dialog
│   └── assets/
│       ├── styles.css                 # Responsive visual system and illustrations
│       └── app.js                     # Catalogue and local-only B2C/B2B journeys
```

---

## 🎯 Quick Overview

### What Luma ART Does
- **Crystal Engraving:** Photo-engraved cubes, hearts, spheres, icebergs, keychains
- **Wood Personalization:** Burned designs on round & square natural wood slices
- **Metal & Acrylic:** Aluminum photo prints, business cards, acrylic with LED bases
- **Corporate Gifts:** Branded cups, mugs, bottles, notebooks, pens, keychains
- **Custom Services:** Upload logo/photo/text → personalize → order or request bulk quote

### Key User Journeys
1. **B2C Customer:** Browse → Select product → Upload photo/logo/text → Customize → Checkout
2. **B2B Business:** Browse collections → Request quote → Provide bulk requirements → Sales team follows up

---

## 🎨 Design Direction

**Aesthetic:** Luxury, minimalist, refined  
**Color Palette:** Ivory, charcoal, champagne gold, deep forest green  
**Typography:** Modern serif (headings) + clean sans-serif (body)  
**Imagery:** Large, high-quality product photography with soft lighting  
**Layout:** Generous spacing, asymmetric grids, subtle motion

---

## 📁 Start Here

1. **Read:** `DESIGNER_BRIEF.md` — Requirements, design direction and launch questions
2. **Interact:** Open `WIREFRAMES/index.html` in a modern browser — no installation or build needed
3. **Explore:** Choose a collection → personalize a product → review an individual demo order or a business quote

### Prototype scope

The English wireframe uses ivory, charcoal, muted champagne gold and forest green, system serif/sans-serif typography, and original CSS material illustrations. Illustrations are placeholders, not product photographs or client work. All product prices, dimensions, lead times and material compatibility require confirmation.

Personalization supports local PNG/JPEG selection (up to 10 MB), reference previews, text, placement notes, product options, quantity, packaging and artwork-approval acknowledgement. Individual checkout is a clearly labelled demonstration without payment or shipping collection. Corporate requests collect a local brief with quantity, branding, delivery deadline, destination, packaging and artwork.

**Nothing is uploaded, submitted, paid for, or persisted.** Refreshing clears all state. Use fictional business details; this is not a production storefront. Production requires secure upload handling, confirmed catalogue/pricing, checkout, consent/privacy policies, artwork approval and quote delivery.

There are no dependencies, existing automated tests, build steps or linters in this repository. JavaScript syntax can be checked with `node --check WIREFRAMES/assets/app.js`. Browser verification should cover both journeys, validation errors, editing/back navigation, keyboard/Escape access, mobile layouts and reduced-motion preferences.

### Sharing

The wireframe works locally or on any static host. To share using this repository's GitHub Pages settings, publish the branch root and open `/WIREFRAMES/` under the Pages site URL. Hosting is not configured by this change; no live URL is claimed.

---

## 🚀 Next Steps for Designer

- [ ] Finalize design system
- [ ] Create high-fidelity Figma mockups
- [ ] Design product personalization UI
- [ ] Design B2B quote request form
- [ ] Create email notification templates
- [ ] Design mobile responsive layouts

---

**Project:** Luma ART Luxury Personalized Gifts  
**Last Updated:** October 2, 2026
