# APPLE HIG ULTIMATE AGENT GUIDE — Build Actual Apple-Like UI
**Version: 2026.09 (iOS 26 / Liquid Glass Era) — Exhaustive Agent-Readable Spec**
**Source: https://developer.apple.com/design/human-interface-guidelines/ + Liquid Glass docs**
**Purpose: Give this file to ANY coding agent (Cursor, Claude Code, Lovable, v0, etc.) and it will produce interfaces that feel native Apple, not generic minimal.**

> This is an original implementation-oriented synthesis of Apple's public HIG. It does NOT copy Apple's text verbatim or proprietary assets. For pixel-perfect legal details, always cross-check the live HIG.

---

## 0. HOW TO USE THIS FILE (Agent Instruction)

If you are an AI agent receiving this file:
1.  Treat this as **MANDATORY design contract**, not suggestions.
2.  Before coding ANY screen, run through Section 1-8 (principles, tokens, hierarchy).
3.  Use **semantic tokens only** — never hardcode random hex/radius.
4.  Build ALL states: default, pressed, hover, focused, disabled, loading, empty, error.
5.  Test light/dark, Dynamic Type (200%), reduced motion, 44pt touch targets.
6.  Finish with Quality Gate in Section 28.

**Your goal is not "white + rounded + blur". Your goal is: calm, content-first, spatially stable, legible, forgiving, accessible, crafted.**

---

## 1. THE 8 CORE PRINCIPLES (Apple's 2024+ updated principles)

### 1.1 Purpose — Make something meaningful
- Every element must answer: What problem does it solve? What action does it enable?
- Prioritize primary task. Remove ornamental UI that consumes attention.
- First screen must be immediately understandable without tutorial.

### 1.2 Agency — Let people do things their own way
- Never trap in flows. Always provide Back, Cancel, Dismiss, Undo.
- Preserve input. Don't silently discard work.
- Avoid forced onboarding. Allow skipping.
- Make destructive actions recoverable when possible.

### 1.3 Responsibility — Act in people's best interest
- Only request necessary permissions, at moment of need, with clear rationale.
- Explain data collection. No dark patterns.
- Protect sensitive info. Secure defaults.
- Accessibility from start, not patch.

### 1.4 Familiarity — Build on what people know
- Standard control = standard behavior. Don't reinvent swipe-to-delete, pull-to-refresh, etc.
- Keep navigation in predictable places.
- Use SF Symbols for common actions.

### 1.5 Flexibility — Adapt to diverse contexts
- Support: all size classes, Dynamic Type up to 200%+, dark/light, increase contrast, reduce transparency, reduce motion, portrait/landscape, keyboard/pointer/touch, RTL, long localized strings, window resizing, external displays, Dynamic Island.

### 1.6 Simplicity — Be clear and direct
- Simplicity ≠ minimalism. Simple = strong hierarchy, concise language, progressive disclosure, enough context to decide.
- Don't hide essential functions to look clean.

### 1.7 Craft — Care about every detail
- Audit: alignment, spacing, typography, icon optical size, touch targets, animation timing, loading/empty/error, scrolling, safe areas, focus states, dark mode, accessibility sizes, performance (no jank).

### 1.8 Delight — Make it human
- Delight = quality, not particles. Use satisfying transitions, subtle feedback, meaningful motion, pleasant empty states.
- DON'T: excessive particles, bouncing, constant gradients, confetti for ordinary actions.

---

## 2. VISUAL MODEL: LAYERS

Think in 3 layers (iOS 26 Liquid Glass era):

1.  **Content Layer** — The value: text, images, media, data, documents, maps. This is hero.
2.  **Material Layer** — Structure: standard materials (ultraThin...ultraThick) to create depth *within* content.
3.  **Functional Layer (Liquid Glass)** — Controls that FLOAT above content: tab bars, sidebars, toolbars, navigation bars. Allows content to scroll/peek underneath while maintaining legibility.

**Rule:** Never put Liquid Glass in content layer (except transient activation: slider thumb, toggle when dragged). Content layer uses standard materials. Functional layer uses Liquid Glass.

---

## 3. DESIGN TOKENS — THE SINGLE SOURCE OF TRUTH

### 3.1 Color — Semantic, Not Hex

Apple does NOT ship fixed hex. They ship adaptive semantic colors. Implement as CSS variables / SwiftUI semantic.

**Light/Dark/High-Contrast must be defined for each.**

```css
:root {
  /* Backgrounds */
  --bg: #FFFFFF;
  --bg-secondary: #F2F2F7; /* systemGroupedBackground */
  --bg-tertiary: #FFFFFF;
  --bg-grouped: #F2F2F7;
  --bg-elevated: #FFFFFF; /* cards, sheets */

  /* Labels */
  --label: #000000;
  --label-secondary: rgba(60,60,67,0.6); /* 60% */
  --label-tertiary: rgba(60,60,67,0.3);
  --label-quaternary: rgba(60,60,67,0.18);

  /* Separators */
  --separator: rgba(60,60,67,0.29);
  --separator-opaque: #C6C6C8;

  /* Accent — use ONE primary */
  --accent: #007AFF; /* systemBlue approx */
  --accent-secondary: #5856D6;

  /* Semantic */
  --success: #34C759;
  --warning: #FF9500;
  --error: #FF3B30;
  --link: #007AFF;

  /* System Grays */
  --gray1: #8E8E93;
  --gray2: #AEAEB2;
  --gray3: #C7C7CC;
  --gray4: #D1D1D6;
  --gray5: #E5E5EA;
  --gray6: #F2F2F7;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000;
    --bg-secondary: #1C1C1E;
    --bg-tertiary: #2C2C2E;
    --bg-grouped: #000000;
    --bg-elevated: #1C1C1E;
    --label: #FFFFFF;
    --label-secondary: rgba(235,235,245,0.6);
    --label-tertiary: rgba(235,235,245,0.3);
    --label-quaternary: rgba(235,235,245,0.18);
    --separator: rgba(84,84,88,0.65);
    --separator-opaque: #38383A;
  }
}
```

