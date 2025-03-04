import math

def circle_area(r):
    return math.pi * r * r

def circle_perimeter(r):
    return 2 * math.pi * r

def square_area(a):
    return a * a

def square_perimeter(a):
    return 4 * a

def main():
    radius = 5
    side = 4
    
    print(f"Circle with radius {radius}")
    print(f"Area: {circle_area(radius)}")
    print(f"Perimeter: {circle_perimeter(radius)}\n")
    
    print(f"Square with side {side}")
    print(f"Area: {square_area(side)}")
    print(f"Perimeter: {square_perimeter(side)}")

if __name__ == "__main__":
    main()
