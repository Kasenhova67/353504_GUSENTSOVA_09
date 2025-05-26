"""
task 5: NumPy Operations
Developer: Gusentsova Ekaterina
Date: 2023-04-30
Description: This program demonstrates NumPy array operations.
"""

import numpy as np

class MatrixProcessor:
    """Class for matrix operations using NumPy"""
    def __init__(self, rows: int, cols: int):
        self.matrix = np.random.randint(1, 100, size=(rows, cols))
        self.rows = rows
        self.cols = cols
    
    def swap_max_elements(self):
        """Swap max elements in first and last columns"""
        first_col = self.matrix[:, 0]
        last_col = self.matrix[:, -1]
        
        max_first = np.argmax(first_col)
        max_last = np.argmax(last_col)
        
        self.matrix[max_first, 0], self.matrix[max_last, -1] = \
            self.matrix[max_last, -1], self.matrix[max_first, 0]
    
    def calculate_correlation(self) -> float:
        """Calculate correlation between first and last columns"""
        corr = np.corrcoef(self.matrix[:, 0], self.matrix[:, -1])[0, 1]
        return round(corr, 2)
    
    def show_stats(self):
        """Display matrix statistics"""
        print("\nMatrix statistics:")
        print(f"Mean: {np.mean(self.matrix):.2f}")
        print(f"Median: {np.median(self.matrix):.2f}")
        print(f"Variance: {np.var(self.matrix):.2f}")
        print(f"Standard deviation: {np.std(self.matrix):.2f}")
    
    def __str__(self):
        return str(self.matrix)

def main():
    """Main program interface"""
    print("NumPy Matrix Processor")
    print("---------------------")
    
    while True:
        try:
            rows = int(input("Enter number of rows: "))
            cols = int(input("Enter number of columns: "))
            
            if rows < 1 or cols < 1:
                print("Dimensions must be positive!")
                continue
            
            processor = MatrixProcessor(rows, cols)
            
            print("\nOriginal matrix:")
            print(processor)
            
            processor.swap_max_elements()
            print("\nAfter swapping max elements:")
            print(processor)
            
            corr = processor.calculate_correlation()
            print(f"\nCorrelation between first and last columns: {corr}")
            
            processor.show_stats()
            
            another = input("\nProcess another matrix? (y/n): ")
            if another.lower() != 'y':
                break
        
        except ValueError:
            print("Please enter valid integers!")

if __name__ == "__main__":
    main()