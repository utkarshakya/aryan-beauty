# Aryan Beauty — UI/UX Design Specification

**Document status:** Design direction approved; implementation details require repository review  
**Product:** Aryan Beauty salon website  
**Document purpose:** Single source of truth for agreed brand, visual, UX, accessibility, and implementation decisions  
**Target audience:** Local customers booking everyday beauty services and bridal/occasion services  
**Reference branch:** `ai/ui-polishing` (created from `develop`)  
**Last updated:** 2026-10-25

---

## 1. Executive summary

Aryan Beauty should feel like a **welcoming, trusted neighborhood beauty parlour with a thoughtful, modern brand identity**. It must work equally well for customers booking everyday services and customers exploring bridal or occasion makeup.

The design direction combines:

- **Refresh Salon:** practical service discovery, transparent pricing, packages, and a straightforward booking experience.
- **Two Birds Hair & Beauty Salon:** cohesive brand identity, restrained typography, warm colors, and consistent visual styling.
- **Aryan Beauty's own identity:** authentic salon photography, familiar language, personal service, and useful local-business information.

The goal is to take inspiration from the references without copying either site's identity or layout wholesale.

### Approved decisions

1. **Brand personality:** warm, familiar, trustworthy, modern, and personal.
2. **Primary audience:** both everyday beauty-service customers and bridal/occasion customers.
3. **UX priority:** balance trust, brand presentation, service discovery, and booking usability.
4. **Color direction:** Dusty Rose & Cream, with terracotta and deep brown as supporting colors.
5. **Dark mode:** required; it must be designed as a coordinated theme, not a simple color inversion.
6. **Responsive approach:** mobile-first.
7. **Implementation approach:** improve the existing Next.js App Router application incrementally; preserve working booking and backend behavior.

---

## 2. Reference websites and how to use them

### Refresh Salon — functional UX reference

Reference: https://refreshsalon.in/

Study it for practical customer-facing patterns such as:
- Clear service categories and service discovery.
- Visible prices and packages where available.
- Prominent booking actions.
- Useful business details and a straightforward path from browsing to booking.

Use the reference as inspiration for usability, not as a template to duplicate.

### Two Birds Hair & Beauty Salon — brand identity reference

Reference: https://twobirdshairandbeautysalon.com/

Study it for:
- A cohesive, recognizable brand system.
- Restrained color use and typography.
- Consistent styling across sections.
- A calm, polished visual tone.

Use the reference as inspiration for brand consistency, not as a source for copying its logo, wording, or exact visual assets.

### Aryan Beauty's own identity

The final site must represent the real business. Prefer authentic photos of the parlour, owner/team, service work, and bridal results (with permission). Do not use generic luxury-salon imagery where it misrepresents the business.

---

## 3. Brand identity

### Brand attributes

- **Welcoming:** approachable wording and a familiar neighborhood-business feel.
- **Reliable:** clear prices, accurate business information, and transparent appointment status.
- **Personal:** real people, genuine service examples, and an authentic story.
- **Modern:** clean responsive layouts and a consistent interface.
- **Inclusive across services:** everyday customers should not feel that the salon is only for bridal or luxury occasions.

### Brand voice

Use clear, natural, respectful language. Avoid exaggerated luxury claims, generic corporate copy, fake scarcity, or unsupported promises.

Suggested hero headline:
> Your beauty, your way, close to home.

Suggested supporting-copy direction:
> Everyday beauty care and special-occasion services, with personal attention.

These are draft copy suggestions, not verified business claims. Adjust them to match the salon's real services and tone.

### Logo and identity

- Keep the name **Aryan Beauty** exactly as the brand name.
- Use a legible wordmark that remains recognizable at small sizes.
- If a botanical or floral mark is explored, keep it simple and avoid overly intricate details.
- Do not finalize logo artwork, tagline, or brand story without reviewing the owner's preferences.
- Do not imitate the Two Birds logo or any other reference brand's identity.

---

## 4. Approved color system

### Selected direction: Dusty Rose & Cream

Pink should be a supporting brand color, not the background for the entire site. Cream creates warmth; dusty rose establishes the beauty-oriented personality; terracotta gives primary actions a grounded, recognizable color; deep brown keeps text readable.

