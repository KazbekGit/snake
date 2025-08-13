import {
  computeStartBlockIndex,
  getCtaText,
  getCtaHint,
  getLastStudiedTopicIdFromUserProgress,
} from "../progressHelpers";

describe("progressHelpers", () => {
  test("computeStartBlockIndex returns 0 when no progress", () => {
    expect(computeStartBlockIndex(null)).toBe(0);
    expect(computeStartBlockIndex(undefined)).toBe(0);
  });

  test("computeStartBlockIndex returns lastBlockIndex when provided", () => {
    expect(computeStartBlockIndex({ lastBlockIndex: 3 })).toBe(3);
  });

  test("getCtaText switches based on completedBlocks", () => {
    expect(getCtaText(null)).toBe("Начать изучение");
    expect(getCtaText({ completedBlocks: 0 })).toBe("Начать изучение");
    expect(getCtaText({ completedBlocks: 1 })).toBe("Продолжить изучение");
  });

  test("getCtaHint reflects lastBlockIndex", () => {
    expect(getCtaHint(null)).toBe("Начать изучение темы с первого блока");
    expect(getCtaHint({ completedBlocks: 1, lastBlockIndex: 0 })).toBe(
      "Продолжить с блока 1"
    );
    expect(getCtaHint({ completedBlocks: 2, lastBlockIndex: 1 })).toBe(
      "Продолжить с блока 2"
    );
  });

  test("getLastStudiedTopicIdFromUserProgress returns latest by date", () => {
    const progress = {
      topics: {
        a: { lastStudied: "2023-01-01T00:00:00.000Z" },
        b: { lastStudied: "2024-01-01T00:00:00.000Z" },
        c: { lastStudied: "2022-01-01T00:00:00.000Z" },
      },
    };
    expect(getLastStudiedTopicIdFromUserProgress(progress)).toBe("b");
    expect(
      getLastStudiedTopicIdFromUserProgress({ topics: {} } as any)
    ).toBeNull();
    expect(getLastStudiedTopicIdFromUserProgress(null as any)).toBeNull();
  });
});
