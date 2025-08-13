import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCachedUri } from "../utils/imageCache";
import type { TopicContent } from "./schema";

const TOPIC_PREFIX = "topic_cache_";

export async function getCachedTopic(
  topicId: string
): Promise<TopicContent | null> {
  try {
    const raw = await AsyncStorage.getItem(TOPIC_PREFIX + topicId);
    return raw ? (JSON.parse(raw) as TopicContent) : null;
  } catch {
    return null;
  }
}

export async function setCachedTopic(topic: TopicContent): Promise<void> {
  try {
    await AsyncStorage.setItem(TOPIC_PREFIX + topic.id, JSON.stringify(topic));
  } catch {}
}

export async function prefetchTopicAssets(topic: TopicContent): Promise<void> {
  const urls: string[] = [];
  if (topic.coverImage) urls.push(topic.coverImage);
  for (const b of topic.contentBlocks || []) {
    if (b.media?.url) urls.push(b.media.url);
  }
  await Promise.all(urls.map((u) => getCachedUri(u).catch(() => u)));
}

export async function getTopicWithCache(
  topicId: string,
  fallback: TopicContent
): Promise<TopicContent> {
  const cached = await getCachedTopic(topicId);
  const topic = cached || fallback;
  prefetchTopicAssets(topic).catch(() => {});
  if (!cached) setCachedTopic(topic).catch(() => {});
  return topic;
}
