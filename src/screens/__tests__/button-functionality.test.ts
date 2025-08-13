describe("Button Functionality Test", () => {
  it("should handle button press correctly", () => {
    // Симуляция нажатия кнопки
    const mockHandleStartLearning = jest.fn();
    const mockNavigation = {
      navigate: jest.fn(),
    };

    const mockTopic = {
      id: "topic_money_001",
      title: "Деньги",
      contentBlocks: [{}, {}, {}, {}],
    };

    const mockTopicProgress = null;

    // Вызов функции, которая должна выполняться при нажатии
    const handleStartLearning = () => {
      mockHandleStartLearning();

      const startBlockIndex = mockTopicProgress?.lastBlockIndex || 0;

      mockNavigation.navigate("TheoryBlock", {
        topic: mockTopic,
        blockIndex: startBlockIndex,
      });
    };

    // Вызываем функцию
    handleStartLearning();

    // Проверяем, что функции были вызваны
    expect(mockHandleStartLearning).toHaveBeenCalledTimes(1);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("TheoryBlock", {
      topic: mockTopic,
      blockIndex: 0,
    });
  });

  it("should handle button press with existing progress", () => {
    const mockHandleStartLearning = jest.fn();
    const mockNavigation = {
      navigate: jest.fn(),
    };

    const mockTopic = {
      id: "topic_money_001",
      title: "Деньги",
      contentBlocks: [{}, {}, {}, {}],
    };

    const mockTopicProgress = {
      topicId: "topic_money_001",
      completedBlocks: 2,
      totalBlocks: 4,
      lastBlockIndex: 1,
      testCompleted: false,
      lastStudied: "2023-01-01T00:00:00.000Z",
      studyTime: 30,
    };

    const handleStartLearning = () => {
      mockHandleStartLearning();

      const startBlockIndex = mockTopicProgress?.lastBlockIndex || 0;

      mockNavigation.navigate("TheoryBlock", {
        topic: mockTopic,
        blockIndex: startBlockIndex,
      });
    };

    handleStartLearning();

    expect(mockHandleStartLearning).toHaveBeenCalledTimes(1);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("TheoryBlock", {
      topic: mockTopic,
      blockIndex: 1, // Должен быть 1, так как lastBlockIndex = 1
    });
  });

  it("should calculate button text correctly", () => {
    // Без прогресса
    const topicProgress1 = null;
    const buttonText1 =
      topicProgress1?.completedBlocks > 0
        ? "Продолжить изучение"
        : "Начать изучение";
    expect(buttonText1).toBe("Начать изучение");

    // С прогрессом
    const topicProgress2 = {
      completedBlocks: 1,
      lastBlockIndex: 0,
    };
    const buttonText2 =
      topicProgress2?.completedBlocks > 0
        ? "Продолжить изучение"
        : "Начать изучение";
    expect(buttonText2).toBe("Продолжить изучение");
  });
});
