import { demoRealData, demoMultipleTopics } from "../demoRealData";

describe("Demo Real Data", () => {
  test("демонстрирует работу с реальными данными", async () => {
    console.log("\n🚀 ЗАПУСК ДЕМОНСТРАЦИИ РЕАЛЬНЫХ ДАННЫХ");
    console.log("=".repeat(50));

    await demoRealData();

    console.log("\n📊 ДЕМОНСТРАЦИЯ С НЕСКОЛЬКИМИ ТЕМАМИ");
    console.log("=".repeat(50));

    await demoMultipleTopics();

    expect(true).toBe(true); // Просто проверяем что тест прошел
  });
});

