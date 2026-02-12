// AI Service for CodeSahayak
// Handles AI-powered code explanations, hints, and tutoring

class AIService {
    constructor() {
        this.conceptDatabase = this.initializeConceptDatabase();
        this.languageSupport = ['en', 'hi', 'ta', 'bn', 'mr', 'te', 'gu', 'kn'];
    }

    // Initialize concept database with explanations
    initializeConceptDatabase() {
        return {
            // Programming Concepts
            variables: {
                en: {
                    explanation: "Variables are containers that store data values. They act like labeled boxes where you can put information and retrieve it later.",
                    example: "In Python: name = 'John' creates a variable called 'name' that stores the text 'John'",
                    hints: [
                        "Think of variables as labeled containers for your data",
                        "Choose meaningful names that describe what the variable contains",
                        "Variables can store different types of data: numbers, text, lists, etc."
                    ]
                },
                hi: {
                    explanation: "वेरिएबल्स डेटा वैल्यू स्टोर करने वाले कंटेनर हैं। ये लेबल वाले बॉक्स की तरह हैं जहाँ आप जानकारी रख सकते हैं और बाद में इसे वापस ले सकते हैं।",
                    example: "Python में: name = 'John' एक वेरिएबल बनाता है जिसका नाम 'name' है और जो 'John' टेक्स्ट स्टोर करता है",
                    hints: [
                        "वेरिएबल्स को अपने डेटा के लिए लेबल वाले कंटेनर समझें",
                        "ऐसे नाम चुनें जो बताते हों कि वेरिएबल में क्या है",
                        "वेरिएबल्स अलग-अलग तरह का डेटा स्टोर कर सकते हैं: संख्या, टेक्स्ट, लिस्ट आदि"
                    ]
                }
            },
            
            loops: {
                en: {
                    explanation: "Loops allow you to repeat a block of code multiple times. They're essential for automating repetitive tasks.",
                    example: "for i in range(5): print(i) will print numbers 0 throu