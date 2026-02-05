export interface ProgrammingLanguage {
  id: string;
  name: string;
  extension: string;
  icon: string;
  color: string;
  isSupported: boolean;
  description: string;
  starterCode: string;
  syllabus: string[];
}

export const programmingLanguages: ProgrammingLanguage[] = [
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    icon: '🐍',
    color: '#3776AB',
    isSupported: true,
    description: 'Beginner-friendly, perfect for learning programming concepts',
    starterCode: `# Welcome to Python!
# Let's write your first program

def greet(name):
    return f"Hello, {name}!"

# Test the function
print(greet("World"))

# Try changing the name above!`,
    syllabus: [
      'Variables and Data Types',
      'Operators and Expressions',
      'Conditional Statements (if-else)',
      'Loops (for, while)',
      'Functions',
      'Lists and Tuples',
      'Dictionaries',
      'File Handling',
      'Object-Oriented Programming',
      'Exception Handling',
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    icon: '⚡',
    color: '#F7DF1E',
    isSupported: true,
    description: 'The language of the web, essential for web development',
    starterCode: `// Welcome to JavaScript!
// Let's write your first program

function greet(name) {
    return \`Hello, \${name}!\`;
}

// Test the function
console.log(greet("World"));

// Try changing the name above!`,
    syllabus: [
      'Variables (let, const, var)',
      'Data Types',
      'Operators',
      'Conditional Statements',
      'Loops',
      'Functions',
      'Arrays',
      'Objects',
      'DOM Manipulation',
      'Event Handling',
    ],
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    icon: '☕',
    color: '#007396',
    isSupported: true,
    description: 'Enterprise-standard, object-oriented programming language',
    starterCode: `// Welcome to Java!
// Let's write your first program

public class Main {
    public static void main(String[] args) {
        String name = "World";
        System.out.println("Hello, " + name + "!");
    }
}

// Try changing the name above!`,
    syllabus: [
      'Variables and Data Types',
      'Operators',
      'Control Flow',
      'Arrays',
      'Methods',
      'Classes and Objects',
      'Inheritance',
      'Polymorphism',
      'Exception Handling',
      'File I/O',
    ],
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    icon: '⚙️',
    color: '#00599C',
    isSupported: true,
    description: 'Powerful language for system programming and competitive coding',
    starterCode: `// Welcome to C++!
// Let's write your first program

#include <iostream>
using namespace std;

int main() {
    string name = "World";
    cout << "Hello, " << name << "!" << endl;
    return 0;
}

// Try changing the name above!`,
    syllabus: [
      'Variables and Data Types',
      'Operators',
      'Control Structures',
      'Arrays and Strings',
      'Functions',
      'Pointers',
      'Classes and Objects',
      'Inheritance',
      'Templates',
      'STL',
    ],
  },
  {
    id: 'c',
    name: 'C',
    extension: 'c',
    icon: '🔧',
    color: '#A8B9CC',
    isSupported: true,
    description: 'Foundation of modern programming, great for understanding computers',
    starterCode: `/* Welcome to C! */
/* Let's write your first program */

#include <stdio.h>

int main() {
    char name[] = "World";
    printf("Hello, %s!\\n", name);
    return 0;
}

/* Try changing the name above! */`,
    syllabus: [
      'Variables and Data Types',
      'Operators',
      'Control Statements',
      'Arrays',
      'Strings',
      'Functions',
      'Pointers',
      'Structures',
      'File Handling',
      'Dynamic Memory',
    ],
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    icon: '🗄️',
    color: '#336791',
    isSupported: true,
    description: 'Query language for managing and analyzing databases',
    starterCode: `-- Welcome to SQL!
-- Let's query some data

-- Create a table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT,
    marks INTEGER
);

-- Insert data
INSERT INTO students VALUES 
    (1, 'Rahul', 85),
    (2, 'Priya', 92);

-- Query the data
SELECT * FROM students WHERE marks > 80;`,
    syllabus: [
      'SELECT Statements',
      'WHERE Clause',
      'ORDER BY',
      'Aggregate Functions',
      'GROUP BY',
      'JOINs',
      'Subqueries',
      'INSERT, UPDATE, DELETE',
      'Table Creation',
      'Indexes',
    ],
  },
  {
    id: 'html',
    name: 'HTML/CSS',
    extension: 'html',
    icon: '🌐',
    color: '#E34F26',
    isSupported: true,
    description: 'Build beautiful web pages with HTML and CSS',
    starterCode: `<!-- Welcome to HTML! -->
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
    <style>
        body {
            font-family: Arial;
            background: #f0f0f0;
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to web development.</p>
</body>
</html>`,
    syllabus: [
      'HTML Structure',
      'Common Tags',
      'Forms',
      'CSS Selectors',
      'Box Model',
      'Flexbox',
      'Grid',
      'Responsive Design',
      'Animations',
      'Best Practices',
    ],
  },
  {
    id: 'r',
    name: 'R',
    extension: 'r',
    icon: '📊',
    color: '#276DC3',
    isSupported: false,
    description: 'Statistical computing and data analysis',
    starterCode: `# Welcome to R!
# Let's analyze some data

# Create a vector
numbers <- c(10, 20, 30, 40, 50)

# Calculate mean
mean_value <- mean(numbers)
print(paste("Mean:", mean_value))

# Plot the data
plot(numbers, type="o", col="blue")`,
    syllabus: [
      'Variables and Vectors',
      'Data Frames',
      'Basic Statistics',
      'Data Visualization',
      'Packages',
    ],
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    extension: 'kt',
    icon: '🎯',
    color: '#7F52FF',
    isSupported: false,
    description: 'Modern language for Android development',
    starterCode: `// Welcome to Kotlin!
fun main() {
    val name = "World"
    println("Hello, $name!")
}`,
    syllabus: [
      'Variables',
      'Functions',
      'Classes',
      'Null Safety',
      'Coroutines',
    ],
  },
];

