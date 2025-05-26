"""
Lab Work №3( Standart types of data, collections, functions, modules)
done by Ekaterina Gusentsova 
Date: 24.03.2025
"""
from lab3.task1 import execute as task1
from lab3.task2 import execute as task2
from lab3.task3 import execute as task3
from lab3.task4 import execute as task4
from lab3.task5 import execute as task5
"""from initializers import initialize_sequence"""

def main_loop():

    """
    Main program execution loop.

    Provides interactive menu for:
    - Selecting between 5 tasks
    - Clean program exit
    - Input validation

    Menu Options:
    1. Arccosine calculation
    2. Even numbers average
    3. Text punctuation analysis
    4. Advanced text statistics
    5. List processing
    6. Exit program
    """
    
    while True:
        print("\nChoose a task to perform:")
        print("1: calculate the value of a function")
        print("2: arithmetic mean of even numbers")
        print("3: string analysis(count the amount of spaces and punctuation signs in your text)")
        print("4: text analysis.")
        print("5: work with the list(the product of negative elements,the sum of positive elements,that are located before the max_element)")
        print("6: exit")

        choice = input("Enter your choice (1-6): ").strip()

        if choice == "1":
            task1()
        elif choice == "2":
            task2()
        elif choice == "3":
            task3()
        elif choice == "4":
            task4()
        elif choice == "5":
            task5()
        elif choice == "6":
            print("Goodbye!")
            break
        else:
            print("Invalid choice, please try again.")
   
main_loop()
