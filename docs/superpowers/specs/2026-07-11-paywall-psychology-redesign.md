# Paywall Psychology Redesign

## Changes
- Complete visual overhaul of `PaywallOverlay.tsx`
- No "free plan" concept — framing is "Without Antaios vs With Antaios"
- Single tier: Direct at €500/mo (annual €417/mo, "2 months free")
- Removed "Risk assessment reports" feature
- Psychology techniques: loss aversion, prospection, social proof, risk reversal, anchoring, endowment

## Design
- **Approach**: B (Compliance Insurance) — adapted for no-free-plan + 1-tier
- **Dials**: VARIANCE 5, MOTION 4, DENSITY 4 (sleek B2B professional)
- **Tech**: shadcn/ui components, Tailwind v4, motion library, existing theming
- **Overlay**: Full-screen with backdrop blur, keeps dashboard visible underneath
- **Comparison**: 2-col "Without Antaios → With Antaios" mental contrasting
- **ROI**: Cost of manual compliance (~€19,200/yr) vs Direct (€6,000/yr)
- **Pricing**: Annual default with monthly toggle, "Save 2 months" framing
- **Social proof**: Testimonial with name + role + specific metric
- **Risk reversal**: "Cancel anytime" + "30-day money-back" + "No CC required"
- **Escape hatch**: "I'll manage compliance manually" link

## Psychology Techniques Used
1. **Mental contrasting** — Without/With comparison creates tension → motivation
2. **Loss aversion** — Explicit cost of non-compliance shown
3. **Prospection** — "What you'll achieve with Direct" future-state imagery
4. **Social proof** — Testimonial with specific, verifiable result
5. **Endowment effect** — User's existing compliance data is referenced
6. **Risk reversal** — Guarantee reduces purchase anxiety at €500/mo
7. **Anchoring** — ROI savings shown before price
