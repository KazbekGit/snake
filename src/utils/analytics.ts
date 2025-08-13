import AsyncStorage from "@react-native-async-storage/async-storage";

const EVENTS_KEY = "user_events";

export interface AnalyticsEvent<T = any> {
  id: string;
  type: string;
  timestamp: string;
  payload?: T;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function logEvent<T = any>(
  type: string,
  payload?: T
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push({
      id: generateId(),
      type,
      timestamp: new Date().toISOString(),
      payload,
    });
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    // best-effort: не ломаем UX
    console.warn("logEvent error", e);
  }
}

export async function getEvents(limit?: number): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    if (typeof limit === "number") {
      return events.slice(-limit);
    }
    return events;
  } catch (e) {
    return [];
  }
}

export async function clearEvents(): Promise<void> {
  try {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify([]));
  } catch (e) {
    // ignore
  }
}

// Возвращает количество подряд идущих дней (включая сегодня),
// в которые были события (любые)
export function computeStreakDays(events: AnalyticsEvent[]): number {
  if (!Array.isArray(events) || events.length === 0) return 0;
  const byDay = new Set<string>();
  for (const e of events) {
    const d = new Date(e.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    byDay.add(key);
  }
  let streak = 0;
  const today = new Date();
  // normalize to midnight
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 3650; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (byDay.has(key)) streak += 1;
    else break;
  }
  return streak;
}

export async function getStreakDays(): Promise<number> {
  const all = await getEvents();
  return computeStreakDays(all);
}
