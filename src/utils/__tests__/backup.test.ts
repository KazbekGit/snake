import AsyncStorage from "@react-native-async-storage/async-storage";
import { serializeUserData, applyImportedUserData } from "../backup";
import { getUserProgress, saveUserProgress } from "../progressStorage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("../progressStorage", () => ({
  getUserProgress: jest.fn(async () => ({
    userId: "u1",
    topics: {},
    lastActivity: new Date().toISOString(),
    totalStudyTime: 0,
    completedTopics: [],
    testScores: {},
  })),
  saveUserProgress: jest.fn(async () => {}),
}));

jest.mock("../analytics", () => ({
  getEvents: jest.fn(async () => [
    { id: "e1", type: "start_topic", timestamp: new Date().toISOString() },
  ]),
  clearEvents: jest.fn(async () => {}),
}));

describe("backup", () => {
  it("serializes user data to JSON", async () => {
    const json = await serializeUserData();
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.userProgress.userId).toBe("u1");
    expect(Array.isArray(parsed.events)).toBe(true);
  });

  it("applies imported user data", async () => {
    const payload = {
      version: 1,
      createdAt: new Date().toISOString(),
      userProgress: {
        userId: "u2",
        topics: {},
        lastActivity: new Date().toISOString(),
        totalStudyTime: 0,
        completedTopics: [],
        testScores: {},
      },
      events: [],
    };
    await applyImportedUserData(JSON.stringify(payload));
    expect(saveUserProgress).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});
