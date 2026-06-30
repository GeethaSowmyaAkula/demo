---
name: Kinetic Glass
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4fdbc8'
  on-secondary: '#003731'
  secondary-container: '#04b4a2'
  on-secondary-container: '#003f38'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#8990a8'
  on-tertiary-container: '#22293d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-page: 40px
  card-padding: 24px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for high-stakes enterprise environments where clarity and data density must coexist with a premium, future-forward aesthetic. It targets fleet operators and logistics directors who require a sophisticated, high-tech interface that feels both authoritative and innovative.

The style is a refined blend of **Modern Minimalism** and **Glassmorphism**. It utilizes a deep obsidian foundation to minimize eye strain during long-duration monitoring, overlaid with semi-transparent surfaces that create a sense of physical depth. The visual language emphasizes "kinetic energy" through subtle glows and vibrant accents, suggesting a platform that is constantly processing and optimizing live data.

## Colors
The palette is rooted in a "Deep Obsidian" base to establish a high-contrast environment for data visualization. 

- **Primary & Secondary:** A gradient bridge between Electric Blue and Cyber Teal represents the flow of electricity and intelligence. These are used for primary actions, active states, and data highlights.
- **Surface & Background:** The background is a solid #0F172A, while surfaces use a semi-transparent version of this hue with a 60-80% opacity and a subtle backdrop blur (20px-40px).
- **Accents:** Semantic colors for Success, Warning, and Error are highly saturated to ensure they remain distinct against the dark background, even when used in small indicators or thin strokes.

## Typography
The system uses **Inter** for its neutral, highly legible characteristics in body and interface text. To provide a technical, developer-centric edge for data-heavy sections, **Geist** is introduced for labels and numerical displays.

- **Headlines:** Use tight letter spacing and bold weights to command attention.
- **Labels:** Small labels use Geist with increased letter-spacing and uppercase styling to evoke a cockpit-instrument feel.
- **Data Display:** A dedicated style for KPIs and telemetry metrics ensures that critical numbers are the most prominent elements on the dashboard.

## Layout & Spacing
This design system utilizes a **12-column fluid grid** for dashboard layouts, allowing for flexible organization of telemetry widgets. 

- **Grid:** Columns are separated by 24px gutters. Large-scale monitoring screens should maintain a 40px outer margin to provide visual breathing room.
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Density:** For data-dense views (like live vehicle lists), padding can be reduced to 12px (stack-md), while executive overviews should use 24px (stack-lg) to emphasize a premium feel.
- **Responsive:** On tablet, the grid shifts to 8 columns; on mobile, it moves to 4 columns with margins reduced to 16px.

## Elevation & Depth
Depth is achieved through **Glassmorphism** rather than traditional shadows. Surfaces are built using layered transparency:

- **Base Layer:** The Deep Obsidian background.
- **Surface Layer:** 60% opacity with a 30px Backdrop Blur. A 1px inside border (stroke) using a white-to-transparent linear gradient at 10% opacity creates a "glass edge."
- **Floating Layer:** For modals or active popovers, increase the background blur to 50px and add a soft "Primary Color" outer glow (15% opacity, 40px spread) to simulate light emission from the element.
- **Z-Axis Hierarchy:** Higher elevation elements should have slightly higher opacity and brighter edge highlights.

## Shapes
The shape language balances approachability with technical precision. 
- **Containers:** All primary cards and dashboard widgets use a 16px (rounded-lg) radius.
- **Interactive Elements:** Buttons and input fields follow an 8px (rounded-md) radius for a tighter, more functional appearance.
- **Selection Indicators:** Use pill-shaped (rounded-full) indicators for status chips and active tab underlines to contrast against the rectangular grid.

## Components
- **Buttons:** Primary buttons use a Cyber Teal to Electric Blue gradient with white text. Ghost buttons use the 1px glass-edge border style.
- **Glass Cards:** The signature component. Must include a `backdrop-filter: blur(20px)`, a semi-transparent background, and a subtle top-left light source stroke.
- **KPI Widgets:** Feature a "Data Display" font for the metric, a small sparkline graph using the primary color, and a semantic status label (e.g., "+12%").
- **Inputs:** Dark-filled with a 1px border that glows Electric Blue on focus. Labels sit 4px above the input field in the `label-sm` style.
- **Navigation:** A vertical sidebar using a heavy backdrop blur. Active states are indicated by a vertical "glow bar" on the left edge and a subtle background tint.
- **Status Indicators:** Pulsing dot animations should be used for "Live" vehicle tracking to reinforce the real-time nature of the platform.