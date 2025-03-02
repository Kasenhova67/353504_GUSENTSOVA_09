from geometric_lib.circle import Circle

def main():
    radius = 5
    circle = Circle(radius)
    area = circle.area()
    circumference = circle.circumference()
    print(f"Circle with radius {radius}")
    print(f"Area: {area}")
    print(f"Circumference: {circumference}")

if __name__ == "__main__":
    main()

