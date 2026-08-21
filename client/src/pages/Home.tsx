/**
 * Kākāriki Kai design philosophy: a warm, operational service ledger where weekly
 * decisions are clear, chef actions are calm, and the POC boundary is always honest.
 */
import { Button } from "@/components/ui/button";
import { KindeIdentityAction } from "@/components/KindeIdentityAction";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CookingPot,
  FileText,
  Leaf,
  Mail,
  Menu,
  PencilLine,
  Plus,
  Printer,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type DietaryKey,
  type DietaryState,
  type KaiPocState,
  type Meal,
  createInitialKaiState,
  dietaryDefinitions,
  dietaryTotalsForDay,
  formatPrice,
  formatServiceDate,
  getMeal,
  makeDietaryOptions,
  persistKaiState,
  readKaiState,
  requestedDietaryOptions,
  resetKaiState,
  sortedBookingsForDay,
  upsertWeeklyBookings,
} from "@/lib/kai-data";

type View = "book" | "menu" | "service";
type Role = "kaimahi" | "chef";

const testUser = { id: "user-aroh", name: "Aroha Ngata" };

const mealImages: Record<string, string> = {
  "meal-kumara-curry": "https://files.manuscdn.com/user_upload_by_module/session_file/121020228/wjXFaDeybxVyYWFf.jpg",
  "meal-roast-salad": "https://files.manuscdn.com/user_upload_by_module/session_file/121020228/riuxLDSRqlJOFxof.jpg",
};

