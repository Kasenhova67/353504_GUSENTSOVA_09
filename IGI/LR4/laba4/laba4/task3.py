"""
task 3: Mathematical Calculations and Plots
Developer: Gusentsova Ekaterina
Date: 2023-04-30
Description: This program calculates arccos using series expansion and plots results.
"""

import math
import matplotlib.pyplot as plt
from typing import List, Tuple
from abc import ABC, abstractmethod

class SeriesCalculator(ABC):
    """Abstract base class for series calculations"""
    @abstractmethod
    def calculate(self, x: float, eps: float) -> Tuple[float, int]:
        pass

class ArccosCalculator(SeriesCalculator):
    """Class for arccos calculation using series expansion"""
    def calculate(self, x: float, eps: float = 1e-6) -> Tuple[float, int]:
        """
        Calculate arccos(x) using series expansion
        Returns tuple of (result, terms_used)
        """
        if abs(x) > 1:
            raise ValueError("|x| must be <= 1")
        
        # arccos(x) = pi/2 - arcsin(x)
        # arcsin(x) series expansion

        result = 0.0
        term = x
        n = 0
        
        while abs(term) > eps:
            result += term
            n += 1
            term = term * x * x * (2*n - 1) * (2*n - 1) / (2*n * (2*n + 1))
        
        return (math.pi/2 - result, n)

class StatsCalculator:
    """Class for statistical calculations"""
    @staticmethod
    def mean(data: List[float]) -> float:
        return sum(data) / len(data) if data else 0
    
    @staticmethod
    def median(data: List[float]) -> float:
        sorted_data = sorted(data)
        n = len(sorted_data)
        if n % 2 == 1:
            return sorted_data[n//2]
        return (sorted_data[n//2 - 1] + sorted_data[n//2]) / 2
    
    @staticmethod
    def mode(data: List[float]) -> List[float]:
        freq = {}
        for num in data:
            freq[num] = freq.get(num, 0) + 1
        max_count = max(freq.values())
        return [num for num, count in freq.items() if count == max_count]
    
    @staticmethod
    def variance(data: List[float]) -> float:
        if len(data) < 2:
            return 0
        mean = StatsCalculator.mean(data)
        return sum((x - mean)**2 for x in data) / (len(data) - 1)
    
    @staticmethod
    def std_dev(data: List[float]) -> float:
        return math.sqrt(StatsCalculator.variance(data))

def plot_results(x_values: List[float], series_results: List[float], 
                 math_results: List[float], errors: List[float]):
    """Plot comparison of series and math module results"""
    plt.figure(figsize=(12, 6))
   
    plt.plot(x_values, series_results, 'b-', label='Series arccos(x)')
    plt.plot(x_values, math_results, 'r--', label='Math arccos(x)')
    
    plt.plot(x_values, errors, 'g:', label='Error')
   
    plt.xlabel('x')
    plt.ylabel('arccos(x)')
    plt.title('Comparison of arccos implementations')
    plt.legend()
    plt.grid(True)
  
    max_error = max(errors)
    max_error_x = x_values[errors.index(max_error)]
    plt.annotate(f'Max error: {max_error:.2e}', 
                 xy=(max_error_x, max_error), 
                 xytext=(max_error_x + 0.1, max_error + 0.1),
                 arrowprops=dict(facecolor='black', shrink=0.05))
    
    plt.savefig('arccos_comparison.png')
    print("Plot saved as 'arccos_comparison.png'")
   
    plt.show()

def main():
    """Main program interface"""
    calculator = ArccosCalculator()
    
    # Generate x values from -1 to 1
    x_values = [x/10 for x in range(-10, 11)]
    series_results = []
    math_results = []
    terms_used = []
    errors = []
  
    for x in x_values:
        series, n = calculator.calculate(x)
        math_res = math.acos(x)
        
        series_results.append(series)
        math_results.append(math_res)
        terms_used.append(n)
        errors.append(abs(series - math_res))
   
    print(" x    n  Series    Math      Error")
    print("----------------------------------")
    for i in range(len(x_values)):
        print(f"{x_values[i]:.1f} {terms_used[i]:3} {series_results[i]:.6f} {math_results[i]:.6f} {errors[i]:.2e}")
    
    print("\nError statistics:")
    print(f"Mean: {StatsCalculator.mean(errors):.2e}")
    print(f"Median: {StatsCalculator.median(errors):.2e}")
    print(f"Mode: {StatsCalculator.mode(errors)}")
    print(f"Variance: {StatsCalculator.variance(errors):.2e}")
    print(f"Std Dev: {StatsCalculator.std_dev(errors):.2e}")
    
    plot_results(x_values, series_results, math_results, errors)

if __name__ == "__main__":
    main()