**Color Rules:**
- Avoid same color meaning different things.
- Test in bright sunlight + dim room + True Tone + different displays.
- Never rely on color alone — add icon + text + shape.
- Brand color only for: primary action, selected state, meaningful status. NOT every border/card.
- Increase Contrast variant: make differences more apparent (darker yellow selection, black label on yellow button, etc.)

**Liquid Glass Color:**
- Controls in Liquid Glass must remain legible over dynamic backgrounds.
- Regular variant adjusts luminosity + blur. Clear variant highly translucent — use only over visually rich media (photos/video). If underlying content bright, add 35% black dimming layer behind clear.

### 3.2 Typography — System-First

**Families:**
- SF Pro (iOS, macOS, iPadOS UI) — sans, neutral, legible
- SF Compact (watchOS, small sizes)
- SF Mono — code, tabular data
- New York — serif, editorial, pairs with SF
- Rounded variants — when UI is soft/rounded, or alternative voice

Download at developer.apple.com/fonts/ — but for web, use system font stack.

**Text Styles (iOS Reference, pt):**
```
Large Title: 34pt Bold (hero, first screen only)
Title1: 28pt Regular
Title2: 22pt Regular
Title3: 20pt Regular
Headline: 17pt Semibold (emphasized)
Body: 17pt Regular (default, legibility floor)
Callout: 16pt Regular
Subheadline: 15pt Regular (secondary)
Footnote: 13pt Regular
Caption1: 12pt Regular
Caption2: 11pt Regular
```
- macOS default 13pt, min 10pt
- tvOS default 29pt, min 23pt (10-foot UI)
- visionOS default 17pt, min 12pt
- watchOS default 16pt, min 12pt
- Minimum ANYWHERE: 11pt iOS, even at smallest Dynamic Type. Never go below.
- Avoid Ultralight/Thin for important content. Prefer Regular/Medium/Semibold/Bold.
- Line height: 1.2-1.4 for titles, 1.4-1.6 for body.
- Letter spacing: -0.4px for large titles, 0 for body.

**Dynamic Type:**
- Support 7 sizes + 5 accessibility sizes (up to 200%+).
- When text grows: containers expand, labels wrap, layouts reflow (horizontal → vertical). Never truncate critical text, never shrink font to fit fixed container, never clip.
- Prioritize: important content scales, tab titles may NOT scale.

**Web Implementation:**
```css
:root {
  --font-sf: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;
  --font-ny: "New York", "Times New Roman", serif;
}
.text-largeTitle { font: 700 34px/41px var(--font-sf); letter-spacing: -0.4px; }
.text-title1 { font: 400 28px/34px var(--font-sf); }
.text-title2 { font: 400 22px/28px var(--font-sf); }
.text-body { font: 400 17px/22px var(--font-sf); }
.text-footnote { font: 400 13px/18px var(--font-sf); color: var(--label-secondary); }
```

### 3.3 Layout — Spacing, Grid, Safe Areas

**Spacing Scale (8pt grid, 4pt subdivisions):**
```
2: micro
4: tight (icon padding)
8: compact (inside button)
12: small (card internal)
16: standard (between related elements)
20: comfortable
24: section spacing
32: major separation
40: large separation
48-64: hero / major sections
```
Use FEWER values consistently. Not random 7/13/19.

**Margins:**
- iPhone: 16-20pt horizontal (20pt is new default in iOS 18+)
- iPad: 20-24pt, or 32pt for reading
- Mac: 20-24pt window margins
- Always respect safeArea: top (status bar, notch, Dynamic Island), bottom (home indicator), leading/trailing (camera, sensor), keyboard.

**Visual Hierarchy Rules:**
- Order by importance, reading order (top→bottom, leading→trailing).
- Align to meaningful edges, shared baselines.
- Group related via space, container, separator — not everything boxed.
- Use progressive disclosure: disclosure triangles, menus, nested views, scrollable sections.
- Differentiate controls from content via Liquid Glass + scroll edge effect (blur + opacity reduction at edge).
- Background extension effect: for edge-to-edge imagery, flip + blur beneath sidebar/inspector.

