# Kākāriki Kai — design direction

## Three directions considered

| Theme name | Very brief intro | Probability |
|---|---|---:|
| House service ledger | A warm operational tool that feels like a well-run noticeboard in a shared building. It uses quiet surfaces, clear dates and a persistent house rail. | 0.07 |
| Kitchen notebook | A softer, more editorial food-first direction built around handwritten cues and market imagery. It would give meals the leading role, with less emphasis on operations. | 0.03 |
| Civic calendar | A precise, schedule-led interface informed by public-service timetables. It prioritises scanability and formal information hierarchy over warmth. | 0.09 |

## Chosen approach — House service ledger

**Design movement.** Kākāriki House’s warm, quiet service-hub system: a contemporary civic-service application with a clear, desktop-first operational rail rather than a generic dashboard.

**Core principles.** First, the daily decision should be visible without hunting. Second, surfaces remain calm so date, price and dietary information carry the hierarchy. Third, chef-only actions are obvious but never visually dominant. Fourth, every word should sound like a helpful colleague on Level 1.

**Color philosophy.** Off-white and white hold almost all information, keeping the product calm and practical. Kākāriki green is reserved for structure, selected states and affirmative actions. Kōwhai orange is used once per screen for the most time-sensitive item or an active date, never as decoration.

**Layout paradigm.** A fixed charcoal house rail anchors the experience. The main workspace is a vertically paced service ledger: a small status strip, an anchored weekly calendar ribbon, then broad work panels. This avoids a centred marketing layout and makes the changing weekly schedule the organising device.

**Signature elements.** A calm charcoal rail carrying the house mark; a circular date-puck sequence for the current service week; and thin kōwhai rules that mark a time-sensitive section without turning the page into a set of generic cards.

**Interaction philosophy.** Decisions should feel deliberate and legible. Selectable meals use an obvious green state, hover moves a card down one pixel, and destructive-looking actions are absent in this Priority 1 interface. The chef view is protected by a clear role switch for the deployable POC.

**Animation.** Small 140–200ms opacity and 6px vertical-rise transitions announce a changed work panel. Buttons darken rather than bounce. The UI honours reduced-motion preferences and never loops or pulses.

**Typography system.** Outfit leads headings, brows and numeric week markers; Karla carries labels, descriptions and forms; IBM Plex Mono identifies prices, counts and collection dates. Headings stay sentence case with generous tracking only in eyebrows and badges.

**Brand essence.** Kākāriki Kai is the shared weekly kai service for Kākāriki House kaimahi, making a small lunch decision easy while giving the chef a reliable service ledger. **Warm, organised, unshowy.**

**Brand voice.** Headlines are short and direct; calls to action begin with a precise verb; microcopy tells people the next useful thing. Example lines: “Pick your kai for next week.” and “The list closes at 10am on Monday.”

**Wordmark and logo.** The wordmark retains the supplied wide-tracked Kākāriki House lockup, paired with a distinct kai mark: a parakeet-and-bowl symbol that reads at small size in the rail and as the browser icon.

**Signature brand color.** Kākāriki olive `#8d8b00`.

## Style Decisions

- The fixed charcoal house rail is the dominant desktop identity and operational anchor; a full-page capture may omit it because the rail is fixed, but the live workspace must always retain it.
- The booking ledger, dates, prices and booking state lead the first screen. Food imagery remains a subordinate warm detail.
- Kākāriki olive carries affirmative actions and selected states. Kōwhai is reserved for the booking-cutoff rule and short operational accents.