### Light theme tokens

| Token | Hex | Intended use |
|---|---|---|
| Page background | `#FBF6F2` | Main page canvas |
| Surface | `#FFFFFF` | Cards, dialogs, form surfaces |
| Soft surface | `#E8C7CC` | Select soft pink panels sparingly |
| Primary action | `#A85F4B` | Primary booking buttons and key actions |
| Rose accent | `#B66D7D` | Brand accents, selected states, decorative details |
| Main text | `#392D30` | Headings and body text |
| Secondary text | `#715D60` | Supporting text and metadata |
| Border | `#E6D9D4` | Card edges, dividers, inputs |
| Optional earthy accent | `#7B8972` | Small secondary accents only |

### Dark theme tokens

| Token | Hex | Intended use |
|---|---|---|
| Page background | `#1E191D` | Main page canvas; avoid pure black |
| Surface | `#2A2228` | Cards and panels |
| Input surface | `#30262D` | Inputs, selects, text areas |
| Primary action | `#C7818F` | Primary buttons and key actions |
| Main text | `#F7EBEE` | Headings and body text |
| Secondary text | `#CBB9C0` | Supporting text |
| Rose accent | `#E1A5B1` | Links, selected states, subtle highlights |
| Border | `#44353E` | Borders and dividers |
| Button text on rose | `#24191D` | Text on light rose buttons |

### Color usage rules

- Keep most light-mode surfaces neutral; avoid large blocks of saturated pink.
- Use terracotta primarily for light-mode primary actions.
- Use rose as a secondary accent, not for every button, link, and heading.
- In dark mode, use lighter rose for primary actions and ensure its text contrast is sufficient.
- Do not rely on color alone to communicate errors, success, selection, or booking status.
- Do not apply a dark overlay or color filter to all photography.
- Treat the hex values as approved starting tokens; verify final foreground/background contrast before shipping.
- Do not use the optional sage accent everywhere. It is subordinate to the approved dusty-rose direction.

---

## 5. Dark mode requirements

Dark mode is a required part of the design, not a later cosmetic patch.

### Theme behavior

- Provide **Light**, **Dark**, and **System** options, or an equivalent accessible theme control.
- Respect the operating system preference when the user has not made an explicit selection.
- Persist an explicit preference using the project's existing appropriate client-side preference mechanism.
- Avoid a flash of the wrong theme during initial page load where feasible.
- Ensure the selected theme applies consistently to public pages, booking forms, dialogs, dropdowns, toasts, and admin screens.
- Keep theme selection accessible by keyboard and expose the current state clearly.

### Dark-mode styling

- Use deep plum-brown backgrounds rather than pure black.
- Use subtle borders and restrained shadows.
- Keep body text comfortably readable.
- Use the light rose action color from the dark tokens and verify its text contrast.
- Keep service photography natural and correctly exposed.
- Ensure date/time pickers, native controls, validation messages, loading states, empty states, and error states are theme-aware.
- Do not blindly invert every color; define semantic theme tokens.

---

## 6. Typography

Recommended pairing:
- **Display:** Cormorant Garamond or a similar restrained serif for hero and selected section headings.
- **Interface/body:** Inter or the existing project's suitable sans-serif for navigation, descriptions, prices, forms, buttons, and admin screens.

Confirm font availability, loading cost, and existing project conventions before adding dependencies. Use sensible fallbacks.

### Type scale

| Element | Desktop | Mobile |
|---|---:|---:|
| Hero heading | 52–64 px | 36–42 px |
| Section heading | 32–40 px | 26–32 px |
| Service title | 20–24 px | 18–20 px |
| Body text | 16–18 px | 16 px |
| Labels/metadata | 13–14 px | 13–14 px |

Rules:
- Use sentence case for most headings and buttons.
- Keep body line-height comfortable and paragraph widths readable.
- Avoid excessive all-caps, multiple competing display fonts, and too many font weights.
- Ensure typography remains legible on small screens and in both themes.

---

## 7. Layout and component rules

