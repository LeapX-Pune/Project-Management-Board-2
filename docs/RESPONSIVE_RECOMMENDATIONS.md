# Responsive UX & Product Recommendations

This document outlines professional design and UX recommendations to elevate the mobile and tablet experience beyond simple responsive shrinking.

## 1. Native Mobile Bottom Tab Bar
- **Recommendation**: Replace the hamburger menu/sidebar with a pinned **Bottom Navigation Bar** for viewports `<= 480px`.
- **Why**: Side drawers require a reach to the top of the screen (unfriendly for modern large phones) and take two taps to navigate. A bottom bar provides instant, one-tap access to primary views (Dashboard, Board, Calendar, Team), mimicking top-tier apps like Jira, Asana, and Notion.

## 2. Touch Targets & Ergonomics
- **Recommendation**: Ensure all interactive elements (buttons, links, form inputs, dropdown triggers) have a minimum dimension of **48px x 48px**.
- **Why**: Follows iOS Human Interface Guidelines and Android Material Design. Prevents accidental taps, especially on dense lists like the Task checklist or Team directory.

## 3. Progressive Disclosure
- **Recommendation**: Hide secondary task metadata on mobile views.
- **Why**: A desktop card might show assigned members, tags, dates, and ID. On mobile, condense the card to just Title, Status indicator, and Assignee avatar. Provide the rest of the details only when the card is tapped (Task Editor). This reduces visual clutter and increases the number of visible tasks.

## 4. Gestures and Micro-Animations
- **Recommendation**: Implement smooth CSS transform animations and native swipe gestures.
- **Why**: 
  - Use `transform: translateY(100%)` for bottom sheets (Task Editor), which is hardware-accelerated and smooth.
  - Allow users to swipe left/right on the Kanban Board mobile view to switch between status columns.
  - Allow swipe-down on the Task Editor bottom sheet to dismiss it.

## 5. Fluid Typography
- **Recommendation**: Implement `clamp()` for typography scaling.
- **Why**: Using strict media queries for font sizes can result in awkward intermediate states. `font-size: clamp(1.2rem, 4vw, 2rem)` ensures that headers scale smoothly down to 320px screens without causing aggressive line-breaking.

## 6. Defensive CSS & Layout Shifts
- **Recommendation**: Address keyboard overlap and iOS Safari specific quirks.
- **Why**: 
  - Use `dvh` (dynamic viewport height) instead of `vh` to account for the iOS Safari URL bar expanding/collapsing.
  - When input fields are focused, the on-screen keyboard shrinks the viewport. Ensure modal contents are within a `overflow-y: auto` container to allow scrolling to hidden inputs.
