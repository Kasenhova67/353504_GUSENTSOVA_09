"""
task 1: Data Serialization and Processing
Developer: Gusentsova Ekaterina
Date: 2023-04-30
Description: This program processes personal data stored in files using CSV and pickle formats.
"""
import csv
import pickle
from typing import List
from abc import ABC, abstractmethod


class Person(ABC):
    """Абстрактный класс для хранения данных о человеке"""
    def __init__(self, surname: str, gender: str, height: float):
        self.surname = surname
        self.gender = gender
        self.height = height

    @abstractmethod
    def get_info(self) -> str:
        pass

    def __str__(self):
        return f"{self.surname} ({self.gender}, {self.height} см)"

class Candidate(Person):
    """Класс для хранения информации о кандидате"""
    instance_count = 0 
    def __init__(self, surname: str, gender: str, height: float):
        super().__init__(surname, gender, height)
        Candidate.instance_count += 1  

    @property
    def info(self) -> str:
        """Геттер для получения информации"""
        return f"Фамилия: {self.surname}, Пол: {self.gender}, Рост: {self.height} см"

    @info.setter
    def info(self, value: str):
        """Сеттер для обновления данных"""
        parts = value.split(", ")
        self.surname, self.gender, self.height = parts[0], parts[1], float(parts[2])

    def get_info(self) -> str:
        return f"{self.surname} ({self.gender}) - {self.height} см"


class FileManager:
    """Класс для работы с CSV и Pickle"""

    @staticmethod
    def save_to_csv(filename: str, data: List[Candidate]):
        """Сохраняет данные в CSV"""
        with open(filename, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(["Фамилия", "Пол", "Рост"])
            for person in data:
                writer.writerow([person.surname, person.gender, person.height])

    @staticmethod
    def load_from_csv(filename: str) -> List[Candidate]:
        """Загружает данные из CSV"""
        people = []
        try:
            with open(filename, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    people.append(Candidate(row["Фамилия"], row["Пол"], float(row["Рост"])))
        except FileNotFoundError:
            print("Файл не найден!")
        return people

    @staticmethod
    def save_to_pickle(filename: str, data: List[Candidate]):
        """Сохраняет данные в pickle"""
        with open(filename, 'wb') as file:
            pickle.dump(data, file)

    @staticmethod
    def load_from_pickle(filename: str) -> List[Candidate]:
        """Загружает данные из pickle"""
        try:
            with open(filename, 'rb') as file:
                return pickle.load(file)
        except FileNotFoundError:
            print("Файл не найден!")
            return []

def validate_positive_float(prompt: str) -> float:
    """Запрашивает положительное число у пользователя"""
    while True:
        try:
            value = float(input(prompt))
            if value > 0:
                return value
            print("Ошибка: Число должно быть положительным!")
        except ValueError:
            print("Ошибка: Введите число!")

def find_highest_man(people: List[Candidate]) -> str:
    """Находит самого высокого мужчину"""
    men = [p for p in people if p.gender.lower() == "male"]
    return max(men, key=lambda p: p.height).surname if men else "Нет мужчин"

def calculate_women_avg_height(people: List[Candidate]) -> float:
    """Считает средний рост женщин"""
    women = [p.height for p in people if p.gender.lower() == "female"]
    return sum(women) / len(women) if women else 0

def check_duplicate_heights(people: List[Candidate]) -> bool:
    """Определяет, есть ли повторяющиеся значения роста"""
    heights = [p.height for p in people]
    return len(heights) > len(set(heights))
def choose_file_format():
    """Запрашивает формат файла"""
    while True:
        choice = input("Выберите формат файла для работы (CSV/Pickle): ").strip().lower()
        if choice in ["csv", "pickle"]:
            return choice
        print("Ошибка: Введите 'CSV' или 'Pickle'.")


def main():
    """Главный цикл программы"""
    file_format = choose_file_format()
    
    filename_csv = "data.csv"
    filename_pickle = "data.pkl"
    
    if file_format == "csv":
        people = FileManager.load_from_csv(filename_csv)
    else:
        people = FileManager.load_from_pickle(filename_pickle)

    while True:
        print("\n==== Меню ====")
        print("1 - Добавить человека")
        print("2 - Показать статистику")
        print("3 - Найти человека по фамилии")
        print("4 - Сохранить и выйти")

        choice = input("Выберите действие: ")

        if choice == "1":
            surname = input("Введите фамилию: ")
            gender = input("Введите пол (Male/Female): ")
            height = validate_positive_float("Введите рост: ")
            people.append(Candidate(surname, gender, height))

        elif choice == "2":
            print(f"Средний рост женщин: {calculate_women_avg_height(people):.2f} см")
            print(f"Самый высокий мужчина: {find_highest_man(people)}")
            print(f"Есть ли повторяющийся рост? {'Да' if check_duplicate_heights(people) else 'Нет'}")

        elif choice == "3":
            surname = input("Введите фамилию: ")
            found = [p for p in people if p.surname.lower() == surname.lower()]
            if found:
             for candidate in found:
               print(f"Фамилия: {candidate.surname}, Пол: {candidate.gender}, Рост: {candidate.height} см")
            else:
               print("Человек не найден")
 
        elif choice == "4":
            FileManager.save_to_csv(filename_csv, people)
            FileManager.save_to_pickle(filename_pickle, people)
            print("Данные сохранены!")
            break

if __name__ == "__main__":
    main()
