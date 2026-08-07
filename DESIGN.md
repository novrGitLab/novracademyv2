# DESIGN.md — Novr Academy

## 1. Objective

Novr Academy's landing page should communicate institutional credibility and security expertise at a glance. A visitor should walk away feeling this is a serious, compliance-ready platform — not a consumer ed-tech toy. The design prioritizes trust signals (certifications, testimonials, process clarity) over flashy visuals.

## 2. Product Context

- **What the product does:** Multi-tenant cybersecurity training platform with phishing simulations, compliance assessments, and accredited certification tracks for both organizations and educational institutions.
- **Who it's for:** CISOs, IT directors, and academic administrators evaluating security awareness training at scale.
- **Adjacent brands (feel like these):** KnowBe4, SANS Institute, Cybereason
- **Distant brand (do not feel like this):** Duolingo — playful consumer ed-tech with gamification; Novr Academy is enterprise-grade.
- **Cultural register:** Serious, technical, authoritative. Not stiff — confident.

## 3. Visual Foundations

### 3a. Color

- **Neutral scale:** `--n-50: #F8F9FB, --n-100: #F1F3F5, --n-200: #E5E7EB, --n-300: #D1D5DB, --n-400: #9CA3AF, --n-500: #6B7280, --n-600: #4B5563, --n-700: #374151, --n-800: #1F2937, --n-900: #111827`
- **Accent primary:** `--accent-primary: #683290` (purple — CTAs, highlights)
- **Accent secondary:** `--accent-secondary: #4451A2` (navy — secondary actions, borders)
- **Semantic:** `--success: #16A34A, --error: #DC2626, --warning: #F59E0B`
- **Usage rules:** Purple is the primary CTA color. Navy is used for secondary actions and the "Per Organizations" path. White backgrounds dominate sections; `#F8F9FB` surfaces alternate sections.

### 3b. Typography

- **Display face:** Playfair Display (serif), weights 400/600/700 — headlines and section titles
- **Body face:** Inter (sans-serif), weights 400/500/600 — body copy, UI elements, nav
- **Fallback stack:** `var(--font-playfair), Georgia, serif` / `var(--font-inter), system-ui, sans-serif`
- **Type scale:** 14 / 15 / 16 / 18 / 20 / 24 / 32 / 40 / 48px
- **Weight discipline:** Serif 600/700 for headlines only. Sans 400 for body, 500 for labels/nav, 600 for emphasis. No bold body text.

### 3c. Spacing & rhythm

- **Base unit:** 8px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px
- **Generous whitespace:** Section padding ≥ 80px on desktop, ≥ 48px on mobile. Hero ≥ 96px vertical.

### 3d. Component seeds

- **Button:** Two variants — filled (purple) for primary CTA, outlined (navy border) for secondary. 8px radius. No pill buttons.
- **Card:** 8px radius, 1px `#E5E7EB` border, subtle shadow. No heavy drop shadows. Feature cards have icon + heading + 2 lines.
- **Iconography:** Lucide icons, stroke weight 1.5-2, used sparingly as section anchors.
- **Compliance badges:** Small outlined badges with text, horizontally stacked.

## 4. Accessibility

- **Text contrast:** Body 4.5:1 min (dark text on white). Large text 3:1 min.
- **Motion:** Respect `prefers-reduced-motion`. No auto-playing animations.
- **Focus indicators:** 2px purple ring with 2px offset on all interactive elements.
- **Alt text policy:** Decorative images get `alt=""`. Informational images get descriptive alt text.

## 5. Voice & Tone

- **Register:** Technical-authoritative. Not casual, not academic.
- **Sentence rhythm:** Mixed — short punchy headlines, longer explanatory body sentences.
- **Words this brand uses:** "compliance," "resilience," "accreditation," "multi-tenant"
- **Words this brand refuses:** "seamlessly," "elevate," "journey," "unlock," "delight," "supercharge"
- **Address:** "your organization" / "your institution" — never "you" alone in headlines.

## 6. Implementation Practices

- **Token format:** Tailwind CSS theme (extend in tailwind.config.ts) + CSS variables in globals.css
- **Component library:** Bespoke components in `components/` + existing DesignSystem.tsx
- **Image treatment:** Real photography (office/team shots), no illustrations, no isometric 3D.
- **Grid system:** 12-col responsive, max-width 1200px centered.
- **Motion rules:** 200-300ms ease-out for hover states. No page-load animations on landing page.

## 7. Anti-Patterns

- **No gradient hero backgrounds.** The hero uses a solid white background with a photo — credibility over flash.
- **No emoji decoration.** Section anchors use numbers or icons, never emoji.
- **No "seamlessly unlock" copy.** Every sentence must be specific to cybersecurity training.
- **No isometric 3D illustrations.** Real photography only.
- **No generic stat trios.** Stats are embedded in context, not floating cards.

## 8. Decision-Making

1. **Credibility over creativity.** When in doubt, choose the more conservative, trust-building option.
2. **Specificity over generality.** Copy and visuals should be unmistakably about cybersecurity training.
3. **Dual-path clarity.** Organization vs. Institution paths must be visually distinct and consistently labeled.
4. **Progressive disclosure.** Hero → Features → Process → Proof → CTA. Don't overwhelm upfront.

## 9. Workflow

1. Read the Figma design node for the target page.
2. Extract color, typography, spacing, and component patterns into DESIGN.md.
3. Update tailwind.config.ts with any new tokens.
4. Build section-by-section in the page component, starting with nav and hero.
5. Use existing DesignSystem.tsx components where they match; create new ones only when needed.
6. Test responsive behavior at 640px, 768px, 1024px, 1280px breakpoints.
7. Verify contrast ratios and focus states before shipping.
