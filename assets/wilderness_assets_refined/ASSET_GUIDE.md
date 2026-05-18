# Wilderness Asset Guide

Use these files as the organized source of truth for the app build. Prefer SVG files in the codebase for crisp scaling. PNG versions are included for tools that cannot render SVG.

## Folder structure

- `brand/`: logo and wordmark assets.
- `backgrounds/`: full screen background art.
- `illustrations/`: reusable desert illustrations and program artwork.
- `icons/`: line icons for navigation and actions.
- `ui/`: reusable small UI graphics such as status chips.
- `reference/`: the original style board used as visual reference.

## Naming and usage map

| Asset token | File | Use where |
|---|---|---|
| `brand.logoMark` | `brand/logo-mark.svg` | App icon, splash mark, header mark, profile screen brand mark. |
| `brand.wordmarkWithTagline` | `brand/wordmark-with-tagline.svg` | Marketing page, welcome header, presentation material. |
| `login.background` | `backgrounds/login.background.svg` | Login, welcome, onboarding, and start screen background. |
| `session.background` | `backgrounds/session.background.svg` | Stillness timer/session screen background. |
| `program.desertHero` | `illustrations/desert-landscape-wide.svg` | Desert program hero, program detail header, large empty state artwork. |
| `card.desertLandscape` | `illustrations/desert-landscape-card.svg` | Dashboard cards, progress cards, small content panels. |
| `status.notCompleted` | `ui/status-chip-not-completed.svg` | Unfinished day or task status. |
| `status.completed` | `ui/status-chip-completed.svg` | Completed day, completed reflection, or completed session. |
| `status.inProgress` | `ui/status-chip-in-progress.svg` | Active day, active session, or current program step. |
| `icon.home` | `icons/home.svg` | Bottom navigation home tab. |
| `icon.calendar` | `icons/calendar.svg` | Calendar tab and schedule links. |
| `icon.profile` | `icons/profile.svg` | Profile tab and account areas. |
| `icon.book` | `icons/book.svg` | Scripture section. |
| `icon.bell` | `icons/bell.svg` | Silence, reminders, or notifications. |
| `icon.leaf` | `icons/leaf.svg` | Calm, growth, nature, or reflection prompts. |
| `icon.clock` | `icons/clock.svg` | Duration metadata and time labels. |
| `icon.timer` | `icons/timer.svg` | Timer/session controls. |
| `icon.pencil` | `icons/pencil.svg` | Reflection entry and journal writing. |
| `icon.menu` | `icons/menu.svg` | Menu drawer. |
| `icon.settings` | `icons/settings.svg` | Settings. |
| `icon.back` | `icons/back.svg` | Back navigation. |
| `icon.close` | `icons/close.svg` | Close modal or exit session. |
| `icon.more` | `icons/more.svg` | More options. |
| `icon.check` | `icons/check.svg` | Completion state or selected option. |

## Style rules for implementation

- Background: `#F6F3EC`
- Secondary surface: `#E9E1D2`
- Accent sand: `#D6C8B3`
- Taupe active state: `#8A7A67`
- Primary text and buttons: `#2B2A28`
- Headings: Playfair Display or a serif fallback.
- Body text: Inter or a clean sans serif fallback.
- Use generous spacing, rounded corners, soft shadows, and calm earth tones.

## Recommended page assignments

- Login/welcome: `login.background`, `brand.logoMark`, `brand.wordmarkWithTagline`, CTA button.
- Home/dashboard: `brand.logoMark`, `card.desertLandscape`, `icon.home`, `icon.calendar`, `icon.profile`, `status.inProgress`.
- Progress/program detail: `program.desertHero`, `status.notCompleted`, `status.completed`, `icon.check`, `icon.clock`.
- Session/timer: `session.background`, `icon.close`, `icon.settings`, `icon.timer`.
- Reflection/journal: `icon.pencil`, `icon.leaf`, `status.completed`, calm neutral surfaces.


## V2 Refinements From Latest Feedback

These assets should be preferred over the earlier simplified/vector versions when building the app screens.

| Asset token | File | Use where |
|---|---|---|
| `brand.logoMarkArtistic` | `brand/logo-mark-artistic-flare.png` | Use as the primary app logo, app icon source, splash logo, and small circular header mark. This preserves the more artistic W and dune circle from the reference. |
| `brand.wArtisticFlare` | `brand/w-artistic-flare.png` | Use when the design calls for the standalone W, especially on the login/welcome screen above the word WILDERNESS. |
| `session.backgroundRealisticDunes` | `backgrounds/session.background.realistic-dunes.png` | Use as the background for the active timer/session page, behind the verse, circular countdown, pause button, and end session button. |
| `login.backgroundRealisticDunes` | `backgrounds/login.background.realistic-dunes.png` | Use as the background for login, onboarding, and welcome pages when the page needs the softer desert atmosphere. |
| `program.desertRealisticWide` | `illustrations/desert-landscape-realistic-wide.png` | Use for Desert program hero art, cards, and progress page banners. |

### Implementation Preference

Use the V2 realistic dune backgrounds for visual screens instead of the earlier `login.background.svg` and `session.background.svg`. Keep the SVG versions only as lightweight fallbacks.

Use `brand.logoMarkArtistic` and `brand.wArtisticFlare` instead of the simpler vector W when brand fidelity matters.