| Component | Specification |
|---|---|
| Content container | Centered; approximately 1,200 px maximum width, adjusted to existing layout |
| Spacing | Consistent 8 px-based spacing scale |
| Cards | White/light surface or dark surface token; subtle border; 12–16 px radius |
| Buttons | Clear primary/secondary hierarchy; target at least 44 px touch height |
| Forms | Persistent labels, inline validation, clear errors, visible focus |
| Images | Consistent aspect ratios, responsive sizes, descriptive alt text |
| Navigation | Compact and clear; booking action easy to find |
| Motion | Subtle; honor reduced-motion preferences |
| Focus | Clearly visible keyboard focus indicators |
| Responsive layout | No horizontal overflow at 320 px width |

Avoid excessive shadows, gradients, decorative borders, floating elements that cover content, and animation that delays access to services or booking.

### Suggested CSS token starting point

Adapt this to the existing styling system rather than introducing a parallel theme architecture.

```css
:root {
  color-scheme: light;
  --color-background: #FBF6F2;
  --color-surface: #FFFFFF;
  --color-surface-soft: #E8C7CC;
  --color-primary: #A85F4B;
  --color-primary-hover: #92513D;
  --color-accent: #B66D7D;
  --color-text: #392D30;
  --color-text-muted: #715D60;
  --color-border: #E6D9D4;
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body: "Inter", Arial, sans-serif;
  --radius-card: 14px;
  --radius-button: 10px;
  --container-width: 1200px;
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-background: #1E191D;
  --color-surface: #2A2228;
  --color-surface-soft: #30262D;
  --color-primary: #C7818F;
  --color-primary-hover: #D895A2;
  --color-accent: #E1A5B1;
  --color-text: #F7EBEE;
  --color-text-muted: #CBB9C0;
  --color-border: #44353E;
}
```

These are illustrative tokens. The final implementation should use the project's established theme mechanism and should test button text colors separately for each theme.

---

## 8. Homepage information architecture

Recommended order:

1. **Header:** Aryan Beauty wordmark, Services, Bridal, About, Contact, and a clear booking action.
2. **Hero:** concise value proposition, authentic photo, primary booking CTA, secondary service-discovery CTA.
3. **Popular services:** easy-to-understand categories with verified service details.
4. **Service catalogue:** names, prices, and estimated duration where confirmed.
5. **Bridal and occasion section:** distinct visual treatment and a consultation/enquiry CTA when appropriate.
6. **About the salon/team:** real owner/team introduction and a short authentic story.
7. **Trust signals:** genuine reviews, real work photos with permission, transparent policies.
8. **Booking prompt:** reinforce the next step without creating competing calls to action.
9. **Location and contact:** actual address, hours, phone/contact links, and map/directions.
10. **Footer:** useful business links and relevant policies.

The homepage should not become an excessively long marketing page. Prioritize service discovery and booking; use concise sections and clear hierarchy.

### Hero direction

- Desktop: copy and CTAs beside a genuine salon or service photograph.
- Mobile: copy and booking action first, followed by a properly cropped image.
- Avoid generic stock photos if they do not represent Aryan Beauty.
- Do not invent customer counts, awards, years of experience, prices, or guarantees.

---

## 9. Services and pricing UX

Every service listing should show only information that is known and maintained accurately.

Recommended fields where supported by the current data model:
- Service name.
- Short description.
- Price or clearly labeled starting price.
- Estimated duration.
- Category.
- Relevant image.
- Booking eligibility or consultation requirement.

UX rules:
- Organize everyday services into categories such as Hair, Skin & Facials, Threading & Waxing, and Makeup only where these reflect actual offerings.
- Keep service names familiar to local customers.
- Provide a way to browse the complete catalogue.
- Do not invent services, prices, durations, packages, or availability to fill out the UI.
- If a price depends on consultation or hair/skin length, explain that honestly.
- Keep the catalogue easy to use on a phone.
- Selecting a service should feed into the booking flow without losing the selection.

---

## 10. Bridal and occasion experience

Bridal customers may need more information and reassurance than everyday-service customers.

Recommended treatment:
- Use a curated set of genuine bridal/occasion photographs, with permission.
- Explain actual packages and inclusions only after the business confirms them.
- Display starting prices only if the salon can maintain them accurately.
- Explain whether the customer should request a consultation or can book directly.
- Provide a dedicated **Enquire about bridal makeup** or equivalent CTA if this matches the real workflow.
- Do not let bridal styling dominate the entire brand or make everyday customers feel excluded.

