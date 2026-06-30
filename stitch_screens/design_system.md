---
name: Vocalis OS
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#bec6e0'
  on-secondary: '#283044'
  secondary-container: '#3f465c'
  on-secondary-container: '#adb4ce'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The brand personality is defined by "Intelligence in Shadows"—a sophisticated, high-density AI operating system that feels both futuristic and grounding. The design style is a hybrid of **Glassmorphism** and **High-End Minimalism**, leaning heavily into the aesthetics of modern developer tools and premium software interfaces. 

The emotional response should be one of absolute calm and hyper-efficiency. The UI recedes to let data and AI interactions take center stage, utilizing deep obsidian backgrounds and semi-transparent layers to create a sense of infinite depth. High information density is balanced by generous negative space around primary interaction points, ensuring the interface feels powerful yet never cluttered.

## Colors
This design system utilizes a "Deep Dark" palette to minimize eye strain and maximize the vibrancy of the AI accent. The foundation is an absolute black (`#030303`), which allows the glass layers and the primary **Electric Violet** (`#6366f1`) to pop with high contrast.

- **Primary:** Electric Violet is reserved for active states, primary actions, and AI-driven insights.
- **Surface Strategy:** Use translucent grays with low opacity (3% to 8%) for panel backgrounds to maintain a sense of layering.
- **Borders:** Ultra-subtle white strokes at 10% opacity define boundaries without creating visual noise.
- **Status:** Use semantic colors (Red, Amber, Green) sparingly, muted with low saturation to fit the professional tone.

## Typography
The typographic hierarchy emphasizes clarity and technical precision. **Inter** provides a systematic, neutral base for the majority of the OS interface, while **JetBrains Mono** is used for technical metadata, timestamps, and AI "thinking" states to reinforce the OS persona.

- **Headlines:** Use tight tracking (letter-spacing) on larger sizes to create a premium, "Apple-like" feel.
- **Data Accents:** Use the Mono font in uppercase for labels (e.g., "SYSTEM STATUS") at small sizes to improve scannability in high-density views.
- **Body:** Maintain a generous line height for readability against the dark background.

## Layout & Spacing
The layout follows a **Fluid-Fixed Hybrid** model. Navigation and sidebars are fixed-width to maintain a reliable anchor for the user, while the primary content area uses a fluid 12-column grid.

- **Information Density:** Spacing is built on a 4px baseline grid. Use `md (16px)` for standard gaps and `sm (8px)` for grouped elements to achieve a high-density "Pro" feel.
- **Safe Areas:** Maintain a 32px outer margin on desktop to let the floating "glass" panels breathe.
- **Reflow:** On mobile, sidebars collapse into a bottom-anchored floating command bar. Cards transition from multi-column to a single-stack layout with reduced margins (16px).

## Elevation & Depth
Depth is the core of this design system's hierarchy. Instead of traditional shadows, we use **Tonal Layering** and **Glassmorphism**.

- **Level 0 (Background):** Pure `#030303`. No blur.
- **Level 1 (Panels):** Backdrop-filter `blur(20px)` with a `white/3%` fill and a `white/10%` top-weighted border.
- **Level 2 (Modals/Popovers):** Backdrop-filter `blur(40px)` with a `white/8%` fill. These should have a soft, expansive shadow (`0 20px 40px rgba(0,0,0,0.5)`) to lift them off the base panels.
- **Highlight:** A subtle inner-glow (1px white/5% stroke) on the top edge of buttons and cards simulates a physical "edge" caught in the light.

## Shapes
The shape language is sophisticated and modern. All containers and interactive elements use the **Rounded** (0.5rem) base to soften the technical nature of the OS.

- **Primary Containers:** Large panels and cards use `rounded-xl` (1.5rem / 24px) to create a soft, friendly enclosure for complex data.
- **Interactive Elements:** Buttons, inputs, and chips use `rounded-lg` (1rem / 16px).
- **Nested Elements:** Apply the "Nested Radius" rule: the inner element's radius should be the outer radius minus the padding to maintain visual harmony.

## Components
Consistent component styling ensures the OS feels like a unified environment.

- **Floating Command Bar:** A center-bottom anchored glass element. It should use `blur(30px)`, `white/10%` border, and house the primary navigation icons and AI prompt input.
- **Buttons:** 
  - *Primary:* Electric Violet background with white text. 
  - *Secondary:* Ghost style with `white/5%` fill and `white/10%` border. 
  - *Hover:* Slight increase in background opacity or a subtle outer glow in the primary color.
- **Cards:** Use `rounded-xl` with a thin 1px border. Backgrounds should be slightly lighter than the base `#030303` to show elevation.
- **Input Fields:** Minimalist design with only a bottom border or a very subtle `white/5%` fill. Use the Mono font for placeholder text.
- **Sidebars:** Collapsible with a "glass" texture. Use thin dividers (`white/5%`) to separate navigation groups.
- **AI Response Bubbles:** Use a subtle gradient (Electric Violet to Indigo at 10% opacity) to distinguish AI-generated content from system-generated data.
