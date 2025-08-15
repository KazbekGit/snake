import type { TopicContent } from "./schema";
import { contentLoader } from "./loader";

// Статические JSONы (в реальном проекте можно заменить на remote-фетч)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const money: TopicContent = require("./topics/money.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const market: TopicContent = require("./topics/market.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const humanNature: TopicContent = require("./topics/human-nature.json");

export function getTopicFallback(topicId: string): TopicContent | null {
  switch (topicId) {
    case "money":
      return money;
    case "market":
      return market;
    case "human-nature":
      return humanNature;
    default:
      return null;
  }
}

// Экспорт единого лоадера
export { contentLoader } from "./loader";

// Экспорт всех доступных тем
export const availableTopics = {
  money,
  market,
  "human-nature": humanNature,
};

// Утилита для получения списка всех тем
export function getAllTopics(): TopicContent[] {
  return Object.values(availableTopics);
}

// Утилита для получения тем по секции
export function getTopicsBySection(sectionId: string): TopicContent[] {
  return getAllTopics().filter(topic => topic.sectionId === sectionId);
}

// Утилита для получения темы по ID
export function getTopicById(topicId: string): TopicContent | null {
  return availableTopics[topicId as keyof typeof availableTopics] || null;
}