**Adaptability:**
- Size classes: compact vs regular (horizontal/vertical).
- Test: smallest (iPhone SE), largest (iPad Pro 13", Mac), portrait/landscape, split view, Stage Manager, resizable windows.
- Don't stretch mobile cards across desktop — redesign IA: 2-column, sidebar, inspector, increased density.
- Preview on multiple devices, localizations, text sizes. Test largest AND smallest first to catch clipping.

**Continuous Corner Radius:**
Apple uses continuous curvature (squircle), not simple rounded. In SwiftUI: `.clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))`. In CSS: use slightly larger radius, or `corner-shape: squircle` where supported.

### 3.4 Shape & Radius Tokens
```
radius-sm: 8px   (buttons, small chips)
radius-md: 12px  (cards, text fields)
radius-lg: 16-20px (large cards, sheets)
radius-xl: 24-28px (hero cards, modals)
radius-2xl: 32px+ (rare)
radius-full: 9999px (capsule, pill)
```
Use same radius for same component family. Not every element same giant radius.

### 3.5 Depth — Shadows & Elevation

Apple 2025+ prefers **materials + translucency + borders** over heavy shadows.

- Shadows subtle: y 2-8px, blur 10-30px, opacity 0.08-0.15 light, 0.2-0.4 dark.
- Don't add shadow to everything. Use separator/border where shadow excessive.
- Elevation communicates layer relationship: content < material < Liquid Glass controls < popover < sheet < alert.

### 3.6 Materials

**Liquid Glass (Functional Layer):**
- `regular`: blurs + adjusts luminosity. Default for most system components. Use when background may affect legibility or when text heavy (alerts, sidebars, popovers).
- `clear`: highly translucent, for immersive media backgrounds (photos, video). Prioritizes underlying content visibility.
- Don't use in content layer.
- Don't stack multiple blur layers unnecessarily.
- System settings: reduce transparency, increase contrast affect appearance — test.

**Standard Materials (Content Layer):**
- ultraThin, thin, regular, thick, ultraThick
- Each has light/dark variants, automatically handles vibrancy.
- Use vibrant colors on top of materials (label, secondaryLabel vibrancy).
- Example: poor contrast = systemGray3 on material. Good = vibrant label.

**Web Approximation:**
```css
.material-regular {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(0,0,0,0.08);
}
.dark .material-regular {
  background: rgba(30,30,30,0.72);
  border-color: rgba(255,255,255,0.12);
}
.liquid-glass-regular {
  background: rgba(255,255,255,0.68);
  backdrop-filter: blur(40px) saturate(200%);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.4);
}
.liquid-glass-clear {
  background: rgba(255,255,255,0.22);
  backdrop-filter: blur(20px) saturate(180%);
}
```

### 3.7 Motion

**Principles:**
- Motion explains change: navigation, hierarchy, insertion/removal, state change, spatial continuity, feedback.
- Short, responsive, interruptible, contextual, physically plausible.
- Don't use identical timing for everything.

**Duration Tokens (starting points, not Apple constants):**
```
micro: 100-160ms (press feedback, toggle)
short: 160-220ms (fade, small move)
standard: 220-320ms (navigation, sheet)
emphasized: 320-500ms (hero, spatial)
spring: use spring physics for physical UI (damping 0.8-0.9, response 0.4-0.6)
```
- Prefer spring for physical UI, easing for fades.
- Coordinate transitions — don't animate every element separately.
- Don't delay common actions.

**Reduce Motion:**
- Respect `prefers-reduced-motion`. When enabled: remove parallax, reduce large transitions, avoid excessive scaling, avoid flashing, replace movement with opacity/state change.
- Accessibility overrides decoration.

### 3.8 Iconography — SF Symbols

- Use SF Symbols for common actions (9 weights: ultralight to black, 3 scales: small/medium/large, 4 renderings: monochrome, hierarchical, palette, multicolor).
- Match symbol weight to adjacent text weight.
- Maintain optical alignment.
- Don't mix unrelated icon styles.
- Don't use emoji as primary UI icons unless product specifically calls for it.
- Avoid tiny unrecognizable icons — use labels when ambiguous.
- Custom icons: match visual weight, provide active/inactive, design at multiple sizes, test at actual UI size, preserve accessibility labels.

### 3.9 Haptics & Feedback

- Use for meaningful events: confirmation, selection, boundary, important state change.
- Don't: every button, every scroll, every animation.
- Should feel part of interaction model, not gimmick.
- Visual + haptic + auditory = reinforce, but use smallest effective feedback.

---

## 4. FOUNDATIONS DEEP DIVE

### 4.1 Accessibility — MANDATORY, Not Optional

**Vision:**
- Support larger text 200%+ (140% watchOS).
- Contrast: 4.5:1 normal (up to 17pt), 3:1 large (18pt+ or bold).
- Use system colors — they have accessible variants automatically.
- Don't convey info with color alone — use icon + text + shape.
- Provide higher contrast when Increase Contrast on.

**VoiceOver:**
- Every interactive element needs meaningful label: "Submit Order" not "Blue Button".
- Traits: button, link, header, etc.
- Reading order = view hierarchy, not visual order. Validate on real device.
- Don't expose decorative elements as controls.
- Group logically.

**Motor:**
- Minimum 44x44pt touch targets for ALL interactive elements. Research shows 25%+ errors below.
- If visual icon 18-20px, interactive region still larger.
- Spacing between adjacent controls.
- Support keyboard, pointer where relevant.

**Other:**
- Dynamic Type, Bold Text, Reduce Motion, Reduce Transparency, Differentiate Without Color, Captions, Audio Descriptions.
- Test with Accessibility Inspector on real hardware.
- Use Accessibility Nutrition Labels on App Store.

### 4.2 App Icons

- Sizes: iPhone 60x60@3x (180), iPad 83.5x83.5, App Store 1024x1024, Spotlight 40x40, Notification 20x20.
- Design: simple, bold layers, dimensionality, consistency across devices/appearances.
- No transparency, no text (unless brand), no copying Apple logo.
- Test: light/dark/tinted appearances (iOS 18+), small sizes still recognizable.
- Liquid Glass era: layers offer depth, icon infuses material.

### 4.3 Branding

- Use branding through: app icon, typography, illustrations, photography, content, carefully chosen color, tone of voice, subtle interaction details.
- Don't: logo on every screen, giant logos as decoration, interface as advertisement, override familiar patterns for branding.
- Highly branded can still feel native.

### 4.4 Dark Mode

- Never simply invert.
- Check: contrast, hierarchy, image treatment, separators, shadows, materials, translucency, saturation, system colors, focus states.
- Avoid pure black + pure white everywhere unless specifically required (OLED black is okay for true black backgrounds).

### 4.5 Images & Media

- Maintain aspect ratio, avoid accidental cropping of subjects.
- Edge-to-edge when serves content.
- Placeholders for loading/failure.
- Support dark/light where appropriate.
- Avoid decorative image overload.
- Hero: let image provide personality, keep controls readable (dimming layer or material).

### 4.6 Writing

- Plain human language.
- Prefer "Delete Photo" over "Are you absolutely sure you want to proceed with deletion of this photo?"
- Action verbs for buttons: Save, Continue, Add, Delete, Share, Done — not "Okay", "Click Here".
- For destructive: clarity > cleverness.
- Avoid jargon, fake urgency, manipulative language.
- Localization: expect longer/shorter strings, different word order, pluralization, date/number/currency formats, RTL.

### 4.7 Privacy & Inclusion

- Collect less, explain collection, provide control, avoid exposing sensitive info, secure defaults, distinguish local vs cloud.
- Inclusion: design for diverse people, avoid stereotypes, use inclusive language, consider varied capabilities.

---

## 5. PLATFORMS — Platform-Aware, Not One-Size

### 5.1 iOS (Primary Reference)
- Navigation: tab bar (peer top-level), navigation stack, toolbar (contextual actions), search (discoverable, fast), sheets.
- Layout: generous whitespace, 16-20pt margins, content edge-to-edge under Liquid Glass bars.
- Controls: large, thumb-reachable. Primary action obvious.
- Gestures: tap, swipe (reveal actions), drag, long press (context menu), pinch, double tap.
- Safe areas: Dynamic Island, notch, home indicator, keyboard.

### 5.2 iPadOS
- Use additional space intentionally: sidebar navigation, multi-column, split view, inspector.
- Support: multitasking (Slide Over, Split View, Stage Manager), drag & drop, keyboard, pointer, Apple Pencil.
- Avoid centering phone-sized layout with huge empty space.

### 5.3 macOS
- Menu bar: File, Edit, View, Window, Help categorization, keyboard shortcuts.
- Toolbars: clean, contextual, prioritize frequent, overflow for secondary.
- Sidebars: source list style.
- Windows: resizable, support min/max, preserve hierarchy.
- Pointer: hover states, precise, context menus.
- Not mobile but wider — redesign IA.

### 5.4 watchOS
- Glanceable, minimal typing, reduced depth, short labels, large clear controls, avoid dense screens.
- Digital Crown, gestures.

### 5.5 tvOS
- Focus-driven navigation, large text (29pt default), parallax, 10-foot viewing distance.
- Test on multiple TV brands, color profiles.

### 5.6 visionOS (Spatial)
- Respect depth, comfortable interaction distances, avoid forcing everything into flat 2D.
- Windows, volumes, immersive spaces.
- Eye tracking + hand gestures, hover effects.
- Use spatial layout, depth as meaningful info, not decoration.
- Windows guidance includes game-specific examples, volumes.

### 5.7 iPhone Duo (2025+ new)
- Designing for dual displays, adaptive continuity.

### 5.8 CarPlay
- Minimal distraction, large targets, voice-first.

---

## 6. PATTERNS — Common User Tasks (Exhaustive)

### 6.1 Loading
- Choose: immediate content, skeleton placeholders, progress indicator, spinner, determinate progress, background processing feedback.
- If duration known → determinate. Unknown → indeterminate.
- Never blank screen when meaningful loading can be shown.
- Avoid spinner for extremely fast operations (creates noise).

### 6.2 Modality
- Use modal only when focus on distinct task helps.
- Provide obvious dismissal, avoid stacking multiple modals, preserve input, confirm before losing unsaved.
- Should feel temporary. Not because it looks cool.

### 6.3 Navigation
- Types: flat (tab bar), hierarchical (navigation stack), content-driven.
- Keep primary destinations easy to reach, consistent back location, avoid deep unnecessary depth, preserve state when reasonable, make current location obvious.

### 6.4 Search
- Familiar placement (navigation bar), discoverable, preserve recent/contextual state, useful suggestions, clear empty results, support cancellation, loading only when needed, distinguish search vs filtering.
- For large datasets: fast, relevance communicated, highlight matches, voice input (mic icon) where appropriate.

### 6.5 Entering Data & Forms
- Group related fields, clear labels, avoid unnecessary fields, validate at right time (not aggressive), explain errors next to field, preserve data after error, show progress for long workflows, primary submit clear.
- Minimize typing on mobile: pickers, toggles, segmented controls, suggestions.
- Use appropriate keyboard/input type, support paste/autofill, allow correction.
- Never make user re-enter after recoverable error.
- Never use placeholder as only label.

### 6.6 Feedback
- Every meaningful interaction → appropriate feedback: visual, haptic, auditory, textual, state change, animation.
- Use smallest effective.
- Example: Tap → pressed state, Save → subtle confirmation, Delete → confirmation/undo, Loading → progress, Error → localized message.

### 6.7 Onboarding
- Only when helps understand/configure important thing.
- Short, explain value, avoid tutorial for obvious UI, allow skipping, request permissions when relevant, don't block unnecessarily.

### 6.8 Managing Accounts
- Familiar patterns, clear sign-in, privacy.

### 6.9 Managing Notifications
- Request only when value clear, explain, provide control, avoid spam.

### 6.10 Drag and Drop
- Provide clear affordance, support both inside and cross-app.

### 6.11 File Management
- Familiar file browser patterns, recent, favorites.

### 6.12 Charting Data
- Legible, accessible, not relying only on color.

### 6.13 Playing Audio/Video, Live-viewing
- Standard controls, background handling, captions.

### 6.14 Printing, Sharing, Collaboration
- System share sheet, consistent.

### 6.15 Ratings & Reviews
- Don't interrupt, ask at meaningful moment.

### 6.16 Going Full Screen
- Clear entry/exit, preserve context.

### 6.17 Multitasking
- Adaptive windowing, Stage Manager, Split View — UI scales gracefully, context preserved when resized.

### 6.18 Offering Help
- Contextual, not overwhelming.

---

## 7. COMPONENTS — Exhaustive Catalog

### 7.1 Content
- **Text:** body, headings, labels. Support Dynamic Type, wrapping.
- **Images:** aspect ratio, placeholders, failures, SF Symbols.
- **Charts:** accessible, color-independent.

### 7.2 Layout and Organization
- **Boxes/Cards:** Use when content needs grouping or independently actionable. Avoid when simple list row enough. Apple often uses spacing + grouping instead of visible boxes. Don't box every small item.
- **Collections/Grids:** maintain alignment, readability, appropriate scrolling.
- **Dividers/Separators:** subtle, 0.5px, semantic color. Avoid unnecessary.
- **Split Views:** iPad/Mac, sidebar + content + inspector.
- **Scroll Views:** natural, avoid nested scrolling unless necessary, preserve position, don't disable to preserve composition, edge effects with Liquid Glass.

### 7.3 Menus and Actions
- **Buttons:** clear label, hierarchy (Primary, Secondary, Tertiary/subtle, Destructive, Icon-only), adequate hit area, pressed/active/disabled/loading states. Don't make every button primary. Avoid giant gradient CTA by default, unnecessary outlines, tiny icon-only for important actions. Action verbs.
  - Primary: filled, accent, high emphasis
  - Secondary: tinted, medium emphasis
  - Tertiary: plain, low emphasis
  - Destructive: red, clear consequence
- **Menus:** ordered logically, grouped, separators only for meaningful grouping, destructive only for destructive, avoid huge menus, familiar symbols, don't hide critical primary actions.
- **Context Menus:** actions relevant to selected item, preview where appropriate.
- **Toolbars:** expose relevant current context, prioritize frequent, group related, concise labels, familiar symbols, avoid overcrowding, overflow for secondary, adapt to width. Not dumping ground.

### 7.4 Navigation and Search
- **Tab Bars:** peer-level top-level destinations, short labels, familiar icons, selected obvious, don't overload, preserve state. iOS 26: floating Liquid Glass, grouped.
- **Navigation Bars:** title, back, actions. Large title for top-level, inline for deeper.
- **Sidebars:** iPad/Mac, navigation, collapsible.
- **Search Fields:** fast, intuitive, voice input, immediate suggestions, discoverable. Updated guidance for Liquid Glass.
- **Breadcrumbs (macOS):** show hierarchy.

### 7.5 Presentation
- **Alerts:** interrupt — use sparingly, important info/decisions only, concise title, explain consequence, primary obvious, destructive visually clear, never multiple simultaneously. Don't use for ordinary success — prefer lightweight feedback.
- **Sheets:** focused tasks, editing, choosing options, temporary content. Clear purpose, preserve context, dismissible, adapt to size, avoid nesting.
- **Popovers:** contextual, transient, anchored.
- **Modals:** see Modality pattern.

### 7.6 Selection and Input
- **Pickers:** wheel, menu, segmented, date/time, color (prefer system color picker).
- **Sliders:** transient Liquid Glass appearance when activated.
- **Steppers:** precise adjustments.
- **Toggles/Switches:** on/off, immediate effect, label clear.
- **Text Fields:** communicate what to enter, format, value, errors, optional vs required. Appropriate keyboard, clear labels, support paste/autofill, allow correction, clear validation.
- **Segmented Controls:** 2-5 mutually exclusive options.
- **Search Fields:** see Navigation.

### 7.7 Status
- **Activity Indicators:** spinner for indeterminate.
- **Progress Views:** determinate when duration known.
- **Badges:** small, count, status.
- **Notifications (in-app):** subtle, not alert.

### 7.8 System Experiences
- **Widgets:** updated guidance for all platforms + visionOS, CarPlay. Glanceable, personal, relevant. Light/dark/tinted variants, accented widgets (iOS 18+).
- **Live Activities:** updated for all platforms + macOS, CarPlay. Real-time, transient.
- **Controls (iOS 18+ new):** extend app functionality into Control Center, Lock Screen, Action button. Quick access to feature.
- **App Intents, Siri, SharePlay, Apple Pay, In-App Purchase, Game Center:** integrate with system patterns.

---

## 8. INPUTS

### 8.1 Touch / Gestures
- Standard: tap, swipe, drag, touch and hold, double tap, pinch/zoom, rotate where appropriate.
- Supplement visible controls, not replace essential. Don't conflict with system gestures. Provide discoverability. Make destructive reversible. Avoid precision-required gestures. Hidden gesture must never be only way for important task.

### 8.2 Keyboards
- Use appropriate type: email, number, URL, etc.
- Minimize typing, support dictation, autofill.

### 8.3 Pointer (iPadOS, macOS, visionOS)
- Hover states where appropriate, precise, context menus, drag and drop.

### 8.4 Apple Pencil, Game Controllers, etc.

---

## 9. TECHNOLOGIES

- Widgets, Live Activities, Controls, App Clips, Apple Pay, In-App Purchase, SharePlay, Siri, Shortcuts, etc.
- Each has specific HIG — consult official when integrating.

---

## 10. LIQUID GLASS — 2025/2026 NEW DESIGN LANGUAGE (Critical)

**What it is:** Dynamic material that unifies design across Apple platforms. Combines optical properties of glass with fluidity. Forms distinct functional layer floating above content.

**System Adoption:**
- Standard components from SwiftUI/UIKit/AppKit pick it up automatically when built with latest Xcode.
- No need to reinvent app — build with latest Xcode to see changes, then refine.

**Two Variants:**
- **Regular:** blurs + adjusts luminosity to maintain legibility. Most system components. Use when background might create legibility issues or text-heavy (alerts, sidebars, popovers).
- **Clear:** highly translucent, ideal for prioritizing underlying content visibility (photos, videos). Creates immersive experience. Use only over visually rich backgrounds. If bright background, add 35% black dimming layer behind. If dark enough or AVKit media controls (which provide own dimming), no dimming needed.

**Rules:**
1. Don't use Liquid Glass in content layer — creates confusing hierarchy.
2. Use sparingly for custom controls — limit to most important functional elements.
3. Only clear over visually rich backgrounds.
4. Ensure legibility: text must remain readable over dynamic backgrounds. Test with varied content.
5. Respect system settings: preferred look, reduce transparency, increase contrast change appearance/behavior.
6. Don't stack multiple unnecessary blur layers.
7. Don't fake with heavy gradients + random shadows — use system APIs: `glassEffect`, `backgroundExtensionEffect`, `UIBackgroundExtensionView`.
8. Scroll edge effects enhance legibility: blur + reduce opacity of background content at edges.
9. Content behind controls contributes to visual experience — allow to peek through.

**Visual Hierarchy:**
```
Content (scrolls underneath)
  ↓
Scroll Edge Effect (blur + opacity reduction)
  ↓
Liquid Glass Material (regular/clear)
  ↓
Controls (labels, symbols — vibrant)
```

**Color Guidance for Liquid Glass:**
- Be judicious with color in controls/navigation so they stay legible and allow content to infuse and shine through.
- Tinted home screens, icon variants (light/dark/tinted) — test your app icon and controls in all.

---

## 11. COMPONENT STATES — Every Component Must Define

```
default
pressed / active
hovered (macOS, iPadOS pointer, visionOS)
focused (keyboard, tvOS)
selected
disabled
loading
error
success
expanded / collapsed
dragging
```

Don't design only default.

---

## 12. MICRO-INTERACTIONS

**Button:**
idle → press (scale 0.97, opacity, haptic light) → feedback → action → (loading) → success

**Toggle:**
off → interaction (thumb Liquid Glass) → spring transition → on (haptic)

**Navigation:**
current → destination selected → contextual transition (push, sheet, popover) → new hierarchy, preserve scroll

**Loading:**
request → skeleton / placeholder → content (crossfade 200ms) — avoid flash for fast ops

Every transition communicates state.

---

## 13. RESPONSIVE BEHAVIOR

At larger widths:
- 2-column, sidebars, inspectors, wider content areas, increased density, split navigation/content, persistent secondary nav

At smaller:
- Simplify, stack, collapse secondary actions, use sheets/popovers, prioritize primary task

Never stretch mobile card layout across desktop without redesigning IA.

---

## 14. ANIMATION SYSTEM TOKENS

```css
--motion-instant: 100ms
--motion-quick: 160ms
--motion-standard: 240ms
--motion-emphasized: 360ms
--motion-spring: cubic-bezier(0.32, 0.72, 0, 1) /* Apple-like spring */
--motion-ease-out: cubic-bezier(0.25, 0.1, 0.25, 1)
--motion-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

Prefer spring for physical UI, easing for fades. Interruptible — user changing direction should interrupt.

---

## 15. ACCESSIBILITY TOKENS & CHECKS

- Touch target: 44x44pt min (all interactive)
- Contrast: 4.5:1 normal, 3:1 large/bold
- Focus ring: 2px accent, offset 2px, visible in both appearances
- Dynamic Type: test at AX1-AX5 (accessibility sizes)
- Reduce Motion: replace with fade
- Reduce Transparency: fallback solid colors
- VoiceOver: label, hint, trait, value, grouping, order

---

## 16. WEB IMPLEMENTATION — Apple-Like UI in HTML/CSS/Tailwind

**Tailwind Config Example:**
```js
// tailwind.config.js — Apple-like
module.exports = {
  theme: {
    extend: {
      fontFamily: { sf: ['-apple-system','BlinkMacSystemFont','SF Pro Display','SF Pro Text','Helvetica Neue','sans-serif'] },
      borderRadius: { 'sm': '8px', 'md': '12px', 'lg': '16px', 'xl': '24px', '2xl': '32px' },
      spacing: { '18': '4.5rem' },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0,0,0,0.08)',
        'apple': '0 4px 16px rgba(0,0,0,0.08)',
        'apple-lg': '0 8px 32px rgba(0,0,0,0.12)',
      },
      backdropBlur: { 'apple': '20px', 'apple-lg': '40px' }
    }
  }
}
```

**Apple-like Card:**
```html
<div class="bg-[var(--bg-elevated)] rounded-[12px] border border-[var(--separator)] border-[0.5px] p-4 shadow-apple-sm
            dark:bg-[var(--bg-secondary)]">
  <h3 class="text-[17px] font-semibold leading-[22px] text-[var(--label)]">Title</h3>
  <p class="text-[15px] leading-[20px] text-[var(--label-secondary)] mt-1">Secondary description</p>
