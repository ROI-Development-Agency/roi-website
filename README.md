# ROI Development Agency — Website

## Files in this folder

**Pages (6):**
- `index.html` — Homepage (with Anchor Drop intro animation)
- `services.html` — All 6 services in detail
- `work.html` — Client testimonials as case studies
- `about.html` — Story, values, approach
- `diagnostic.html` — Interactive 7-question Growth Diagnostic
- `contact.html` — Contact form + info

**Assets:**
- `styles.css` — All site styles
- `script.js` — Nav, mobile menu, scroll reveals
- `anchor-dark.png` — Dark cyan anchor (for light backgrounds)
- `anchor-white.png` — White anchor (for dark backgrounds)
- `logo-dark.png` — Full dark logo (for light backgrounds)
- `logo-white.png` — Full white logo (for dark backgrounds)
- `_redirects` — Netlify clean URL routing

## How to deploy to Netlify

1. Log into your Netlify account
2. Click "Add new site" → "Deploy manually"
3. Drag the ENTIRE folder (not the zip) onto the upload area
4. Wait ~30 seconds, you'll get a live preview URL
5. Once it looks right, connect your domain in "Domain management"

## Things that still need real implementation

- **Contact form submission** — currently shows a success message but doesn't actually email anyone. Connect via Netlify Forms (just add `data-netlify="true"` and `name="contact"` to the form tag) or Formspree.
- **Diagnostic email delivery** — currently calculates score and shows result, but doesn't actually email a report. Needs an email service integration (Mailchimp, Brevo, ConvertKit, etc.) and a backend function.

## Notes

- The intro animation only plays on the homepage
- Mobile menu works on tablet and phone widths
- All testimonials are from real Google reviews
- "Coming Soon" placeholder is on the Work page for future case studies with actual metrics
