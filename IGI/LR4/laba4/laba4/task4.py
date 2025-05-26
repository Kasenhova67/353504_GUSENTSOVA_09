"""
taak4 4: Geometric Figures
Developer: Gusentsova Ekaterina
Date: 2023-04-30
Description: This program implements classes for geometric figures with color.
"""

from abc import ABC, abstractmethod
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Polygon
import math
from typing import List, Tuple  

class Color:
    """Class representing color of a figure"""
    def __init__(self, color: str):
        self._color = color.lower()
    
    @property
    def color(self) -> str:
        return self._color
    
    @color.setter
    def color(self, value: str):
        self._color = value.lower()

class Shape(ABC):
    """Abstract base class for geometric shapes"""
    name = "Geometric Shape"
    
    @abstractmethod
    def area(self) -> float:
        pass
    
    def get_info(self) -> str:
        return "{name} of color {color} with area {area:.2f}".format(
            name=self.name,
            color=self.color.color,
            area=self.area()
        )

class RegularPolygon(Shape):
    """Class representing a regular polygon"""
    name = "Regular Polygon"
    
    def __init__(self, sides: int, side_length: float, color: str):
        if sides < 3:
            raise ValueError("A polygon must have at least 3 sides")
        if side_length <= 0:
            raise ValueError("Side length must be positive")
        
        self.sides = sides
        self.side_length = side_length
        self.color = Color(color)
    
    def area(self) -> float:
        """Calculate area of regular polygon"""
        return (self.sides * self.side_length**2) / (4 * math.tan(math.pi/self.sides))
    
    def get_vertices(self) -> List[Tuple[float, float]]:
        """Calculate vertices coordinates for drawing"""
        radius = self.side_length / (2 * math.sin(math.pi/self.sides))
        vertices = []
        for i in range(self.sides):
            angle = 2 * math.pi * i / self.sides
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            vertices.append((x, y))
        return vertices
    
    def draw(self, title: str = ""):
        """Draw the polygon using matplotlib"""
        vertices = self.get_vertices()
        fig, ax = plt.subplots()
        polygon = Polygon(vertices, closed=True, 
                         fill=True, color=self.color.color)
        ax.add_patch(polygon)
        
        ax.set_xlim(min(v[0] for v in vertices) - 1, max(v[0] for v in vertices) + 1)
        ax.set_ylim(min(v[1] for v in vertices) - 1, max(v[1] for v in vertices) + 1)
        ax.set_aspect('equal')
        ax.set_title(title if title else self.get_info())
        
        plt.savefig('polygon.png')
        print("Figure saved as 'polygon.png'")
        plt.show()

def input_positive_int(prompt: str) -> int:
    """Helper function for input validation"""
    while True:
        try:
            value = int(input(prompt))
            if value > 0:
                return value
            print("Value must be positive!")
        except ValueError:
            print("Please enter a valid integer!")

def input_positive_float(prompt: str) -> float:
    """Helper function for input validation"""
    while True:
        try:
            value = float(input(prompt))
            if value > 0:
                return value
            print("Value must be positive!")
        except ValueError:
            print("Please enter a valid number!")

def main():
    """Main program interface"""
    print("Regular Polygon Creator")
    print("----------------------")
    
    while True:
        try:
            sides = input_positive_int("Enter number of sides (>=3): ")
            length = input_positive_float("Enter side length: ")
            color = input("Enter color: ")
            
            polygon = RegularPolygon(sides, length, color)
            print("\n" + polygon.get_info())
            
            title = input("Enter title for the plot (optional): ")
            polygon.draw(title)
            
            another = input("\nCreate another polygon? (y/n): ")
            if another.lower() != 'y':
                break
        
        except ValueError as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()