</div>
```

**Apple-like Button Primary:**
```html
<button class="h-11 min-w-[44px] px-5 rounded-full bg-[var(--accent)] text-white text-[17px] font-semibold
               active:scale-[0.97] transition-transform duration-[100ms] disabled:opacity-40
               focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
  Continue
</button>
```

**Liquid Glass Tab Bar (iOS 26 style):**
```html
<nav class="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-1 p-2 rounded-full
            bg-white/70 dark:bg-black/60 backdrop-blur-[40px] backdrop-saturate-[200%]
            border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0_0_0.5px_rgba(255,255,255,0.4)]
            supports-[backdrop-filter]:bg-white/68">
  <button class="w-11 h-11 rounded-full bg-black text-white grid place-items-center">⌂</button>
  <button class="w-11 h-11 rounded-full text-[var(--label-secondary)] grid place-items-center">◍</button>
</nav>
```

---

## 17. SWIFTUI IMPLEMENTATION SNIPPETS (For Reference)

```swift
// Semantic colors automatically adapt
Color(.systemBackground) // or Color(uiColor: .systemBackground)
Color(.label)
Color(.secondaryLabel)

// Typography — use text styles
Text("Inbox").font(.largeTitle).bold()
Text("Message").font(.body)
.dynamicTypeSize(...DynamicTypeSize.accessibility3) // test

