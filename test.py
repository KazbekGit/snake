# 🧱 Требования:
# Есть класс Logger, у него есть метод log(message)

# Нужно реализовать хотя бы два способа логирования:

# ConsoleLogger — печатает в консоль

# FileLogger — сохраняет в файл

# Должно быть возможно добавлять новые логгеры, не меняя существующий код

# 📦 Пример использования:
# python
# Копировать
# Редактировать
# logger = ConsoleLogger()
# logger.log("Начинаем процесс...")

# logger = FileLogger("log.txt")
# logger.log("Сохраняем результат в файл.")

from abc import ABC, abstractmethod


class LoggerType(ABC):
    @abstractmethod
    def log(self, message, level) -> None:
        pass


class Logger:
    def __init__(self, logger:LoggerType):
        self.logger = logger

    def log(self, message: str, level: str) -> None:
        self.logger.log(message, level)


class ConsoleLogger(LoggerType):
    def __init__(self):
        pass

    def log(self, message, level):
        print(f"{message} to Console")


class FileLogger(LoggerType):
    def __init__(self):
        pass

    def log(self, message, level):
        with open("text.txt", mode="w", encoding="utf-8") as f:
            f.write(message)


cns_logger = ConsoleLogger()
file_logger = FileLogger()

user_logger1 = Logger(cns_logger)
user_logger2 = Logger(file_logger)

user_logger1.log("Это сообщение выведет консоль")
user_logger2.log("А это сообщение мы запишем в файл")
