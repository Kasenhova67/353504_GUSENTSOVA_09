"""
task 2: Text Analysis
Developer: Gusentsova Ekaterina
Date: 2023-04-30
Description: This program analyzes text files using regular expressions.
"""

import re
import zipfile
from statistics import mean
from typing import List, Tuple, Dict
from pathlib import Path

class TextAnalyzer:
    """Class for text analysis tasks"""
    def __init__(self, text: str):
        self.text = text
    
    def find_dates(self) -> List[str]:
        """Find dates in format DD-MM-YYYY"""
        return re.findall(r'\d{2}-\d{2}-\d{4}',self.text)
    
    def find_special_words(self) -> List[str]:
        """Find words where last letter is vowel and second last is consonant"""
        vowels = 'aeiouаеёиоуыэюя'
        consonants = 'bcdfghjklmnpqrstvwxyzбвгджзйклмнпрстфхцчшщ'
        pattern = fr'\b\w*[{consonants}][{vowels}]\b'
        return re.findall(pattern, self.text, flags=re.IGNORECASE)
    
    def count_lowercase(self) -> int:
        """Count lowercase letters"""
        return len(re.findall(r'[a-zа-я]', self.text))
    
    def last_word_with_i(self) -> Tuple[str, int]:
        """Find last word containing 'i' and its position"""
        words = re.findall(r'\b\w+\b', self.text)
        for i in range(len(words)-1, -1, -1):
            if 'i' in words[i].lower():
                return (words[i], i+1)
        return ("Not found", -1)
    
    def remove_words_starting_with_i(self) -> str:
        """Remove words starting with 'i'"""
        return re.sub(r'\bi\w*\b', '', self.text, flags=re.IGNORECASE)
    
    def sentence_stats(self) -> Dict:
        """Calculate various sentence statistics"""
       
        sentences = re.split(r'[.!?]+', self.text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        declarative = len(re.findall(r'[^.!?]*\.', self.text))
        interrogative = len(re.findall(r'[^.!?]*\?', self.text))
        imperative = len(re.findall(r'[^.!?]*!', self.text))
       
        words = re.findall(r'\b\w+\b', self.text)
        word_lengths = [len(w) for w in words]
        sentence_lengths = [len(re.findall(r'\b\w+\b', s)) for s in sentences]
        
        smileys = re.findall(r'[:;]-*[(\[{)\]]+', self.text)
        
        return {
            'total_sentences': len(sentences),
            'declarative': declarative,
            'interrogative': interrogative,
            'imperative': imperative,
            'avg_sentence_length': mean(sentence_lengths) if sentences else 0,
            'avg_word_length': mean(word_lengths) if words else 0,
            'smileys': len(smileys)
        }

def save_results(results: Dict, filename: str):
    """Save analysis results to file"""
    with open(filename, 'w') as f:
        for key, value in results.items():
            f.write(f"{key}: {value}\n")
    
    with zipfile.ZipFile(f"{Path(filename).stem}.zip", 'w') as zipf:
        zipf.write(filename)
    
    with zipfile.ZipFile(f"{Path(filename).stem}.zip", 'r') as zipf:
        print(f"\nArchive info for {filename}.zip:")
        zipf.printdir()

def main():
    """Main program interface"""
    while True:
        filename = input("\nEnter text filename (or 'exit' to quit): ")
        if filename.lower() == 'exit':
            break
        
        try:
            with open(filename, 'r') as f:
                text = f.read()
            
            analyzer = TextAnalyzer(text)
            
            print("\nDates found:", analyzer.find_dates())
            print("Special words:", analyzer.find_special_words())
            print("Lowercase letters count:", analyzer.count_lowercase())
            
            word, pos = analyzer.last_word_with_i()
            print(f"Last word with 'i': '{word}' at position {pos}")
            print("Text without words starting with 'i':", analyzer.remove_words_starting_with_i())
            
            stats = analyzer.sentence_stats()
            print("\nSentence statistics:")
            for key, value in stats.items():
                print(f"{key.replace('_', ' ').title()}: {value}")
            
            output_file = input("\nEnter output filename to save results: ")
            save_results(stats, output_file)
            print("Results saved and archived!")
        
        except FileNotFoundError:
            print("File not found!")

if __name__ == "__main__":
    main()