/** Kākāriki Kai design philosophy: preserve simple, transparent domain rules behind the POC UI. */
import { describe, expect, it } from "vitest";
import {
  createInitialKaiState,
  formatPrice,
  sortedBookingsForDay,
  upsertWeeklyBookings,
} from "./kai-data";

describe("Kākāriki Kai POC domain rules", () => {
  it("uses FREE instead of a zero-dollar display", () => {
    expect(formatPrice(0)).toBe("FREE");
    expect(formatPrice(500)).toBe("$5.00");
  });

  it("keeps one booking per person per menu day when a weekly booking is re-submitted", () => {
    const state = createInitialKaiState();
    const menuDayId = state.menuDays[0].id;
    const firstPass = upsertWeeklyBookings(state, {
      userId: "user-aroh",
      userName: "Aroha Ngata",
      selectedDayIds: [menuDayId],
      dietaryByDay: { [menuDayId]: ["gluten-free"] },
    });
    const secondPass = upsertWeeklyBookings(firstPass, {
      userId: "user-aroh",
      userName: "Aroha Ngata",
      selectedDayIds: [menuDayId],
      dietaryByDay: { [menuDayId]: ["dairy-free"] },
    });

    const personalBookings = secondPass.bookings.filter(
      (booking) => booking.userId === "user-aroh" && booking.menuDayId === menuDayId,
    );
    expect(personalBookings).toHaveLength(1);
    expect(personalBookings[0].requestedDietaryOptions).toEqual(["dairy-free"]);
  });

  it("orders a daily pickup list by kaimahi name", () => {
    const state = createInitialKaiState();
    const menuDayId = state.menuDays[0].id;
    const list = sortedBookingsForDay(state, menuDayId);
    expect(list.map((booking) => booking.userName)).toEqual(["Hone Te Paa", "Maia Rangi"]);
  });
});
