"""
Main Menu for Laboratory Works 1-6

Description: This program provides a menu to access all laboratory works.
"""

import os
import importlib
from typing import Callable

def clear_screen():
    """Clear console screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def show_menu():
    """Display main menu"""
    print("\nMAIN MENU")
    print("---------")
    print("1. task 1: Data Serialization and Processing")
    print("2. task 2: Text Analysis")
    print("3. task 3: Mathematical Calculations and Plots")
    print("4. task 4: Geometric Figures")
    print("5. task 5: NumPy Operations")
    print("0. Exit")
    print("---------")

def get_choice() -> int:
    """Get user choice with validation"""
    while True:
        try:
            choice = int(input("Enter your choice (0-5): "))
            if 0 <= choice <= 6:
                return choice
            print("Please enter a number between 0 and 5!")
        except ValueError:
            print("Please enter a valid number!")

def run_task(task_module: str, task_function: str = 'main'):
    """Run selected laboratory work"""
    try:
        clear_screen()
        print(f"\nRunning {task_module}...\n")
       
        module = importlib.import_module(task_module)
        func = getattr(module, task_function)
        func()
        
        input("\nPress Enter to return to main menu...")
    except ImportError:
        print(f"Error: Could not find module {task_module}")
        input("Press Enter to continue...")
    except AttributeError:
        print(f"Error: Could not find function {task_function} in module {task_module}")
        input("Press Enter to continue...")

def main():
    """Main program loop"""
   
    tasks = {
        1: ('task1', 'main'),
        2: ('task2', 'main'),
        3: ('task3', 'main'),
        4: ('task4', 'main'),
        5: ('task5', 'main'),
           }
    
    while True:
        clear_screen()
        show_menu()
        choice = get_choice()
        
        if choice == 0:
            print("\nGoodbye!")
            break
        
        task_module, task_function = tasks[choice]
        run_task(task_module, task_function)

if __name__ == "__main__":
  
    required_files = [
        'task1.py',
        'task2.py',
        'task3.py',
        'task4.py',
        'task5.py',
      
    ]
    
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print("Warning: The following task files are missing:")
        for f in missing_files:
            print(f"- {f}")
        print("\nPlease ensure all task files are in the same directory.")
        input("Press Enter to continue anyway (some options won't work)...")
    
    main()
