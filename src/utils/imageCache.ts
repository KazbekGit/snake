import * as FileSystem from "expo-file-system";

const CACHE_DIR = FileSystem.cacheDirectory + "img-cache/";

async function ensureDir() {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists)
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  } catch {}
}

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return String(Math.abs(h));
}

export async function getCachedUri(remoteUrl: string): Promise<string> {
  await ensureDir();
  const key = hash(remoteUrl);
  const target = CACHE_DIR + key;
  const info = await FileSystem.getInfoAsync(target);
  if (info.exists && info.size && info.size > 0) return target;
  try {
    await FileSystem.downloadAsync(remoteUrl, target);
    return target;
  } catch {
    return remoteUrl; // fallback
  }
}
