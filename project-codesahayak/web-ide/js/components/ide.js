/**
 * IDE Components for CodeSahayak
 * Code Editor, Console, AI Tutor, and Action Bar
 */

// ============================================================================
// CODE EDITOR COMPONENT
// ============================================================================

class CodeEditor extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            code: props.initialCode || '',
            language: props.language || 'python',
            theme: appState.getState('theme') || 'light',
            fontSize: 14,
            lineNumbers: true
        };
    }

    render() {
        const { code, language, theme, fontSize, lineNumbers } = this.state;

        return `
            <div class="code-editor-container">
                <div class="editor-header">
                    <div class="editor-tabs">
                        <div class="editor-tab active">
                            <span class="tab-icon">${this.getLanguageIcon(language)}</span>
                            <span class="tab-name">main.${this.getFileExtension(language)}</span>
                        </div>
                    </div>
                    <div class="editor-actions">
                        <button class="editor-btn" id="formatCode" title="Format Code">
                            <span>✨</span>
                        </button>
                        <button class="editor-btn" id="clearCode" title="Clear">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>
                <div class="editor-body">
                    ${lineNumbers ? `
                        <div class="line-numbers" id="lineNumbers">
                            ${this.generateLineNumbers(code)}
                        </div>
                    ` : ''}
                    <textarea 
                        id="codeInput"
                        class="code-textarea ${theme}"
                        style="font-size: ${fontSize}px"
                        spellcheck="false"
                        placeholder="${this.getPlaceholder(language)}"
                    >${code}</textarea>
                </div>
            </div>
        `;
    }

    afterMount() {
        this.attachEventListeners();
        this.setupSyntaxHighlighting();
    }

    afterUpdate() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const codeInput = document.getElementById('codeInput');
        const formatBtn = document.getElementById('formatCode');
        const clearBtn = document.getElementById('clearCode');

        if (codeInput) {
            codeInput.oninput = (e) => {
                this.setState({ code: e.target.value });
                this.updateLineNumbers(e.target.value);
                eventBus.emit('code:change', e.target.value);
            };

            // Handle Tab key
            codeInput.onkeydown = (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const value = e.target.value;
                    
                    e.target.value = value.substring(0, start) + '    ' + value.substring(end);
                    e.target.selectionStart = e.target.selectionEnd = start + 4;
                    
                    this.setState({ code: e.target.value });
                }

                // Ctrl+Enter to run
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    eventBus.emit('code:run');
                }

                // Ctrl+S to save
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    eventBus.emit('code:save');
                }
            };
        }

        if (formatBtn) {
            formatBtn.onclick = () => this.formatCode();
        }

        if (clearBtn) {
            clearBtn.onclick = () => {
                if (confirm('Clear all code?')) {
                    this.setState({ code: '' });
                    eventBus.emit('code:clear');
                }
            };
        }
    }

    generateLineNumbers(code) {
        const lines = code.split('\n').length;
        return Array.from({ length: lines }, (_, i) => `
            <div class="line-number">${i + 1}</div>
        `).join('');
    }

    updateLineNumbers(code) {
        const lineNumbers = document.getElementById('lineNumbers');
        if (lineNumbers) {
            lineNumbers.innerHTML = this.generateLineNumbers(code);
        }
    }

    setupSyntaxHighlighting() {
        // Basic syntax highlighting (can be enhanced with a library)
        const codeInput = document.getElementById('codeInput');
        if (codeInput) {
            // Add syntax highlighting class
            codeInput.classList.add(`lang-${this.state.language}`);
        }
    }

    formatCode() {
        // Basic code formatting
        let { code, language } = this.state;
        
        if (language === 'python') {
            // Simple Python formatting
            code = code.split('\n').map(line => line.trimEnd()).join('\n');
        } else if (language === 'javascript') {
            // Simple JS formatting
            code = code.replace(/\s*{\s*/g, ' {\n    ')
                       .replace(/\s*}\s*/g, '\n}');
        }
        
        this.setState({ code });
        eventBus.emit('code:formatted', code);
    }

    getLanguageIcon(language) {
        const icons = {
            python: '🐍',
            javascript: '📜',
            java: '☕',
            cpp: '⚡',
            c: '🔧'
        };
        return icons[language] || '📝';
    }

    getFileExtension(language) {
        const extensions = {
            python: 'py',
            javascript: 'js',
            java: 'java',
            cpp: 'cpp',
            c: 'c'
        };
        return extensions[language] || 'txt';
    }

    getPlaceholder(language) {
        const placeholders = {
            python: '# Write your Python code here...\nprint("Hello, CodeSahayak!")',
            javascript: '// Write your JavaScript code here...\nconsole.log("Hello, CodeSahayak!");',
            java: '// Write your Java code here...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeSahayak!");\n    }\n}',
            cpp: '// Write your C++ code here...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeSahayak!" << endl;\n    return 0;\n}',
            c: '// Write your C code here...\n#include <stdio.h>\n\nint main() {\n    printf("Hello, CodeSahayak!\\n");\n    return 0;\n}'
        };
        return placeholders[language] || '// Start coding...';
    }

    getCode() {
        return this.state.code;
    }

    setCode(code) {
        this.setState({ code });
    }
}

