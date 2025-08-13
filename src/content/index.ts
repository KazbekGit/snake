import type { TopicContent } from "./schema";

// Статические JSONы (в реальном проекте можно заменить на remote-фетч)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const money: TopicContent = require("./topics/money.json");

export function getTopicFallback(topicId: string): TopicContent | null {
  switch (topicId) {
    case "money":
      return money;
    default:
      return null;
  }
}
