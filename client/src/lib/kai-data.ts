/**
 * Kākāriki Kai design philosophy: the local POC adapter stays explicit and small
 * so a WMS API client can replace it without changing the operational UI.
 */
export type DietaryState = "default" | "request" | "not-possible";

export type DietaryKey = "vegetarian" | "vegan" | "gluten-free" | "dairy-free";

export interface DietaryOption {
  key: DietaryKey;
  label: string;
  state: DietaryState;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  dietaryOptions: DietaryOption[];
}

export interface MenuDay {
  id: string;
  date: string;
  mealId: string | null;
  priceCents: number;
  published: boolean;
}

export interface Booking {
  id: string;
  menuDayId: string;
  userId: string;
  userName: string;
  requestedDietaryOptions: DietaryKey[];
}

export interface KaiPocState {
  meals: Meal[];
  menuDays: MenuDay[];
  bookings: Booking[];
}

export const KAI_STORAGE_KEY = "kakariki-kai-poc-v1";

export const dietaryDefinitions: Array<{ key: DietaryKey; label: string }> = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "gluten-free", label: "Gluten free" },
  { key: "dairy-free", label: "Dairy free" },
];

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function nextWeekServiceDates(): string[] {
  const date = new Date();
  const monday = new Date(date);
  const dayOffset = ((8 - date.getDay()) % 7) || 7;
  monday.setDate(date.getDate() + dayOffset);
  monday.setHours(12, 0, 0, 0);

  return [1, 2, 3].map((offset) => {
    const serviceDay = new Date(monday);
    serviceDay.setDate(monday.getDate() + offset);
    return isoDate(serviceDay);
  });
}

export function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "FREE";
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 2,
  }).format(priceCents / 100);
}

export function formatServiceDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...options,
  }).format(new Date(`${date}T12:00:00`));
}

export function getMeal(state: KaiPocState, menuDay: MenuDay): Meal | undefined {
  return state.meals.find((meal) => meal.id === menuDay.mealId);
}

export function requestedDietaryOptions(meal: Meal): DietaryOption[] {
  return meal.dietaryOptions.filter((option) => option.state === "request");
}

export function sortedBookingsForDay(state: KaiPocState, menuDayId: string): Booking[] {
  return state.bookings
    .filter((booking) => booking.menuDayId === menuDayId)
    .sort((left, right) => left.userName.localeCompare(right.userName, "en-NZ"));
}

export function dietaryTotalsForDay(state: KaiPocState, menuDayId: string): Array<{ label: string; count: number }> {
  return dietaryDefinitions
    .map((definition) => ({
      label: definition.label,
      count: state.bookings.filter(
        (booking) =>
          booking.menuDayId === menuDayId && booking.requestedDietaryOptions.includes(definition.key),
      ).length,
    }))
    .filter((total) => total.count > 0);
}

export function makeDietaryOptions(
  states: Record<DietaryKey, DietaryState>,
): DietaryOption[] {
  return dietaryDefinitions.map((definition) => ({
    ...definition,
    state: states[definition.key],
  }));
}

export function createInitialKaiState(): KaiPocState {
  const [tuesday, wednesday, thursday] = nextWeekServiceDates();
  const meals: Meal[] = [
    {
      id: "meal-kumara-curry",
      name: "Kumara and chickpea curry",
      description: "Slow-cooked kumara, chickpeas and spinach with rice and fresh herbs.",
      dietaryOptions: makeDietaryOptions({
        vegetarian: "default",
        vegan: "default",
        "gluten-free": "default",
        "dairy-free": "default",
      }),
    },
    {
      id: "meal-roast-salad",
      name: "Roast vegetable salad",
      description: "Warm roasted vegetables, crunchy leaves, seeds and sesame dressing.",
      dietaryOptions: makeDietaryOptions({
        vegetarian: "default",
        vegan: "request",
        "gluten-free": "default",
        "dairy-free": "default",
      }),
    },
    {
      id: "meal-chicken-soup",
      name: "Chicken and kūmara soup",
      description: "A warm bowl of chicken, kūmara and greens, served with a soft roll.",
      dietaryOptions: makeDietaryOptions({
        vegetarian: "request",
        vegan: "not-possible",
        "gluten-free": "request",
        "dairy-free": "request",
      }),
    },
  ];

  const menuDays: MenuDay[] = [
    { id: "menu-tuesday", date: tuesday, mealId: meals[0].id, priceCents: 500, published: true },
    { id: "menu-wednesday", date: wednesday, mealId: meals[1].id, priceCents: 0, published: true },
    { id: "menu-thursday", date: thursday, mealId: meals[2].id, priceCents: 500, published: true },
  ];

  return {
    meals,
    menuDays,
    bookings: [
      {
        id: "booking-1",
        menuDayId: "menu-tuesday",
        userId: "user-maia",
        userName: "Maia Rangi",
        requestedDietaryOptions: ["gluten-free"],
      },
      {
        id: "booking-2",
        menuDayId: "menu-tuesday",
        userId: "user-hone",
        userName: "Hone Te Paa",
        requestedDietaryOptions: [],
      },
      {
        id: "booking-3",
        menuDayId: "menu-wednesday",
        userId: "user-sasha",
        userName: "Sasha Wilson",
        requestedDietaryOptions: ["vegan"],
      },
    ],
  };
}

export function readKaiState(): KaiPocState {
  try {
    const stored = window.localStorage.getItem(KAI_STORAGE_KEY);
    if (!stored) return createInitialKaiState();
    const parsed = JSON.parse(stored) as KaiPocState;
    if (!parsed.meals || !parsed.menuDays || !parsed.bookings) return createInitialKaiState();
    return parsed;
  } catch {
    return createInitialKaiState();
  }
}

export function persistKaiState(state: KaiPocState): void {
  window.localStorage.setItem(KAI_STORAGE_KEY, JSON.stringify(state));
}

export function resetKaiState(): KaiPocState {
  const state = createInitialKaiState();
  persistKaiState(state);
  return state;
}

export function upsertWeeklyBookings(
  state: KaiPocState,
  params: {
    userId: string;
    userName: string;
    selectedDayIds: string[];
    dietaryByDay: Record<string, DietaryKey[]>;
  },
): KaiPocState {
  const bookingMap = new Map(
    state.bookings.map((booking) => [`${booking.userId}:${booking.menuDayId}`, booking]),
  );

  params.selectedDayIds.forEach((menuDayId) => {
    const key = `${params.userId}:${menuDayId}`;
    bookingMap.set(key, {
      id: bookingMap.get(key)?.id ?? `booking-${crypto.randomUUID()}`,
      menuDayId,
      userId: params.userId,
      userName: params.userName,
      requestedDietaryOptions: params.dietaryByDay[menuDayId] ?? [],
    });
  });

  return { ...state, bookings: Array.from(bookingMap.values()) };
}
