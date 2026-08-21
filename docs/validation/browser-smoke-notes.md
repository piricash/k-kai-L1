# Browser smoke-test notes

| Date | Environment | Observation |
|---|---|---|
| 2026-08-21 | Managed preview | The initial kaimahi workspace rendered with the charcoal house rail, date ribbon, weekly meal cards, `$5.00` and `FREE` price states, booking summary, role switch and explicit browser-local POC notice. |

The first rendered view presents the intended weekly booking workflow without an authentication claim. Further interaction checks will verify booking save, KaiChef-only workspaces, email review and print preview.

| Date | Environment | Interaction result |
|---|---|---|
| 2026-08-21 | Managed preview | Selecting Tuesday updated the booking summary to one day. Selecting Wednesday exposed the available-on-request Vegan control and updated the summary to two days, preserving `FREE` in the weekly total. |
| 2026-08-21 | Managed preview | Saving the weekly selection showed a success message and rendered Tuesday and Wednesday as already booked for the test kaimahi. Switching to the KaiChef test role exposed the menu, daily service and email-review controls, plus meal and price forms. |
| 2026-08-21 | Managed preview | The email review listed the approved group address, required subject, meal details in date order and `FREE` for Wednesday. Its final action produced an explicit simulated-delivery confirmation and did not send an external message. |
| 2026-08-21 | Managed preview | The KaiChef daily-service view rendered the Tuesday meal, `$5.00` price, booking total of three, a gluten-free request total and alphabetical pickup rows with physical collection lines. |
| 2026-08-21 | Managed preview | The A4 pickup-sheet preview displayed the day, meal, price, alphabetical names, dietary requests and signature column. The visual review then adjusted the booking screen so the service ledger outranks food imagery and olive carries the main booking action. |
