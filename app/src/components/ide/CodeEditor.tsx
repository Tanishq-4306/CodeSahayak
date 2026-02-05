import { useCallback, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { useIDEStore } from '@/store/ideStore';
import { getLanguageFromFilename } from '@/lib/fileIcons';

const getLanguageExtension = (filename: string) => {
  const lang = getLanguageFromFilename(filename);
  
  switch (lang) {
    case 'python':
      return python();
    case 'javascript':
    case 'typescript':
      return javascript({ jsx: true, typescript: lang === 'typescript' });
    case 'java':
      return java();
    case 'cpp':
    case 'c':
      return cpp();
    case 'sql':
      return sql();
    case 'html':
      return html();
    default:
      return [];
  }
};

export function CodeEditor() {
  const {
    openTabs,
    activeTabId,
    updateTabContent,
    theme,
    fontSize,
    lineNumbers,
  } = useIDEStore();
  
  const activeTab = openTabs.find((t) => t.id === activeTabId);
  
  const handleChange = useCallback(
    (value: string) => {
      if (activeTabId) {
        updateTabContent(activeTabId, value);
      }
    },
    [activeTabId, updateTabContent]
  );
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Save functionality
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1E1E2E]">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#2D2D3A] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👋</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Welcome to CodeSahayak IDE
          </h3>
          <p className="text-gray-400 max-w-md">
            Select a file from the explorer to start coding, or create a new file to begin your project.
          </p>
          <div className="mt-6 flex gap-4 justify-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-[#2D2D3A] rounded">Ctrl+N</kbd>
              <span>New File</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-[#2D2D3A] rounded">Ctrl+O</kbd>
              <span>Open File</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-[#2D2D3A] rounded">Ctrl+S</kbd>
              <span>Save</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col bg-[#1E1E2E] overflow-hidden">
      {/* Breadcrumbs */}
      <div className="h-8 flex items-center px-4 bg-[#252532] border-b border-[#2D2D3A]">
        <span className="text-xs text-gray-500">{activeTab.path}</span>
        {activeTab.isModified && (
          <span className="ml-2 text-xs text-yellow-500">● Modified</span>
        )}
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={activeTab.content}
          height="100%"
          theme={theme === 'dark' ? oneDark : 'light'}
          extensions={[getLanguageExtension(activeTab.name)]}
          onChange={handleChange}
          basicSetup={{
            lineNumbers,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
          }}
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace',
          }}
        />
      </div>
    </div>
  );
}
