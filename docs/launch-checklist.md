# Launch checklist (Phase 10 and 11)

## Before launch
- [ ] `npm run validate:strict` passes (100 live vehicles, all specs sourced)
- [ ] `npm run audit:licenses` passes; every CC BY credit shows on the Credits page
- [ ] Replace placeholders in `apps/web/src/lib/site.ts` (domain, takedown email, GitHub suggestion URL)
- [ ] Lawyer or IP clinic reviews Privacy, Terms and the vehicle/brand-rights question; required before ads, affiliates or payments
- [ ] `npm run eval:chat` at 90%+; each fallback works when you deliberately break the one before it (wrong token)
- [ ] Lighthouse mobile, keyboard navigation, Chrome / Safari / Firefox, a real Android phone and an iPhone
- [ ] Every GLB loads in under 4 s on 4G
- [ ] Soft launch to 20-30 people for a week; fix the top five issues
- [ ] Public launch: 30-second screen recording; Reddit car/bike communities (follow rules), X, LinkedIn, Product Hunt, Indian vehicle forums

## After launch
- [ ] Add 20-50 vehicles a month (`npm run new-vehicle`)
- [ ] Ask model creators for explicit permission
- [ ] Upgrade triggers: any revenue means Vercel Pro; chat waits mean Render Starter; models over ~300 MB mean Cloudflare R2; more AI traffic means a paid tier
