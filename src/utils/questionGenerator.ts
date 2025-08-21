import { QuizQuestion } from "../content/schema";

// База вопросов по всем разделам обществознания
export const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  "person-society": [
    {
      type: "single",
      question: "Что такое антропогенез?",
      options: [
        "Процесс развития человеческого общества",
        "Процесс биологического развития человека",
        "Процесс формирования личности",
        "Процесс социализации",
      ],
      correctAnswer: "Процесс биологического развития человека",
      explanation:
        "Антропогенез — это процесс биологического развития человека от древних предков до современного вида.",
    },
    {
      type: "single",
      question: "Какая наука изучает общество?",
      options: ["Психология", "Социология", "Философия", "Антропология"],
      correctAnswer: "Социология",
      explanation:
        "Социология — это наука об обществе, социальных группах и социальных отношениях.",
    },
    {
      type: "multiple",
      question: "Какие из перечисленных являются социальными институтами?",
      options: ["Семья", "Образование", "Религия", "Государство", "Экономика"],
      correctAnswer: [
        "Семья",
        "Образование",
        "Религия",
        "Государство",
        "Экономика",
      ],
      explanation:
        "Все перечисленные являются социальными институтами — устойчивыми формами организации общественной жизни.",
    },
    {
      type: "flip_card",
      front: "Что такое социальная роль?",
      back: "Социальная роль — это ожидаемое поведение человека, занимающего определенную социальную позицию.",
    },
  ],
  economy: [
    {
      type: "single",
      question: "Что такое спрос?",
      options: [
        "Желание купить товар",
        "Количество товара, которое покупатели готовы купить по определенной цене",
        "Предложение товара на рынке",
        "Цена товара",
      ],
      correctAnswer:
        "Количество товара, которое покупатели готовы купить по определенной цене",
      explanation:
        "Спрос — это количество товара или услуги, которое покупатели готовы приобрести по определенной цене в определенный период времени.",
    },
    {
      type: "single",
      question: "Что такое инфляция?",
      options: [
        "Рост цен на товары и услуги",
        "Падение цен на товары и услуги",
        "Стабильность цен",
        "Изменение курса валют",
      ],
      correctAnswer: "Рост цен на товары и услуги",
      explanation:
        "Инфляция — это устойчивый рост общего уровня цен на товары и услуги в экономике.",
    },
    {
      type: "multiple",
      question: "Какие из перечисленных являются факторами производства?",
      options: [
        "Труд",
        "Земля",
        "Капитал",
        "Предпринимательство",
        "Технологии",
      ],
      correctAnswer: ["Труд", "Земля", "Капитал", "Предпринимательство"],
      explanation:
        "Основные факторы производства: труд, земля, капитал и предпринимательство.",
    },
    {
      type: "flip_card",
      front: "Что такое ВВП?",
      back: "ВВП (валовой внутренний продукт) — это рыночная стоимость всех конечных товаров и услуг, произведенных в стране за год.",
    },
  ],
  "social-relations": [
    {
      type: "single",
      question: "Что такое социальная стратификация?",
      options: [
        "Социальное неравенство",
        "Разделение общества на слои по различным критериям",
        "Социальная мобильность",
        "Социальные конфликты",
      ],
      correctAnswer: "Разделение общества на слои по различным критериям",
      explanation:
        "Социальная стратификация — это разделение общества на социальные слои (страты) по различным критериям: доход, образование, власть, престиж.",
    },
    {
      type: "single",
      question: "Что такое социальная мобильность?",
      options: [
        "Перемещение людей между социальными группами",
        "Социальные конфликты",
        "Социальная структура",
        "Социальные нормы",
      ],
      correctAnswer: "Перемещение людей между социальными группами",
      explanation:
        "Социальная мобильность — это перемещение людей между социальными группами, изменение их социального статуса.",
    },
    {
      type: "multiple",
      question: "Какие из перечисленных являются типами семьи?",
      options: [
        "Нуклеарная",
        "Расширенная",
        "Неполная",
        "Многодетная",
        "Моногамная",
      ],
      correctAnswer: [
        "Нуклеарная",
        "Расширенная",
        "Неполная",
        "Многодетная",
        "Моногамная",
      ],
      explanation:
        "Все перечисленные являются различными типами семьи по разным критериям классификации.",
    },
    {
      type: "flip_card",
      front: "Что такое социальный конфликт?",
      back: "Социальный конфликт — это столкновение интересов различных социальных групп или индивидов.",
    },
  ],
  politics: [
    {
      type: "single",
      question: "Что такое политическая система?",
      options: [
        "Совокупность политических институтов",
        "Совокупность политических институтов, норм и отношений",
        "Только государственные органы",
        "Политические партии",
      ],
      correctAnswer: "Совокупность политических институтов, норм и отношений",
      explanation:
        "Политическая система — это совокупность политических институтов, норм, ценностей и отношений, обеспечивающих политическую жизнь общества.",
    },
    {
      type: "single",
      question: "Что такое демократия?",
      options: [
        "Власть народа",
        "Власть одного человека",
        "Власть группы людей",
        "Отсутствие власти",
      ],
      correctAnswer: "Власть народа",
      explanation:
        "Демократия — это форма правления, при которой власть принадлежит народу и осуществляется через выборные органы.",
    },
    {
      type: "multiple",
      question: "Какие из перечисленных являются функциями государства?",
      options: [
        "Обеспечение безопасности",
        "Управление экономикой",
        "Социальная защита",
        "Культурное развитие",
        "Международное сотрудничество",
      ],
      correctAnswer: [
        "Обеспечение безопасности",
        "Управление экономикой",
        "Социальная защита",
        "Культурное развитие",
        "Международное сотрудничество",
      ],
      explanation:
        "Все перечисленные являются основными функциями современного государства.",
    },
    {
      type: "flip_card",
      front: "Что такое гражданское общество?",
      back: "Гражданское общество — это совокупность негосударственных организаций и объединений, выражающих интересы различных групп населения.",
    },
  ],
  law: [
    {
      type: "single",
      question: "Что такое право?",
      options: [
        "Система общеобязательных норм",
        "Моральные нормы",
        "Религиозные нормы",
        "Обычаи",
      ],
      correctAnswer: "Система общеобязательных норм",
      explanation:
        "Право — это система общеобязательных норм, установленных государством и охраняемых его принудительной силой.",
    },
    {
      type: "single",
      question: "Что такое правонарушение?",
      options: [
        "Любое нарушение норм",
        "Общественно опасное, противоправное, виновное деяние",
        "Моральный проступок",
        "Неосторожное действие",
      ],
      correctAnswer: "Общественно опасное, противоправное, виновное деяние",
      explanation:
        "Правонарушение — это общественно опасное, противоправное, виновное деяние, за которое предусмотрена юридическая ответственность.",
    },
    {
      type: "multiple",
      question: "Какие из перечисленных являются отраслями права?",
      options: [
        "Конституционное",
        "Гражданское",
        "Уголовное",
        "Трудовое",
        "Административное",
      ],
      correctAnswer: [
        "Конституционное",
        "Гражданское",
        "Уголовное",
        "Трудовое",
        "Административное",
      ],
      explanation:
        "Все перечисленные являются основными отраслями российского права.",
    },
    {
      type: "flip_card",
      front: "Что такое Конституция?",
      back: "Конституция — это основной закон государства, определяющий его устройство, права и свободы граждан.",
    },
  ],
  "spiritual-culture": [
    {
      type: "single",
      question: "Что такое культура?",
      options: [
        "Совокупность материальных и духовных ценностей",
        "Только искусство",
        "Только наука",
        "Только религия",
      ],
      correctAnswer: "Совокупность материальных и духовных ценностей",
      explanation:
        "Культура — это совокупность материальных и духовных ценностей, созданных человечеством в процессе исторического развития.",
    },
    {
      type: "single",
      question: "Что такое мораль?",
      options: [
        "Система нравственных норм",
        "Правовые нормы",
        "Религиозные нормы",
        "Политические нормы",
      ],
      correctAnswer: "Система нравственных норм",
      explanation:
        "Мораль — это система нравственных норм, регулирующих поведение людей на основе представлений о добре и зле.",
    },
    {
      type: "multiple",
      question: "Какие из перечисленных являются формами культуры?",
      options: [
        "Народная",
        "Массовая",
        "Элитарная",
        "Субкультура",
        "Контркультура",
      ],
      correctAnswer: [
        "Народная",
        "Массовая",
        "Элитарная",
        "Субкультура",
        "Контркультура",
      ],
      explanation:
        "Все перечисленные являются различными формами культуры по критериям создания и потребления.",
    },
    {
      type: "flip_card",
      front: "Что такое религия?",
      back: "Религия — это система взглядов, основанная на вере в сверхъестественное и включающая в себя культ и организацию.",
    },
  ],
};

