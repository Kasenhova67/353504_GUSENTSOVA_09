"""

                                        Task 2
Organize a loop that accepts integers and calculates the arithmetic mean of even numbers.
The loop should terminate upon entering 0.

"""

def log_execution(func):
    """
    Decorator that logs the execution of the function
    """
    def wrapper(*args, **kwargs):
        print("Function is starting...")
        result = func(*args, **kwargs)
        print("Function has finished.")
        return result
    return wrapper

@log_execution
def execute():

  """
  Executes Task 2: Arithmetic mean of even numbers calculator.

  Continuously accepts integers until 0 is entered, then calculates:
  - Arithmetic mean of all even numbers entered
  - Handles empty input case

  Features:
  - Input validation for integers
  - Proper handling of negative numbers
  - Clear result formatting
  """
    
  s = 0
  n = 0

  while True:
        try:
            a = int(input("Enter the number (to get the result, enter 0): "))
            if a == 0:
                print("The amount of elements must be positive")
                continue
            break
        except ValueError:
            print("Invalid input, please enter an integer")
  while a!=0:
   
    if a % 2 == 0:
        n += 1
        s += a
    a = int(input("Enter the number (to get the result, enter 0): "))

  if n == 0:
    print("No even numbers were entered.")
  else:
    result = s / n
    print(f"The result is: {result}")


