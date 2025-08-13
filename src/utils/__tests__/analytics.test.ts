import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  logEvent,
  getEvents,
  clearEvents,
  computeStreakDays,
} from "../analytics";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it("logs events and returns them", async () => {
    // emulate existing empty list
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([])
    );
    await logEvent("start_topic", { topicId: "money" });
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    // emulate stored single event
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        {
          id: "1",
          type: "start_topic",
          timestamp: new Date().toISOString(),
          payload: { topicId: "money" },
        },
      ])
    );
    const events = await getEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe("start_topic");
  });

  it("clears events", async () => {
    await clearEvents();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("computes streak days", () => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const ev = (offsetDays: number) => ({
      id: String(offsetDays),
      type: "x",
      timestamp: new Date(base.getTime() - offsetDays * 86400000).toISOString(),
    });
    expect(computeStreakDays([ev(0), ev(1), ev(3)])).toBe(2);
    expect(computeStreakDays([])).toBe(0);
  });
});
