
"""
                                        Task 3
count the amount of spaces and punctuation signs

"""

def analyze_text(text):

    """
    Analyzes text for punctuation and space statistics.

    Args:
        text: Input string to analyze

    Returns:
        Dictionary with counts for:
        - spaces
        - commas, periods, exclamations, questions
        - colons, semicolons, parentheses
        - braces, apostrophes, hyphens
        - underscores, slashes
        - total punctuation count

    Example:
        >>> analyze_text("Hello, world!")
        {'spaces': 1, 'commas': 1, ..., 'total': 2}
    """

        
    punctuation = {
            'spaces': text.count(" "),
            'commas': text.count(","),
            'periods': text.count("."),
            'exclamations': text.count("!"),
            'questions': text.count("?"),
            'colons': text.count(":"),
            'semicolons': text.count(";"),
            'parentheses': text.count("(") + text.count(")"),
            'braces': text.count("{") + text.count("}"),
            'apostrophes': text.count("'"),
            'hyphens': text.count("-"),
            'underscores': text.count("_"),
            'slashes': text.count("/")
        }
    punctuation['total'] = sum(punctuation.values()) - punctuation['spaces']
    return punctuation
    
def execute():

    """
    Executes Task 3: Text punctuation analyzer.

    Features:
    - Interactive text input
    - Comprehensive punctuation analysis
    - Clear tabular output
    - Handles empty input
    """
        
    text = input("Enter your text ")
    counts = analyze_text(text)
  
    print("\nPunctuation counts:")
    for key, value in counts.items():
       print(f"{key}: {value}")


