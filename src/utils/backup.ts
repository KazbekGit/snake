import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProgress, saveUserProgress } from "./progressStorage";
import { getEvents, clearEvents } from "./analytics";

type BackupPayload = {
  userProgress: any;
  events: any[];
  version: number;
  createdAt: string;
};

export async function serializeUserData(): Promise<string> {
  const userProgress = await getUserProgress();
  const events = await getEvents();
  const payload: BackupPayload = {
    userProgress,
    events,
    version: 1,
    createdAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

export async function applyImportedUserData(jsonString: string): Promise<void> {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid backup");
  const { userProgress, events } = parsed as BackupPayload;
  if (!userProgress || !userProgress.userId)
    throw new Error("Invalid userProgress");
  await saveUserProgress(userProgress);
  // overwrite events
  try {
    await AsyncStorage.setItem(
      "user_events",
      JSON.stringify(Array.isArray(events) ? events : [])
    );
  } catch {
    // ignore
  }
}