// ============================================================================
// OUTPUT CONSOLE COMPONENT
// ============================================================================

class OutputConsole extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            output: [],
            isRunning: false,
            executionTime: 0
        };
    }

    render() {
        const { output, isRunning, executionTime } = this.state;
        const t = window.translations?.[appState.getState('language')]?.ide || {};

        return `
            <div class="output-console">
                <div class="console-header">
                    <h3 class="console-title">
                        <span>📟</span>
                        ${t.output || 'Output'}
                    </h3>
                    <div class="console-actions">
                        ${executionTime > 0 ? `
                            <span class="execution-time">⏱️ ${executionTime}ms</span>
                        ` : ''}
                        <button class="console-btn" id="clearConsole" title="Clear">
                            <span>🗑️</span>
                        </button>
                        <button class="console-btn" id="copyOutput" title="Copy">
                            <span>📋</span>
                        </button>
                    </div>
                </div>
                <div class="console-body" id="consoleBody">
                    ${isRunning ? `
                        <div class="console-loading">
                            <span class="spinner"></span>
                            <span>${t.running || 'Running code...'}</span>
                        </div>
                    ` : output.length === 0 ? `
                        <div class="console-empty">
                            <span class="empty-icon">💻</span>
                            <p>${t.noOutput || 'Run your code to see output here'}</p>
                        </div>
                    ` : `
                        ${output.map(line => `
                            <div class="console-line ${line.type}">
                                <span class="line-icon">${this.getLineIcon(line.type)}</span>
                                <span class="line-text">${this.escapeHtml(line.text)}</span>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    }

    afterMount() {
        this.attachEventListeners();
        this.setupEventListeners();
    }

    afterUpdate() {
        this.attachEventListeners();
        this.scrollToBottom();
    }

    attachEventListeners() {
        const clearBtn = document.getElementById('clearConsole');
        const copyBtn = document.getElementById('copyOutput');

        if (clearBtn) {
            clearBtn.onclick = () => this.clearOutput();
        }

        if (copyBtn) {
            copyBtn.onclick = () => this.copyOutput();
        }
    }

    setupEventListeners() {
        eventBus.on('code:run', () => this.handleRun());
        eventBus.on('code:output', (data) => this.addOutput(data));
        eventBus.on('code:error', (error) => this.addError(error));
        eventBus.on('code:complete', (time) => this.handleComplete(time));
    }

    handleRun() {
        this.setState({ 
            output: [], 
            isRunning: true,
            executionTime: 0
        });
    }

    addOutput(data) {
        const output = [...this.state.output, {
            type: data.type || 'info',
            text: data.text || data
        }];
        this.setState({ output });
    }

    addError(error) {
        const output = [...this.state.output, {
            type: 'error',
            text: error.message || error
        }];
        this.setState({ output, isRunning: false });
    }

    handleComplete(executionTime) {
        this.setState({ 
            isRunning: false,
            executionTime: executionTime || 0
        });
    }

    clearOutput() {
        this.setState({ output: [], executionTime: 0 });
    }

    copyOutput() {
        const text = this.state.output.map(line => line.text).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Output copied to clipboard');
        });
    }

    scrollToBottom() {
        const consoleBody = document.getElementById('consoleBody');
        if (consoleBody) {
            consoleBody.scrollTop = consoleBody.scrollHeight;
        }
    }

    getLineIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || '▶️';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// ============================================================================
// SAHAYAK TUTOR PANEL COMPONENT
// ============================================================================

class SahayakTutorPanel extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            explanation: null,
            hint: null,
            hintLevel: 0,
            loading: false,
            mode: 'idle' // idle, explaining, hinting
        };
    }

    render() {
        const { explanation, hint, hintLevel, loading, mode } = this.state;
        const t = window.translations?.[appState.getState('language')]?.ide || {};
        const language = appState.getState('language') || 'en';

        return `
            <div class="sahayak-tutor-panel">
                <div class="tutor-header">
                    <div class="tutor-avatar">
                        <span class="avatar-icon ${loading ? 'thinking' : ''}">🤖</span>
                    </div>
                    <div class="tutor-info">
                        <h3 class="tutor-name">${t.sahayakGuruji || 'Sahayak Guruji'}</h3>
                        <span class="tutor-status">
                            ${loading ? t.thinking || 'Thinking...' : t.readyToHelp || 'Ready to help'}
                        </span>
                    </div>
                    <div class="language-badge">${language.toUpperCase()}</div>
                </div>

                <div class="tutor-body">
                    ${mode === 'idle' ? `
                        <div class="tutor-welcome">
                            <p class="welcome-message">
                                ${t.tutorWelcome || 'नमस्ते! I\'m here to help you understand code with cultural context.'}
                            </p>
                            <div class="tutor-features">
                                <div class="feature-item">
                                    <span class="feature-icon">💡</span>
                                    <span>${t.getHints || 'Get progressive hints'}</span>
                                </div>
                                <div class="feature-item">
                                    <span class="feature-icon">🧠</span>
                                    <span>${t.explainCode || 'Explain code concepts'}</span>
                                </div>
                                <div class="feature-item">
                                    <span class="feature-icon">🎯</span>
                                    <span>${t.culturalContext || 'Cultural metaphors'}</span>
                                </div>
                            </div>
                        </div>
                    ` : mode === 'explaining' && explanation ? `
                        <div class="tutor-explanation">
                            <h4 class="explanation-title">
                                <span>🧠</span>
                                ${t.codeExplanation || 'Code Explanation'}
                            </h4>
                            <div class="explanation-content">
                                ${explanation.explanation}
                            </div>
                            ${explanation.cultural_metaphor ? `
                                <div class="cultural-metaphor">
                                    <div class="metaphor-icon">🎭</div>
                                    <div class="metaphor-content">
                                        <strong>${t.culturalContext || 'Cultural Context'}:</strong>
                                        <p>${explanation.cultural_metaphor}</p>
                                    </div>
                                </div>
                            ` : ''}
                            ${explanation.common_mistakes ? `
                                <div class="common-mistakes">
                                    <strong>⚠️ ${t.commonMistakes || 'Common Mistakes'}:</strong>
                                    <ul>
                                        ${explanation.common_mistakes.map(mistake => `
                                            <li>${mistake}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : mode === 'hinting' && hint ? `
                        <div class="tutor-hint">
                            <h4 class="hint-title">
                                <span>💡</span>
                                ${t.hint || 'Hint'} ${hintLevel}/3
                            </h4>
                            <div class="hint-level-indicator">
                                ${[1,2,3].map(level => `
                                    <div class="level-dot ${level <= hintLevel ? 'active' : ''}"></div>
                                `).join('')}
                            </div>
                            <div class="hint-content">
                                ${hint.hint}
                            </div>
                            ${hintLevel < 3 ? `
                                <button class="btn btn-secondary btn-sm" id="nextHint">
                                    ${t.nextHint || 'Next Hint'} →
                                </button>
                            ` : `
                                <div class="hint-complete">
                                    <p>${t.allHintsUsed || 'All hints used. Try to solve it yourself!'}</p>
                                </div>
                            `}
                        </div>
                    ` : ''}
                </div>

                <div class="tutor-actions">
                    <button 
                        class="tutor-btn" 
                        id="explainBtn"
                        ${loading ? 'disabled' : ''}
                    >
                        <span>🧠</span>
                        ${t.explain || 'Explain'}
                    </button>
                    <button 
                        class="tutor-btn" 
                        id="hintBtn"
                        ${loading ? 'disabled' : ''}
                    >
                        <span>💡</span>
                        ${t.getHint || 'Get Hint'}
                    </button>
                    <button 
                        class="tutor-btn" 
                        id="askBtn"
                        ${loading ? 'disabled' : ''}
                    >
                        <span>❓</span>
                        ${t.ask || 'Ask'}
                    </button>
                </div>
            </div>
        `;
    }

    afterMount() {
        this.attachEventListeners();
    }

    afterUpdate() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const explainBtn = document.getElementById('explainBtn');
        const hintBtn = document.getElementById('hintBtn');
        const askBtn = document.getElementById('askBtn');
        const nextHintBtn = document.getElementById('nextHint');

        if (explainBtn) {
            explainBtn.onclick = () => this.explainCode();
        }

        if (hintBtn) {
            hintBtn.onclick = () => this.getHint();
        }

        if (askBtn) {
            askBtn.onclick = () => this.askQuestion();
        }

        if (nextHintBtn) {
            nextHintBtn.onclick = () => this.getNextHint();
        }
    }

    async explainCode() {
        const code = eventBus.emit('code:get');
        if (!code || code.length === 0) {
            this.showError('Please write some code first');
            return;
        }

        this.setState({ loading: true, mode: 'explaining' });

        try {
            const explanation = await api.explainCode({
                code,
                language: appState.getState('language') || 'en'
            });

            this.setState({ 
                explanation,
                loading: false,
                mode: 'explaining'
            });
        } catch (error) {
            this.showError(error.message || 'Failed to get explanation');
            this.setState({ loading: false, mode: 'idle' });
        }
    }

    async getHint() {
        const code = eventBus.emit('code:get');
        if (!code || code.length === 0) {
            this.showError('Please write some code first');
            return;
        }

        this.setState({ loading: true, hintLevel: 1 });

        try {
            const hint = await api.getHint({
                code,
                language: appState.getState('language') || 'en',
                level: 1
            });

            this.setState({ 
                hint,
                loading: false,
                mode: 'hinting',
                hintLevel: 1
            });
        } catch (error) {
            this.showError(error.message || 'Failed to get hint');
            this.setState({ loading: false, mode: 'idle' });
        }
    }

    async getNextHint() {
        const nextLevel = this.state.hintLevel + 1;
        if (nextLevel > 3) return;

        this.setState({ loading: true });

        try {
            const code = eventBus.emit('code:get');
            const hint = await api.getHint({
                code,
                language: appState.getState('language') || 'en',
                level: nextLevel
            });

            this.setState({ 
                hint,
                loading: false,
                hintLevel: nextLevel
            });
        } catch (error) {
            this.showError(error.message || 'Failed to get hint');
            this.setState({ loading: false });
        }
    }

    askQuestion() {
        // Open a modal or input for custom questions
        const question = prompt('What would you like to know?');
        if (question) {
            // Handle custom question
            console.log('Question:', question);
        }
    }

    showError(message) {
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CodeEditor,
        OutputConsole,
        SahayakTutorPanel
    };
}