---

## 11. Booking flow and status feedback

The booking experience must stay consistent with the existing backend and actual salon operations.

Recommended flow:

1. Choose a service.
2. Select a genuinely available date and time.
3. Enter the necessary customer details.
4. Review the service, date, time, and price where applicable.
5. Submit the booking request.
6. Show an accurate result and explain the next step.

Requirements:
- Display immediate success or error feedback after submission.
- Prevent accidental duplicate submissions.
- Preserve entered data when a recoverable error occurs.
- Clearly distinguish **requested/pending**, **confirmed**, **rejected/cancelled**, and **failed** states as supported by the actual workflow.
- Never tell the customer an appointment is confirmed if it is still awaiting salon approval.
- Ensure admin status changes and customer-facing messaging remain consistent.
- Keep the mobile form short and understandable.
- Do not introduce phone OTP or other verification requirements without a separate product decision.

---

## 12. Trust and local-business information

Trust should come from verifiable details rather than decorative claims.

Prioritize:
- Real photos of the parlour, entrance, staff, and service work.
- Genuine customer reviews, displayed with permission and without fabrication.
- Accurate address, map/directions, opening hours, and contact information.
- Transparent pricing and appointment policies.
- Honest information about hygiene and service practices.
- A brief, personal explanation of who runs the salon.
- Clear confirmation and cancellation expectations.

Do not create fake reviews, invented testimonials, fabricated credentials, or unverified claims.

---

## 13. Mobile-first behavior

- Design the narrow-screen experience first and enhance it for larger screens.
- Keep the primary booking action easy to reach.
- If a fixed mobile booking bar is used, ensure it never obscures content, form controls, or browser safe areas.
- Use large enough touch targets and spacing between controls.
- Avoid horizontal scrolling and overly dense service cards.
- Ensure dates, time slots, prices, and validation errors are readable without zooming.
- Keep image crops intentional across screen sizes.
- Test the site at 320 px, 375 px, 390 px, tablet, and desktop widths.
- Check both light and dark themes at all major breakpoints.

---

## 14. Accessibility, performance, and SEO

### Accessibility
- Use semantic headings and landmarks.
- Provide labels for all form controls.
- Support keyboard navigation and visible focus.
- Announce important form feedback and booking status to assistive technology.
- Do not communicate status through color alone.
- Check contrast for all text, buttons, focus indicators, borders, and disabled states.
- Respect reduced-motion preferences.

### Performance
- Use the framework's established image optimization approach and responsive image sizes.
- Avoid eagerly loading below-the-fold galleries.
- Reserve image dimensions to reduce layout shifts.
- Keep client-side JavaScript limited to genuinely interactive components.
- Avoid adding large libraries for simple effects or controls.

### SEO
- Use meaningful page titles, descriptions, and headings.
- Write service content using actual service names and local business details.
- Add structured data only when values are accurate and supported.
- Keep location and contact details consistent across the site.
- Do not invent addresses, prices, ratings, opening hours, or business credentials.

---

## 15. Technical implementation constraints

The current product is built with Next.js App Router, Prisma, Supabase PostgreSQL, and Clerk. The website already has a working booking path, so UI work must not casually alter business logic.

- Inspect the current repository, components, styling setup, routes, data models, and booking/admin workflows before implementation.
- Prefer incremental changes over a rewrite.
- Preserve existing authentication, authorization, data access, and booking validation.
- Keep server components for appropriate data-driven rendering and use client components only when interaction requires them.
- Use existing service and appointment data as the source of truth.
- Do not hardcode production service catalogues or appointment availability.
- Keep secrets and environment values out of source files and documentation.
- Do not change database schema, migrations, authentication, or deployment configuration solely to implement visual styling.
- Check existing design tokens and dependencies before adding fonts or libraries.
- Keep all work on the designated feature branch. Do not commit design work to `main` or `develop`.
- Review diffs and test booking flows before proposing a merge.

This document describes the design target; it does not assert that the existing repository has already been inspected or that the implementation is complete.

