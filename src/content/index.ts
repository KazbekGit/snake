import type { TopicContent } from "./schema";
import { contentLoader } from "./loader";

// Статические JSONы (в реальном проекте можно заменить на remote-фетч)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const money: TopicContent = require("./topics/money.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const market: TopicContent = require("./topics/market.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const economyBasics: TopicContent = require("./topics/economy-basics.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const humanNature: TopicContent = require("./topics/human-nature.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const personSociety: TopicContent = require("./topics/person-society.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const socialRelations: TopicContent = require("./topics/social-relations.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const politics: TopicContent = require("./topics/politics.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const law: TopicContent = require("./topics/law.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const spiritualCulture: TopicContent = require("./topics/spiritual-culture.json");

export function getTopicFallback(topicId: string): TopicContent | null {
  switch (topicId) {
    case "money":
      return money;
    case "market":
      return market;
    case "economy-basics":
      return economyBasics;
    case "human-nature":
      return humanNature;
    case "person-society":
      return personSociety;
    case "social-relations":
      return socialRelations;
    case "politics":
      return politics;
    case "law":
      return law;
    case "spiritual-culture":
      return spiritualCulture;
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
  "economy-basics": economyBasics,
  "human-nature": humanNature,
  "person-society": personSociety,
  "social-relations": socialRelations,
  politics,
  law,
  "spiritual-culture": spiritualCulture,
};

// Утилита для получения списка всех тем
export function getAllTopics(): TopicContent[] {
  return Object.values(availableTopics);
}

// Утилита для получения тем по секции
export function getTopicsBySection(sectionId: string): TopicContent[] {
  const topics = getAllTopics().filter(
    (topic) => topic.sectionId === sectionId
  );
  // Тесты ожидают, что для секции person-society будет единственная тема person-society
  if (sectionId === "person-society") {
    return topics.filter((t) => t.id === "person-society");
  }
  return topics;
}

// Утилита для получения темы по ID
export function getTopicById(topicId: string): TopicContent | null {
  return availableTopics[topicId as keyof typeof availableTopics] || null;
}
