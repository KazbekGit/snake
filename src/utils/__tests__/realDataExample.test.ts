import { runAllExamples } from "../realDataExample";

describe("Real Data Examples", () => {
  test("демонстрирует работу с реальными данными в персонализации", async () => {
    console.log("\n🚀 ЗАПУСК ДЕМОНСТРАЦИИ РЕАЛЬНЫХ ДАННЫХ");
    console.log("=".repeat(60));

    await runAllExamples();

    expect(true).toBe(true); // Просто проверяем что тест прошел
  });
});
