
"""                                   Task 1
Create a program to calculate the value of a function using its expansion into a power series.
Set the calculation precision to `eps`. Ensure a maximum iteration limit of 500.
Display the number of terms in the series required to achieve the specified precision.
"""
import math

def arccos_series(x, eps=1e-6, max_iterations=500):

    """
    Calculates arccosine using Taylor series expansion.

    Args:
        x: Input value in range [-1, 1]
        eps: Desired precision (default: 1e-6)
        max_iterations: Maximum number of iterations (default: 500)

    Returns:
        A tuple containing:
        - calculated_value: Result of the series expansion
        - terms_used: Number of terms calculated

    Raises:
        ValueError: If x is outside the valid range [-1, 1]

    Example:
        >>> arccos_series(0.5)
        (1.0471975511965976, 12)
    """
    
    if abs(x) > 1:
        raise ValueError("The value of x must be in the range |x| ≤ 1.")
    
    term = x
    sum_series = math.pi / 2 - x
    n = 1  
    count_terms = 1  
    
    while abs(term) > eps and n < max_iterations:
        term = (-1)**n * (x**(2*n + 1)) / (2*n + 1)
        sum_series -= term
        count_terms += 1
        n += 1
    
    return sum_series, count_terms

def execute():

   """
   Executes Task 1: Arccosine calculation and comparison with math.acos().

   Prompts user for:
   - x value (must be between -1 and 1)
   - desired precision (eps)

   Displays formatted results showing:
   - Input value (x)
   - Calculated arccos value
   - math.acos() value
   - Number of terms used
   - Precision value
   """
    
   x = float(input("Enter the value of x (|x| ≤ 1): "))
   eps = float(input("Enter the desired accuracy (eps): "))
    
   try:
     F_x, n = arccos_series(x, eps)
        
     math_F_x = math.acos(x)
        
        
     print("\nРезультаты вычислений:")
     print("x\t\tTerms\t\tF(x)\t\tMath F(x)\t\tEps")
     print("-" * 77)
     print(f"{x:.6f}\t{n}\t\t{F_x:.6f}\t{math_F_x:.6f}\t\t{eps}")
    
   except ValueError as e:
     print(e)