---

## 16. Implementation priorities

### P1 — Foundation
- Inspect current styling and component architecture.
- Establish semantic light/dark theme tokens.
- Standardize typography, spacing, buttons, cards, borders, and focus states.
- Improve header, navigation, and responsive layout.
- Fix inconsistent light-theme styling.

### P2 — Service discovery and booking
- Improve category navigation and service cards.
- Make verified prices and durations easy to find.
- Improve booking form feedback and status clarity.
- Test loading, empty, error, pending, and success states.

### P3 — Brand and trust
- Integrate authentic salon imagery.
- Improve the about/team section.
- Add genuine reviews and location information.
- Develop the bridal/occasion section using confirmed business details.

### P4 — Validation
- Test mobile, tablet, and desktop layouts in both themes.
- Verify accessibility and contrast.
- Run existing project checks and relevant booking tests.
- Check performance and metadata.
- Confirm the admin workflow still functions.

---

## 17. Acceptance criteria

The design implementation is ready for review when:

- [ ] Light mode uses the approved Dusty Rose & Cream direction consistently.
- [ ] Dark mode uses coordinated deep plum-brown surfaces and accessible rose accents.
- [ ] Theme selection supports Light, Dark, and System behavior (or an agreed equivalent) and persists appropriately.
- [ ] Public pages, forms, overlays, and admin screens are theme-consistent.
- [ ] The site works without horizontal overflow at 320 px width.
- [ ] Navigation and booking actions are obvious and keyboard-accessible.
- [ ] Services, prices, durations, and availability come from verified data.
- [ ] Booking submission reports success/failure accurately and prevents duplicate submission.
- [ ] Pending appointments are not represented as confirmed.
- [ ] Real business information and imagery are used only after verification/permission.
- [ ] Contrast, labels, focus, reduced motion, and status announcements are checked.
- [ ] Existing authentication, data access, and booking logic remain intact.
- [ ] Relevant checks/tests pass, and the final diff has been reviewed.
- [ ] Changes remain on the feature branch until reviewed and approved.

---

## 18. Decision log

| Decision | Status | Rationale |
|---|---|---|
| Use Refresh Salon as the UX reference | Approved | Practical service discovery, pricing, and booking patterns |
| Use Two Birds as the brand identity reference | Approved | Cohesive and restrained visual identity |
| Warm and familiar brand personality | Approved | Fits a local salon where trust matters |
| Serve everyday and bridal customers | Approved | Both audiences must be represented without one overwhelming the other |
| Balance branding, trust, and booking | Approved | The site should look polished and remain useful |
| Dusty Rose & Cream palette | Approved | Pink adds beauty-oriented personality; cream and earthy tones preserve warmth |
| Coordinated dark mode | Approved | A complete second theme is required |
| Mobile-first implementation | Approved | Service discovery and booking must work comfortably on phones |
| Exact final contrast-adjusted tokens | To validate | Proposed hex values need accessibility testing in context |
| Final logo and brand assets | To decide | Requires confirmation and authentic business identity |
| Actual service catalogue and prices | To verify | Must come from the salon, not invented placeholder content |
| Real photos, reviews, and business details | To gather/verify | Trust content must be authentic and permitted |
| Final implementation mapping | Requires repository inspection | Must fit the existing architecture without disrupting booking |

---

## 19. Open questions before final polish

These do not block implementation of the visual foundation, but should be resolved before content is finalized:

1. Which real salon photos can be used on the website?
2. What are the verified service names, prices, and durations?
3. Which bridal services/packages are offered, and do they require consultation?
4. What are the correct address, hours, contact details, and booking policies?
5. Does the owner prefer a botanical mark, a wordmark, or another logo direction?
6. Which genuine customer reviews or portfolio images are available for use?

---

## 20. Final design statement

**Aryan Beauty should look like a real, trusted local parlour with a carefully designed modern website.** Warm cream provides the canvas, dusty rose gives the brand its beauty-oriented personality, terracotta anchors key actions, and deep plum-brown creates a cohesive dark mode. The interface should make it easy to understand services, trust the business, and request or confirm an appointment—without sacrificing performance, accessibility, or the reliability of the existing booking system.
