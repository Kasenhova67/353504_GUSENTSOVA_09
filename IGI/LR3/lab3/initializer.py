"""
Module for sequence initialization methods.
Provides different ways to initialize number sequences.
"""
from typing import Generator
import random
from typing import List, Callable

def manual_input(prompt: str = "Enter numbers separated by spaces: ") -> List[float]:
    """
    Initialize sequence by manual user input.
    
    Args:
        prompt: Input prompt message
        
    Returns:
        List of entered numbers
        
    Raises:
        ValueError: If input cannot be converted to numbers
    """
    while True:
        try:
            user_input = input(prompt)
            return [float(num) for num in user_input.split()]
        except ValueError:
            print("Error: Please enter valid numbers separated by spaces.")

def random_generator(size: int = 10, min_val: float = -10.0, max_val: float = 10.0) -> Generator[float, None, None]:
    """
    Generate random numbers one at a time using a generator.
    
    Args:
        size: Number of elements to generate
        min_val: Minimum possible value
        max_val: Maximum possible value
        
    Yields:
        Random float numbers one by one
    """
    for _ in range(size):
        yield random.uniform(min_val, max_val)

def initialize_sequence(method: str = "manual", **kwargs) -> List[float]:
    """
    Initialize sequence using specified method.
    
    Args:
        method: Initialization method name
               Possible values: "manual", "random"
        **kwargs: Arguments for the initialization method
        
    Returns:
        List of initialized numbers
        
    Raises:
        ValueError: If unknown method specified
    """
    methods = {
        "manual": manual_input,
        "random": random_generator
    }
    
    if method not in methods:
        raise ValueError(f"Unknown initialization method: {method}")
    
    return methods[method](**kwargs)