function dayNumber(date: string): string {
  return new Intl.DateTimeFormat("en-NZ", { day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function dayShort(date: string): string {
  return new Intl.DateTimeFormat("en-NZ", { weekday: "short" }).format(new Date(`${date}T12:00:00`));
}

function todayDateLabel(): string {
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function dietarySummary(meal: Meal): string {
  const defaults = meal.dietaryOptions
    .filter((option) => option.state === "default")
    .map((option) => option.label);
  const onRequest = meal.dietaryOptions
    .filter((option) => option.state === "request")
    .map((option) => option.label);
  const parts = [];
  if (defaults.length) parts.push(`Includes ${defaults.join(", ")}`);
  if (onRequest.length) parts.push(`On request: ${onRequest.join(", ")}`);
  return parts.join(" · ") || "No dietary variation noted";
}

export default function Home() {
  const [state, setState] = useState<KaiPocState>(() => readKaiState());
  const [activeView, setActiveView] = useState<View>("book");
  const [role, setRole] = useState<Role>("kaimahi");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDayIds, setSelectedDayIds] = useState<string[]>([]);
  const [dietaryByDay, setDietaryByDay] = useState<Record<string, DietaryKey[]>>({});
  const [serviceDayId, setServiceDayId] = useState(() => state.menuDays[0]?.id ?? "");
  const [scheduleDayId, setScheduleDayId] = useState(() => state.menuDays[0]?.id ?? "");
  const [scheduleMealId, setScheduleMealId] = useState(() => state.menuDays[0]?.mealId ?? "");
  const [schedulePrice, setSchedulePrice] = useState(() => String((state.menuDays[0]?.priceCents ?? 500) / 100));
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [dietaryStates, setDietaryStates] = useState<Record<DietaryKey, DietaryState>>({
    vegetarian: "default",
    vegan: "request",
    "gluten-free": "request",
    "dairy-free": "request",
  });
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [printDayId, setPrintDayId] = useState<string | null>(null);

  useEffect(() => {
    persistKaiState(state);
  }, [state]);

  const menuDays = useMemo(
    () => [...state.menuDays].sort((left, right) => left.date.localeCompare(right.date)),
    [state.menuDays],
  );
  const currentBookings = useMemo(
    () => state.bookings.filter((booking) => booking.userId === testUser.id),
    [state.bookings],
  );
  const selectedServiceDay = state.menuDays.find((day) => day.id === serviceDayId) ?? menuDays[0];
  const selectedScheduleDay = state.menuDays.find((day) => day.id === scheduleDayId) ?? menuDays[0];
  const selectedPrintDay = state.menuDays.find((day) => day.id === printDayId) ?? null;

  function selectView(view: View): void {
    setActiveView(view);
    setMobileOpen(false);
  }

  function toggleBooking(menuDayId: string): void {
    const existing = currentBookings.some((booking) => booking.menuDayId === menuDayId);
    if (existing) {
      toast.message("That day is already in your booking", {
        description: "Cancellations still go through the coordinator for now.",
      });
      return;
    }

    setSelectedDayIds((current) =>
      current.includes(menuDayId)
        ? current.filter((dayId) => dayId !== menuDayId)
        : [...current, menuDayId],
    );
  }

  function toggleDietary(menuDayId: string, dietaryKey: DietaryKey): void {
    setDietaryByDay((current) => {
      const selected = current[menuDayId] ?? [];
      return {
        ...current,
        [menuDayId]: selected.includes(dietaryKey)
          ? selected.filter((key) => key !== dietaryKey)
          : [...selected, dietaryKey],
      };
    });
  }

  function submitWeeklyBooking(): void {
    if (!selectedDayIds.length) {
      toast.message("Choose at least one day", { description: "Pick the kai you would like, then save your booking." });
      return;
    }

    setState((current) =>
      upsertWeeklyBookings(current, {
        userId: testUser.id,
        userName: testUser.name,
        selectedDayIds,
        dietaryByDay,
      }),
    );
    setSelectedDayIds([]);
    setDietaryByDay({});
    toast.success("Your kai booking is in", { description: "We have saved the days you picked in this test workspace." });
  }

  function resetPoc(): void {
    setState(resetKaiState());
    setSelectedDayIds([]);
    setDietaryByDay({});
    setEmailSent(false);
    toast.success("Test workspace reset", { description: "The starter menu and example bookings are back." });
  }

  function changeScheduleDay(dayId: string): void {
    const day = state.menuDays.find((candidate) => candidate.id === dayId);
    if (!day) return;
    setScheduleDayId(dayId);
    setScheduleMealId(day.mealId ?? "");
    setSchedulePrice(String(day.priceCents / 100));
  }

  function saveScheduleDay(): void {
    const cents = Math.round(Number(schedulePrice) * 100);
    if (Number.isNaN(cents) || cents < 0) {
      toast.error("Add a valid price", { description: "Use zero for a free kai day." });
      return;
    }
    setState((current) => ({
      ...current,
      menuDays: current.menuDays.map((day) =>
        day.id === scheduleDayId
          ? { ...day, mealId: scheduleMealId || null, priceCents: cents, published: Boolean(scheduleMealId) }
          : day,
      ),
    }));
    toast.success("Menu day saved", { description: cents === 0 ? "This day will show as FREE." : "The updated menu is ready for kaimahi." });
  }

  function clearMealForm(): void {
    setEditingMealId(null);
    setMealName("");
    setMealDescription("");
    setDietaryStates({ vegetarian: "default", vegan: "request", "gluten-free": "request", "dairy-free": "request" });
  }

  function startMealEdit(meal: Meal): void {
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setMealDescription(meal.description);
    setDietaryStates(
      meal.dietaryOptions.reduce(
        (current, option) => ({ ...current, [option.key]: option.state }),
        {} as Record<DietaryKey, DietaryState>,
      ),
    );
    setActiveView("menu");
  }

  function saveMeal(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!mealName.trim() || !mealDescription.trim()) {
      toast.error("Add a name and description", { description: "Keep it clear so kaimahi can make a quick call." });
      return;
    }
    const meal: Meal = {
      id: editingMealId ?? `meal-${crypto.randomUUID()}`,
      name: mealName.trim(),
      description: mealDescription.trim(),
      dietaryOptions: makeDietaryOptions(dietaryStates),
    };
    setState((current) => ({
      ...current,
      meals: editingMealId
        ? current.meals.map((candidate) => (candidate.id === editingMealId ? meal : candidate))
        : [...current.meals, meal],
    }));
    toast.success(editingMealId ? "Meal updated" : "Meal added", { description: "You can now put it on a menu day." });
    clearMealForm();
  }

  function printSheet(): void {
    if (!selectedPrintDay) return;
    window.print();
  }

  function sendEmailSimulation(): void {
    setEmailSent(true);
    toast.success("Email marked as sent", { description: "Delivery is simulated in this front-end test workspace." });
  }

  const canManage = role === "chef";
  const navItems: Array<{ view: View; label: string; icon: typeof CalendarDays; chefOnly?: boolean }> = [
    { view: "book", label: "Book kai", icon: CalendarDays },
    { view: "menu", label: "Weekly menu", icon: CookingPot, chefOnly: true },
    { view: "service", label: "Daily service", icon: UsersRound, chefOnly: true },
  ];

  return (
    <div className="app-shell">
      <aside className={`side-rail ${mobileOpen ? "side-rail--open" : ""}`} aria-label="Kākāriki Kai navigation">
        <div className="rail-brand">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/121020228/vlQXLFaMtbQipNRK.png" alt="" className="brand-mark" />
          <div>
            <p className="brand-kicker">KĀKĀRIKI HOUSE</p>
            <p className="brand-name">Kai</p>
          </div>
        </div>
        <div className="rail-rule" />
        <p className="nav-section-label">Your kai</p>
        <nav className="rail-nav">
          {navItems.map((item) => {
            if (item.chefOnly && !canManage) return null;
            const Icon = item.icon;
            return (
              <button
                type="button"
                className={`rail-nav__item ${activeView === item.view ? "rail-nav__item--active" : ""}`}
                onClick={() => selectView(item.view)}
                key={item.view}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="rail-spacer" />
        <div className="poc-panel">
          <div className="poc-panel__title"><ShieldCheck size={16} /> Test workspace</div>
          <p>Bookings live in this browser while we set up the production service.</p>
          <button type="button" onClick={resetPoc}>Reset test data</button>
        </div>
        <div className="role-switch">
          <p className="nav-section-label">Test as</p>
          <div className="role-switch__buttons" aria-label="Test role">
            <button type="button" className={role === "kaimahi" ? "is-active" : ""} onClick={() => { setRole("kaimahi"); setActiveView("book"); }}>
              Kaimahi
            </button>
            <button type="button" className={role === "chef" ? "is-active" : ""} onClick={() => { setRole("chef"); setActiveView("menu"); }}>
              KaiChef
            </button>
          </div>
          <div className="signed-in-user">
            <div className="avatar-initials">AN</div>
            <div><strong>{testUser.name}</strong><span>{role === "chef" ? "KaiChef test role" : "Kaimahi test role"}</span></div>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button type="button" className="mobile-menu" onClick={() => setMobileOpen((current) => !current)} aria-label="Open navigation">
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div><p className="topbar__crumb">Kākāriki House / Kai</p><p className="topbar__date">{todayDateLabel()}</p></div>
          <KindeIdentityAction />
        </header>

        <div className="workspace-body">
          <section className="week-ribbon" aria-label="Menu days this week">
            <div><p className="eyebrow">Next service week</p><h1>{activeView === "book" ? "Pick your kai" : activeView === "menu" ? "Set the weekly menu" : "Run daily service"}</h1></div>
            <div className="week-ribbon__dates">
              {menuDays.map((day) => (
                <button
                  type="button"
                  key={day.id}
                  className={`date-puck ${serviceDayId === day.id ? "date-puck--active" : ""}`}
                  onClick={() => { setServiceDayId(day.id); if (activeView === "service") selectView("service"); }}
                  aria-label={`View ${formatServiceDate(day.date)}`}
                >
                  <span>{dayShort(day.date)}</span><strong>{dayNumber(day.date)}</strong>
                </button>
              ))}
            </div>
          </section>

          {activeView === "book" && (
            <BookingWorkspace
              state={state}
              menuDays={menuDays}
              currentBookings={currentBookings}
              selectedDayIds={selectedDayIds}
              dietaryByDay={dietaryByDay}
              onToggleBooking={toggleBooking}
              onToggleDietary={toggleDietary}
              onSubmit={submitWeeklyBooking}
            />
          )}

          {activeView === "menu" && canManage && (
            <ChefMenuWorkspace
              state={state}
              menuDays={menuDays}
              scheduleDayId={scheduleDayId}
              scheduleMealId={scheduleMealId}
              schedulePrice={schedulePrice}
              onChangeDay={changeScheduleDay}
              onChangeMeal={setScheduleMealId}
              onChangePrice={setSchedulePrice}
              onSaveSchedule={saveScheduleDay}
              editingMealId={editingMealId}
              mealName={mealName}
              mealDescription={mealDescription}
              dietaryStates={dietaryStates}
              onMealName={setMealName}
              onMealDescription={setMealDescription}
              onDietaryState={(key, value) => setDietaryStates((current) => ({ ...current, [key]: value }))}
              onSaveMeal={saveMeal}
              onStartMealEdit={startMealEdit}
              onClearMealForm={clearMealForm}
              onOpenEmail={() => setEmailOpen(true)}
            />
          )}

          {activeView === "service" && canManage && selectedServiceDay && (
            <ServiceWorkspace
              state={state}
              menuDays={menuDays}
              serviceDayId={serviceDayId}
              selectedDay={selectedServiceDay}
              onSelectDay={setServiceDayId}
              onPrint={(dayId) => setPrintDayId(dayId)}
            />
          )}
        </div>
      </main>

      {emailOpen && (
        <EmailReviewModal
          state={state}
          emailSent={emailSent}
          onClose={() => setEmailOpen(false)}
          onSend={sendEmailSimulation}
        />
      )}
      {selectedPrintDay && (
        <PrintSheet
          state={state}
          menuDay={selectedPrintDay}
          onClose={() => setPrintDayId(null)}
          onPrint={printSheet}
        />
      )}
    </div>
  );
}

function BookingWorkspace(props: {
  state: KaiPocState;
  menuDays: KaiPocState["menuDays"];
  currentBookings: KaiPocState["bookings"];
  selectedDayIds: string[];
  dietaryByDay: Record<string, DietaryKey[]>;
  onToggleBooking: (menuDayId: string) => void;
  onToggleDietary: (menuDayId: string, dietaryKey: DietaryKey) => void;
  onSubmit: () => void;
}) {
  const bookedCount = props.currentBookings.length;
  const pickedCount = props.selectedDayIds.length;

  return (
    <div className="content-grid content-grid--booking">
      <div className="main-stack">
        <section className="booking-ledger" aria-label="Next week’s service ledger">
          <div className="booking-ledger__content">
            <div className="booking-ledger__heading"><div><p className="eyebrow">Booking window</p><h2>Next week at a glance</h2></div><p className="deadline-note">Book by <strong>10am Monday</strong></p></div>
            <div className="ledger-days">{props.menuDays.map((day) => { const meal = getMeal(props.state, day); const booked = props.currentBookings.some((booking) => booking.menuDayId === day.id); return <div className="ledger-day" key={day.id}><div className="ledger-day__date"><span>{dayShort(day.date)}</span><strong>{dayNumber(day.date)}</strong></div><div><strong>{meal?.name ?? "No kai scheduled"}</strong><span>{formatPrice(day.priceCents)}</span></div><em>{booked ? "Booked" : "Open"}</em></div>; })}</div>
          </div>
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/121020228/PywvfuAusgDnAaUO.jpg" alt="A bowl of seasonal kai on a table" />
        </section>
        <section className="section-heading"><div><p className="eyebrow">Menu</p><h2>Next week’s kai</h2></div><p>{bookedCount ? `${bookedCount} day${bookedCount === 1 ? "" : "s"} already booked` : "Nothing booked yet"}</p></section>
        <div className="meal-list">
          {props.menuDays.map((day) => {
            const meal = getMeal(props.state, day);
            if (!meal || !day.published) return <NoServiceCard key={day.id} day={day} />;
            const alreadyBooked = props.currentBookings.some((booking) => booking.menuDayId === day.id);
            const picked = props.selectedDayIds.includes(day.id);
            const requestedOptions = requestedDietaryOptions(meal);
            const image = mealImages[meal.id];
            return (
              <article className={`meal-card ${picked ? "meal-card--selected" : ""}`} key={day.id}>
                {image ? <img className="meal-card__image" src={image} alt="" /> : <div className="meal-card__image meal-card__image--blank"><Leaf size={30} /></div>}
                <div className="meal-card__date"><span>{dayShort(day.date)}</span><strong>{dayNumber(day.date)}</strong></div>
                <div className="meal-card__body"><div className="meal-card__title"><div><h3>{meal.name}</h3><p>{meal.description}</p></div><strong className={`price-tag ${day.priceCents === 0 ? "price-tag--free" : ""}`}>{formatPrice(day.priceCents)}</strong></div><p className="dietary-copy">{dietarySummary(meal)}</p>
                  {picked && requestedOptions.length > 0 && <div className="dietary-choices"><span>Dietary request</span>{requestedOptions.map((option) => <button type="button" key={option.key} className={(props.dietaryByDay[day.id] ?? []).includes(option.key) ? "choice-tag is-selected" : "choice-tag"} onClick={() => props.onToggleDietary(day.id, option.key)}><Check size={13} /> {option.label}</button>)}</div>}
                </div>
                <Button type="button" variant={picked || alreadyBooked ? "secondary" : "default"} className={picked ? "booking-action booking-action--selected" : "booking-action"} onClick={() => props.onToggleBooking(day.id)}>{alreadyBooked ? "Booked" : picked ? "Picked" : "Pick this day"}</Button>
              </article>
            );
          })}
        </div>
      </div>
      <aside className="booking-summary"><p className="eyebrow">Your booking</p><h2>{pickedCount ? `${pickedCount} day${pickedCount === 1 ? "" : "s"} ready` : "Pick a day to begin"}</h2><div className="summary-divider" />
        {props.selectedDayIds.length ? <ol>{props.menuDays.filter((day) => props.selectedDayIds.includes(day.id)).map((day) => <li key={day.id}><span>{formatServiceDate(day.date, { weekday: "short", month: "short" })}</span><strong>{formatPrice(day.priceCents)}</strong></li>)}</ol> : <p className="muted-copy">You can book the whole week in one go. We’ll keep each day separate for the chef.</p>}
        <Button type="button" className="summary-button" onClick={props.onSubmit}>Save my booking <ChevronRight size={17} /></Button><p className="summary-note">Need to cancel? Message the coordinator as usual. The $5 charge still applies after the cutoff.</p>
      </aside>
    </div>
  );
}

function NoServiceCard({ day }: { day: KaiPocState["menuDays"][number] }) {
  return <article className="meal-card meal-card--quiet"><div className="meal-card__date"><span>{dayShort(day.date)}</span><strong>{dayNumber(day.date)}</strong></div><div className="meal-card__body"><h3>No kai on this day</h3><p>The chef has not put a meal on the menu yet.</p></div></article>;
}

function ChefMenuWorkspace(props: {
  state: KaiPocState;
  menuDays: KaiPocState["menuDays"];
  scheduleDayId: string;
  scheduleMealId: string;
  schedulePrice: string;
  onChangeDay: (value: string) => void;
  onChangeMeal: (value: string) => void;
  onChangePrice: (value: string) => void;
  onSaveSchedule: () => void;
  editingMealId: string | null;
  mealName: string;
  mealDescription: string;
  dietaryStates: Record<DietaryKey, DietaryState>;
  onMealName: (value: string) => void;
  onMealDescription: (value: string) => void;
  onDietaryState: (key: DietaryKey, value: DietaryState) => void;
  onSaveMeal: (event: React.FormEvent<HTMLFormElement>) => void;
  onStartMealEdit: (meal: Meal) => void;
  onClearMealForm: () => void;
  onOpenEmail: () => void;
}) {
  const selectedDay = props.state.menuDays.find((day) => day.id === props.scheduleDayId);
  return <div className="chef-layout"><div className="main-stack"><section className="section-heading"><div><p className="eyebrow">Chef workspace</p><h2>Put kai on the calendar</h2></div><Button type="button" variant="outline" onClick={props.onOpenEmail}><Mail size={16} /> Review weekly email</Button></section>
    <section className="workspace-card schedule-card"><div className="card-title"><div className="accent-rule" /><div><h3>Menu day</h3><p>Set one meal, or leave the day empty. You can change this after people book.</p></div></div><div className="form-grid form-grid--schedule"><label>Day<select value={props.scheduleDayId} onChange={(event) => props.onChangeDay(event.target.value)}>{props.menuDays.map((day) => <option key={day.id} value={day.id}>{formatServiceDate(day.date)}</option>)}</select></label><label>Meal<select value={props.scheduleMealId} onChange={(event) => props.onChangeMeal(event.target.value)}><option value="">No meal</option>{props.state.meals.map((meal) => <option key={meal.id} value={meal.id}>{meal.name}</option>)}</select></label><label>Price (NZD)<input type="number" min="0" step="0.5" value={props.schedulePrice} onChange={(event) => props.onChangePrice(event.target.value)} /></label><div className="save-day"><span>{selectedDay && Number(props.schedulePrice) === 0 ? "Shows as FREE" : "Defaults to $5.00"}</span><Button type="button" onClick={props.onSaveSchedule}>Save this day</Button></div></div></section>
    <section className="section-heading section-heading--tight"><div><p className="eyebrow">Meal library</p><h2>Meals ready to use</h2></div><span>{props.state.meals.length} meals</span></section><div className="meal-library">{props.state.meals.map((meal) => <article className="library-item" key={meal.id}><div className="library-item__icon"><CookingPot size={20} /></div><div><h3>{meal.name}</h3><p>{meal.description}</p><span>{dietarySummary(meal)}</span></div><button type="button" onClick={() => props.onStartMealEdit(meal)}><PencilLine size={16} /> Edit</button></article>)}</div>
  </div><aside className="meal-form-card"><div className="card-title"><div className="accent-rule" /><div><p className="eyebrow">{props.editingMealId ? "Update meal" : "New meal"}</p><h2>{props.editingMealId ? "Change the details" : "Add a meal"}</h2></div></div><form onSubmit={props.onSaveMeal}><label>Meal name<input value={props.mealName} onChange={(event) => props.onMealName(event.target.value)} placeholder="e.g. Lentil shepherd’s pie" /></label><label>Description<textarea value={props.mealDescription} onChange={(event) => props.onMealDescription(event.target.value)} placeholder="A short, useful description for the weekly email." rows={4} /></label><fieldset><legend>Dietary options</legend><p>Say what the meal meets as standard, can cover with a request, or cannot offer.</p>{dietaryDefinitions.map((item) => <label className="dietary-select" key={item.key}><span>{item.label}</span><select value={props.dietaryStates[item.key]} onChange={(event) => props.onDietaryState(item.key, event.target.value as DietaryState)}><option value="default">Meets by default</option><option value="request">Available on request</option><option value="not-possible">Not possible</option></select></label>)}</fieldset><div className="form-actions"><Button type="button" variant="outline" onClick={props.onClearMealForm}>Clear</Button><Button type="submit"><Plus size={16} /> {props.editingMealId ? "Save changes" : "Add meal"}</Button></div></form></aside></div>;
}

function ServiceWorkspace(props: { state: KaiPocState; menuDays: KaiPocState["menuDays"]; serviceDayId: string; selectedDay: KaiPocState["menuDays"][number]; onSelectDay: (value: string) => void; onPrint: (id: string) => void; }) {
  const meal = getMeal(props.state, props.selectedDay);
  const bookings = sortedBookingsForDay(props.state, props.selectedDay.id);
  const totals = dietaryTotalsForDay(props.state, props.selectedDay.id);
  return <div className="main-stack"><section className="section-heading"><div><p className="eyebrow">Daily service</p><h2>{formatServiceDate(props.selectedDay.date)}</h2></div><div className="heading-actions"><label className="compact-select"><span>View day</span><select value={props.serviceDayId} onChange={(event) => props.onSelectDay(event.target.value)}>{props.menuDays.map((day) => <option value={day.id} key={day.id}>{formatServiceDate(day.date)}</option>)}</select></label><Button type="button" variant="outline" onClick={() => props.onPrint(props.selectedDay.id)}><Printer size={16} /> Print list</Button></div></section><section className="service-hero"><div><p className="eyebrow">Today’s kai</p><h3>{meal?.name ?? "No kai scheduled"}</h3><p>{meal?.description ?? "Choose a meal from the weekly menu workspace."}</p></div><div className="service-hero__price"><span>Price</span><strong>{formatPrice(props.selectedDay.priceCents)}</strong></div></section><div className="service-stats"><article><span>Booked</span><strong>{bookings.length}</strong><p>kaimahi today</p></article><article><span>Dietary requests</span><strong>{totals.reduce((sum, total) => sum + total.count, 0)}</strong><p>{totals.length ? totals.map((total) => `${total.count} ${total.label.toLowerCase()}`).join(" · ") : "None noted"}</p></article><article><span>Collection</span><strong>Paper sign-off</strong><p>Use the printed sheet</p></article></div><section className="workspace-card bookings-card"><div className="card-title"><div className="accent-rule" /><div><h3>Today’s bookings</h3><p>{bookings.length ? "Names are in alphabetical order for the pickup sheet." : "No one has booked this day yet."}</p></div></div>{bookings.length > 0 && <div className="booking-table"><div className="booking-table__head"><span>Kaimahi</span><span>Dietary request</span><span>Collection</span></div>{bookings.map((booking, index) => <div className="booking-table__row" key={booking.id}><div><span className="row-number">{String(index + 1).padStart(2, "0")}</span><strong>{booking.userName}</strong></div><span>{booking.requestedDietaryOptions.length ? booking.requestedDietaryOptions.map((key) => dietaryDefinitions.find((item) => item.key === key)?.label).join(", ") : "—"}</span><span className="signature-line" /></div>)}</div>}</section></div>;
}

function EmailReviewModal(props: { state: KaiPocState; emailSent: boolean; onClose: () => void; onSend: () => void; }) {
  const days = [...props.state.menuDays].filter((day) => day.mealId && day.published).sort((left, right) => left.date.localeCompare(right.date));
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="email-title"><div className="email-modal"><button type="button" className="modal-close" onClick={props.onClose} aria-label="Close email review"><X size={20} /></button><p className="eyebrow">Final review</p><h2 id="email-title">Send next week’s menu</h2><div className="email-meta"><div><span>To</span><strong>kakarikihouseallstaffmembers@WiseGroup434.onmicrosoft.com</strong></div><div><span>Subject</span><strong>Kākāriki Kai - next week&apos;s menu.</strong></div></div><div className="email-preview"><p>Kia ora kaimahi,</p><p>Here’s what we’re serving next week. Book the days that work for you before 10am on Monday.</p>{days.map((day) => { const meal = getMeal(props.state, day); if (!meal) return null; return <section key={day.id}><p className="email-date">{formatServiceDate(day.date)} · {formatPrice(day.priceCents)}</p><h3>{meal.name}</h3><p>{meal.description}</p><p className="email-dietary">{dietarySummary(meal)}</p></section>; })}<p>Ngā mihi,<br />Kākāriki House</p></div>{props.emailSent ? <div className="email-sent"><Check size={18} /> Marked as sent in the test workspace. No email left this browser.</div> : <div className="modal-actions"><Button type="button" variant="outline" onClick={props.onClose}>Keep reviewing</Button><Button type="button" onClick={props.onSend}><Mail size={16} /> Send menu email</Button></div>}</div></div>;
}

function PrintSheet(props: { state: KaiPocState; menuDay: KaiPocState["menuDays"][number]; onClose: () => void; onPrint: () => void; }) {
  const meal = getMeal(props.state, props.menuDay);
  const bookings = sortedBookingsForDay(props.state, props.menuDay.id);
  return <div className="modal-layer print-layer" role="dialog" aria-modal="true" aria-labelledby="print-title"><div className="print-sheet"><div className="print-toolbar"><Button type="button" variant="outline" onClick={props.onClose}>Back to service</Button><Button type="button" onClick={props.onPrint}><Printer size={16} /> Print A4 sheet</Button></div><div className="print-sheet__header"><div><p className="eyebrow">Kākāriki Kai</p><h2 id="print-title">Pickup sheet</h2><p>{formatServiceDate(props.menuDay.date)}</p></div><div><span>Meal</span><strong>{meal?.name ?? "No meal scheduled"}</strong><span>Price</span><strong>{formatPrice(props.menuDay.priceCents)}</strong></div></div><table><thead><tr><th>#</th><th>Kaimahi</th><th>Dietary request</th><th>Signature on collection</th></tr></thead><tbody>{bookings.length ? bookings.map((booking, index) => <tr key={booking.id}><td>{index + 1}</td><td>{booking.userName}</td><td>{booking.requestedDietaryOptions.length ? booking.requestedDietaryOptions.map((key) => dietaryDefinitions.find((item) => item.key === key)?.label).join(", ") : "—"}</td><td /></tr>) : <tr><td colSpan={4}>No bookings for this day.</td></tr>}</tbody></table><p className="print-sheet__note">Kaimahi sign after collection. Paper sign-off remains the Priority 1 record.</p></div></div>;
}