// Materials
.background(.regularMaterial) // standard
.background(.ultraThinMaterial)
.glassEffect(.regular) // Liquid Glass regular
.glassEffect(.clear) // Liquid Glass clear

// Background extension
.backgroundExtensionEffect()

// Continuous corners
.clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

// SF Symbols
Image(systemName: "star.fill")
  .symbolRenderingMode(.hierarchical)
  .font(.system(size: 17, weight: .semibold))

// Buttons
Button("Continue") { }.buttonStyle(.borderedProminent).controlSize(.large)
```

---

## 18. ANTI-PATTERNS — Actively Reject

**Visual:**
- excessive gradients, neon glows, excessive glass everywhere, huge black shadows, random floating elements, excessive pills, decorative borders everywhere, inconsistent radii, too many colors, giant logos, fake glass made from heavy gradients

**Interaction:**
- hidden essential controls, custom gestures replacing standard, unexpected navigation, destructive without safeguards, multiple stacked modals, unnecessary confirmation dialogs, animation delays

**Layout:**
- hardcoded device dimensions, fixed-height text containers, clipped accessibility text, inconsistent spacing, poor safe-area handling, mobile UI stretched onto desktop

**Content:**
- vague labels, long button text, technical errors exposed, unnecessary onboarding, permission spam, excessive marketing copy

---

## 19. QUALITY GATE — Before Declaring Complete, Answer YES

**Purpose:**
- [ ] Every major element useful? Primary task obvious?

**Hierarchy:**
- [ ] Most important element identifiable instantly? Secondary visually subordinate?

**Familiarity:**
- [ ] Common controls behave as expected? Navigation predictable?

**Accessibility:**
- [ ] Text scales to 200%? Contrast 4.5:1 / 3:1? VoiceOver order sensible? Works without relying solely on color? Reduce motion works? Reduce transparency fallback? Touch targets 44pt?

**Responsiveness:**
- [ ] Works at smallest + largest? Content reflows? Keyboard works? Safe areas respected? RTL considered?

**Craft:**
- [ ] Spacing/alignment precise? Icons optically aligned? Animations smooth 60fps? Loading/empty/error polished? Materials correct (not everything glass)? Dark mode deliberate (not inverted)?

**Simplicity:**
- [ ] Can anything be removed without reducing usefulness? Unnecessary cards/borders/gradients removed?

**Performance:**
- [ ] Launch fast, scrolling 60fps, transitions interruptible, no layout jumps, images loaded with placeholder?

If any NO, iterate.

---

## 20. AGENT WORKFLOW — Mandatory Sequence

**Phase 1 — Understand:**
Platform, viewport/device, primary user, primary task, information hierarchy, navigation model, accessibility requirements, data states, interaction model

**Phase 2 — Architecture:**
Screen map, navigation, reusable components, design tokens, content hierarchy, state model

**Phase 3 — Visual System:**
Typography, color (semantic + light/dark/high-contrast), spacing, shape (continuous), material (standard vs Liquid Glass), iconography (SF Symbols), shadows/depth, animation tokens

**Phase 4 — Screen Composition:**
Primary screen, secondary screens, navigation (tab bar = Liquid Glass floating), states: empty (icon + title + 1-sentence + primary action), loading (skeleton), errors (understandable + actionable + calm + specific + recoverable)

**Phase 5 — Interaction:**
Press states (scale 0.97), focus (ring), hover (pointer), gestures (standard first), keyboard, transitions (spring), haptics where relevant

**Phase 6 — Accessibility:**
VoiceOver labels, focus order, Dynamic Type, contrast, reduced motion, reduced transparency, color independence

**Phase 7 — Responsive:**
Smallest supported, largest supported, orientation, split view/window resize, keyboard, localization (long strings)

**Phase 8 — Polish:**
Visual audit: alignment, spacing, typography, icon sizing, materials, shadows, animations, loading/errors/empty

**Phase 9 — Remove:**
Delete: unnecessary gradients, unnecessary cards, unnecessary borders, redundant text, excessive icons, decorative animation, duplicated actions, excessive brand elements

---

## 21. DECISION RULES — When Uncertain, Order:

1. User task
2. Platform convention
3. Accessibility
4. Content hierarchy
5. Simplicity
6. Consistency
7. Branding
8. Decoration

Never reverse.

---

## 22. FINAL PROMPT TO GIVE ANY AGENT

> Build an original interface inspired by Apple's Human Interface Guidelines 2026 (iOS 26 Liquid Glass). Prioritize purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, delight. Use content-first hierarchy, semantic typography (SF Pro, 17pt body floor, 34/28/22/20/17/16/15/13/12/11 scale, Dynamic Type to 200%), restrained semantic color (one accent #007AFF, label/secondary/tertiary, separator, success/warning/error, light/dark/high-contrast), adaptive layout (8pt grid, 16-20pt margins, safe areas, size classes, continuous corners 8/12/16/24/full), materials (standard ultraThin-thick for content, Liquid Glass regular for functional layer floating above content, clear only over rich media with 35% dimming if bright), familiar iconography (SF Symbols weight-matched), meaningful motion (100/160/240/360ms, spring, interruptible, reduce-motion fallback), strong accessibility (44pt targets, 4.5:1 contrast, VoiceOver labels, focus ring), platform-appropriate navigation (floating Liquid Glass tab bar, sidebar for iPad/Mac, large title top-level), polished states (default/pressed/hover/focus/selected/disabled/loading/error/empty). Do not turn everything into glass, pills, cards, gradients, or shadows. Use standard patterns, customize only where product needs identity, make every decision explainable by user value. Perform final quality gate audit.

For every screen:
1. Identify primary goal
2. Establish visual hierarchy
3. Choose platform-native navigation
4. Create adaptive constraints
5. Apply semantic tokens
6. Build all interaction states
7. Build loading/empty/error
8. Add accessibility semantics
9. Add responsive behavior
10. Add restrained motion
11. Test light/dark/high-contrast
12. Remove unnecessary complexity
13. Perform HIG quality audit

---

## 23. REFERENCE CHECKLIST — Official Sources

- HIG Root: https://developer.apple.com/design/human-interface-guidelines/
- Design Principles: https://developer.apple.com/design/human-interface-guidelines/design-principles
- Foundations: https://developer.apple.com/design/human-interface-guidelines/foundations
- Color: https://developer.apple.com/design/human-interface-guidelines/color
- Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- Layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Materials: https://developer.apple.com/design/human-interface-guidelines/materials
- Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Icons: https://developer.apple.com/design/human-interface-guidelines/icons
- SF Symbols: https://developer.apple.com/design/human-interface-guidelines/sf-symbols + https://developer.apple.com/sf-symbols/
- Branding: https://developer.apple.com/design/human-interface-guidelines/branding
- Patterns: https://developer.apple.com/design/human-interface-guidelines/patterns
- Components: https://developer.apple.com/design/human-interface-guidelines/components
- Inputs: https://developer.apple.com/design/human-interface-guidelines/inputs
- Technologies: https://developer.apple.com/design/human-interface-guidelines/technologies
- Liquid Glass: https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass
- Designing for iOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-ios
- Designing for iPadOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados
- Designing for macOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-macos
- Designing for watchOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-watchos
- Designing for tvOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-tvos
- Designing for visionOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos
- What's New: https://developer.apple.com/design/whats-new/
- Apple Design Resources (Figma): https://developer.apple.com/design/resources/

---

## 24. CHANGELOG — What Changed in 2025/2026

- **Liquid Glass:** New dynamic material, two variants (regular/clear), functional layer floats above content, content peeks through, scroll edge effects, background extension effect.
- **Tab Bars, Toolbars, Buttons:** Updated for Liquid Glass.
- **Color:** Updated guidance for Liquid Glass, tinted home screens, icon variants (light/dark/tinted), accented widgets.
- **Controls:** New page — extends app functionality into Control Center, Lock Screen, Action button.
- **Widgets & Live Activities:** Updated for all platforms + visionOS, macOS, CarPlay.
- **Typography:** Added emphasized weights to Dynamic Type specs.
- **Accessibility:** Expanded, moved Dynamic Type to Typography page, new VoiceOver page.
- **Layout:** Added specs for iPhone 16e, iPad 11", iPad Air 11"/13".
- **Menus, Images, Apple Pay, Writing:** Updated for visionOS, breakthrough effects, spatial photos/scenes.

---

## 25. LEGAL NOTE

Target is **Apple-like quality and platform familiarity**, not deceptive Apple branding. Do NOT copy Apple's logo, impersonate Apple, reproduce proprietary screenshots, claim product is made by Apple, copy an Apple app 1:1, reuse marketing assets. Use principles and conventions to create original product.

---

**END — Treat as design-quality contract, not optional suggestions.**