export const getLanguageById = (id: string): ProgrammingLanguage | undefined => {
  return programmingLanguages.find(lang => lang.id === id);
};

export const getSupportedLanguages = (): ProgrammingLanguage[] => {
  return programmingLanguages.filter(lang => lang.isSupported);
};

export const getLanguageColor = (id: string): string => {
  const lang = getLanguageById(id);
  return lang?.color || '#6C5CE7';
};

// Code execution simulation for different languages
export const simulateCodeExecution = (code: string, language: string): string => {
  switch (language) {
    case 'python':
      if (code.includes('print(')) {
        const matches = code.match(/print\(['"](.+)['"]\)/g);
        if (matches) {
          return matches.map(m => {
            const content = m.match(/print\(['"](.+)['"]\)/)?.[1] || '';
            return content + '\n';
          }).join('');
        }
        if (code.includes('factorial')) return '120\n';
      }
      return 'Code executed successfully.\n';
      
    case 'javascript':
      if (code.includes('console.log(')) {
        const matches = code.match(/console\.log\(['"`](.+)['"`]\)/g);
        if (matches) {
          return matches.map(m => {
            const content = m.match(/console\.log\(['"`](.+)['"`]\)/)?.[1] || '';
            return content.replace(/\$\{([^}]+)\}/g, (_match, p1) => p1) + '\n';
          }).join('');
        }
      }
      return 'Code executed successfully.\n';
      
    case 'java':
    case 'cpp':
    case 'c':
      if (code.includes('cout') || code.includes('printf') || code.includes('System.out.println')) {
        return 'Hello, World!\n';
      }
      return 'Compilation successful.\nProgram executed.\n';
      
    case 'sql':
      if (code.includes('SELECT')) {
        return `id | name  | marks
---|-------|------
1  | Rahul | 85
2  | Priya | 92

2 rows returned.\n`;
      }
      return 'Query executed successfully.\n';
      
    default:
      return 'Code executed successfully.\n';
  }
};

// Get syntax highlighting mode for Monaco editor
export const getMonacoLanguage = (languageId: string): string => {
  const mapping: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    sql: 'sql',
    html: 'html',
    r: 'r',
    kotlin: 'kotlin',
  };
  return mapping[languageId] || 'plaintext';
};