// Генератор случайных вопросов
export function generateRandomQuestions(
  sectionId: string,
  count: number = 10
): QuizQuestion[] {
  const sectionQuestions = QUESTION_BANK[sectionId] || [];
  if (sectionQuestions.length === 0) {
    return [];
  }

  // Перемешиваем вопросы
  const shuffled = [...sectionQuestions].sort(() => Math.random() - 0.5);

  // Возвращаем нужное количество
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Генератор вопросов по сложности
export function generateQuestionsByDifficulty(
  sectionId: string,
  difficulty: "easy" | "medium" | "hard",
  count: number = 10
): QuizQuestion[] {
  const sectionQuestions = QUESTION_BANK[sectionId] || [];

  // Простая логика разделения по сложности (в реальном проекте можно добавить поле difficulty)
  const easyQuestions = sectionQuestions.slice(
    0,
    Math.floor(sectionQuestions.length / 3)
  );
  const mediumQuestions = sectionQuestions.slice(
    Math.floor(sectionQuestions.length / 3),
    Math.floor((2 * sectionQuestions.length) / 3)
  );
  const hardQuestions = sectionQuestions.slice(
    Math.floor((2 * sectionQuestions.length) / 3)
  );

  let selectedQuestions: QuizQuestion[];
  switch (difficulty) {
    case "easy":
      selectedQuestions = easyQuestions;
      break;
    case "medium":
      selectedQuestions = mediumQuestions;
      break;
    case "hard":
      selectedQuestions = hardQuestions;
      break;
    default:
      selectedQuestions = sectionQuestions;
  }

  // Перемешиваем и возвращаем
  const shuffled = [...selectedQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Генератор экзаменационных вопросов (для ОГЭ/ЕГЭ)
export function generateExamQuestions(
  sectionId: string,
  examType: "oge" | "ege"
): QuizQuestion[] {
  const sectionQuestions = QUESTION_BANK[sectionId] || [];

  // Для экзаменов выбираем более сложные вопросы
  const examQuestions = sectionQuestions.filter(
    (q) => q.type === "single" || q.type === "multiple"
  );

  // Перемешиваем и возвращаем 15-20 вопросов для экзамена
  const shuffled = [...examQuestions].sort(() => Math.random() - 0.5);
  const count = examType === "ege" ? 20 : 15;

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Генератор вопросов для повторения
export function generateReviewQuestions(
  sectionIds: string[],
  count: number = 15
): QuizQuestion[] {
  const allQuestions: QuizQuestion[] = [];

  sectionIds.forEach((sectionId) => {
    const sectionQuestions = QUESTION_BANK[sectionId] || [];
    allQuestions.push(...sectionQuestions);
  });

  // Перемешиваем все вопросы
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Статистика по вопросам
export function getQuestionStats(): Record<
  string,
  { total: number; byType: Record<string, number> }
> {
  const stats: Record<
    string,
    { total: number; byType: Record<string, number> }
  > = {};

  Object.entries(QUESTION_BANK).forEach(([sectionId, questions]) => {
    const byType: Record<string, number> = {};

    questions.forEach((question) => {
      byType[question.type] = (byType[question.type] || 0) + 1;
    });

    stats[sectionId] = {
      total: questions.length,
      byType,
    };
  });

  return stats;
}
