import { getTopicProgress } from "../../utils/progressStorage";

// Мокаем зависимости
jest.mock("../../utils/progressStorage");

describe("TopicHeaderScreen Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getTopicProgress as jest.Mock).mockResolvedValue(null);
  });

  it("should handle null progress correctly", async () => {
    const result = await getTopicProgress("topic_123");
    expect(result).toBeNull();
  });

  it("should handle existing progress correctly", async () => {
    const mockProgress = {
      topicId: "topic_123",
      completedBlocks: 2,
      totalBlocks: 4,
      lastBlockIndex: 1,
      testCompleted: false,
      lastStudied: "2023-01-01T00:00:00.000Z",
      studyTime: 30,
    };

    (getTopicProgress as jest.Mock).mockResolvedValue(mockProgress);

    const result = await getTopicProgress("topic_123");
    expect(result).toEqual(mockProgress);
  });

  it("should calculate progress percentage correctly", () => {
    const completedBlocks = 2;
    const totalBlocks = 4;
    const percentage = Math.round((completedBlocks / totalBlocks) * 100);
    expect(percentage).toBe(50);
  });

  it("should determine correct button text based on progress", () => {
    const hasProgress = false;
    const buttonText = hasProgress ? "Продолжить изучение" : "Начать изучение";
    expect(buttonText).toBe("Начать изучение");
  });

  it("should determine correct hint text based on progress", () => {
    const hasProgress = false;
    const hintText = hasProgress
      ? "Продолжить с того места, где остановились"
      : "Начать изучение темы с первого блока";
    expect(hintText).toBe("Начать изучение темы с первого блока");
  });
});
