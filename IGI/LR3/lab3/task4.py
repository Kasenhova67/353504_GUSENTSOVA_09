"""
                                        Task 4
analyse the text : «So she was considering in her own mind, as well as she could, for the hot day made her feel very sleepy and stupid, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.» 
a) find the amount of words that start/end with a/e/u/i/y/o
b) count how many times each symbol appears in the text
c) display in alphabetical order the words that follow a comma.

"""
    
text = "So she was considering in her own mind, as well as she could, for the hot day made her feel very sleepy and stupid, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her."

def count_vowel_words(text):

    """
    Counts words starting/ending with vowels (a,e,i,o,u,y).

    Args:
        text: Input string to analyze

    Returns:
        Count of words that start or end with vowels

    Note:
        Case-insensitive matching
    """
    
    letters = "aeuiyoAEIUYO"
    words = text.split()  
    n_start = 0
    n_end = 0
    both = 0
     
    for word in words:
         if word[0] in letters:
             n_start += 1
         if word[-1] in letters:
             n_end += 1
         if word[0] in letters and word[-1] in letters:
             both += 1
    n = n_start + n_end - both
    return n

def count_symbols(text):

    """
    Creates character frequency dictionary.

    Args:
        text: Input string to analyze

    Returns:
        Dictionary with characters as keys and counts as values
    """
    
    symbol_count = {}

    for char in text:
        if char in symbol_count:
            symbol_count[char] += 1
        else:
            symbol_count[char] = 1

    return symbol_count

def words_after_comma(text):

    """
    Extracts and sorts words following commas.

    Args:
        text: Input string to process

    Returns:
        Alphabetically sorted list of words immediately following commas
    """
    
    words = []
    parts = text.split(",")
    for i in range(1, len(parts)):  
        word = parts[i].strip().split()[0]
        words.append(word)
    
    sorted_words = sorted(words)
    return sorted_words

def execute():
 
  """
  Executes Task 4: Advanced text analysis.

  Performs three analyses on sample text:
  a) Counts vowel-start/end words
  b) Character frequency count
  c) Comma-following words extraction

  Features:
  - Predefined sample text
  - Clear sectioned output
  - Alphabetical sorting where needed
  """

    
  word_count = count_vowel_words(text)
  print(f"a) Number of words that start or end with a/e/u/i/y/o: {word_count}")
  symbol_count = count_symbols(text)
  print("b) Symbol frequencies:")
  for symbol, count in sorted(symbol_count.items()):
     print(f"'{symbol}': {count}")
  result = words_after_comma(text)
  print(f"c) Words following a comma, sorted alphabetically: {result}")


