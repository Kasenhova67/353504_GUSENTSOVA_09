"""
                                        Task 5
Find the product of negative elements in a list,
the sum of positive elements in the list that are located before the maximum element.

"""
from typing import List  
from initializer import random_generator
from initializer import initialize_sequence

def input_list() -> List[float]:
    """
    Collects user input to create a list of numbers with choice of initialization method.
    
    Returns:
        List of float values
        
    Features:
    - Lets user choose input method
    - Validates all inputs
    - Handles errors gracefully
    """
    print("\nChoose initialization method:")
    print("1 - Manual input")
    print("2 - Random generation")
    
    while True:
        try:
            choice = input("Your choice (1-2): ").strip()
            if choice == "1":
                return   input_list()
            
            elif choice == "2":
                  while True:
                       try:
                         size = int(input("Enter size of list: "))
                         if size <= 0:
                           print("Size must be positive.")
                           continue
                         min_val = float(input("Enter minimum value: "))
                         max_val = float(input("Enter maximum value: "))
            
                         gen = random_generator(size, min_val, max_val)
                         return list(gen) 
                       except ValueError:
                         print("Invalid input. Please enter valid numbers.")

            else:
                print("Invalid choice. Please enter 1 or 2.")
        except Exception as e:
            print(f"An error occurred: {e}")


def input_list():
    '''
    
    Collects user input to create a list of numbers.

    Returns:
        List of float values entered by user

    Features:
    - Validates number of elements (positive integer)
    - Validates each element as float
    - Clear input prompts
    '''
    
    while True:
        try:
            n = int(input("Enter the amount of elements: "))
            if n < 0:
                print("The amount of elements must be positive")
                continue
            break
        except ValueError:
            print("Invalid input, please enter an integer")
    
    my_list = []
    for i in range(n):
        while True:
            try:
                element = float(input(f"Enter the element № {i + 1}: "))
                my_list.append(element)
                break
            except ValueError:
                print("Invalid input, please enter a float number")
    
    return my_list



def calculate(my_list):


    """
    Processes list to find specific values.

    Args:
        numbers: List of float values

    Returns:
        A tuple containing:
        - product_negatives: Product of negative numbers before max
        - sum_positives: Sum of positive numbers before max
        - max_value: Maximum value in list
        - max_index: Index of maximum value

    Note:
        Returns (0, 0, None, None) for empty lists
    """

    s_pos = 0
    p_neg = 1
    max_element = max(my_list)
    max_index = my_list.index(max_element)

    for i in range(max_index):
        if my_list[i] < 0:
           p_neg *= my_list[i]
        if my_list[i] > 0:
           s_pos += my_list[i]
    return s_pos, p_neg, max_element, max_index
    
def execute():

  """
  Executes Task 5: List processing operations.

  Features:
  - Interactive list creation
  - Calculates:
        * Product of negatives before max element
        * Sum of positives before max element
  - Displays:
        * Original list
        * Max value and its index
        * Calculated results
  """
    
  my_list = input_list()
  if my_list is None:
     return
    
  s_pos, p_neg, max_element, max_index = calculate(my_list)
  print("Your list:", my_list)
  print(f"Максимальный элемент: {max_element}")
  print(f"Его индекс: {max_index}")
  print(f"the product is {p_neg}")
  print(f"the sum is {s_pos}")
