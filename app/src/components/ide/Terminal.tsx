import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal as TerminalIcon,
  Trash2,
  ChevronDown,
  Play,
} from 'lucide-react';
import { useIDEStore } from '@/store/ideStore';
import { Button } from '@/components/ui/button';

export function Terminal() {
  const {
    terminalOutputs,
    terminalVisible,
    terminalHeight,
    toggleTerminal,
    addTerminalOutput,
    clearTerminal,
  } = useIDEStore();
  
  const [input, setInput] = useState('');
  const [height, setHeight] = useState(terminalHeight);
  const [isResizing, setIsResizing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutputs]);
  
  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY;
        setHeight(Math.max(100, Math.min(500, newHeight)));
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTerminalOutput({ type: 'input', content: `> ${input}` });
      
      // Simulate command execution
      setTimeout(() => {
        const cmd = input.toLowerCase();
        if (cmd === 'help') {
          addTerminalOutput({
            type: 'output',
            content: 'Available commands:\n  help    - Show this help\n  clear   - Clear terminal\n  python  - Run Python code\n  ls      - List files',
          });
        } else if (cmd === 'clear') {
          clearTerminal();
        } else if (cmd === 'ls') {
          addTerminalOutput({
            type: 'output',
            content: 'src/\n  main.py\n  utils.py\nREADME.md',
          });
        } else if (cmd.startsWith('python')) {
          addTerminalOutput({
            type: 'output',
            content: 'Python 3.10.0\n>>> Use the Run button to execute your code',
          });
        } else {
          addTerminalOutput({
            type: 'output',
            content: `Command not found: ${input}. Type 'help' for available commands.`,
          });
        }
      }, 100);
      
      setInput('');
    }
  };
  
  const runCode = () => {
    const { openTabs, activeTabId } = useIDEStore.getState();
    const activeTab = openTabs.find((t) => t.id === activeTabId);
    
    if (activeTab) {
      addTerminalOutput({ type: 'input', content: `$ python ${activeTab.name}` });
      
      setTimeout(() => {
        // Simulate code execution output
        if (activeTab.content.includes('factorial')) {
          addTerminalOutput({
            type: 'output',
            content: 'Hello, Student! Welcome to coding.\nFactorial of 5 is: 120',
          });
        } else if (activeTab.content.includes('print')) {
          const matches = activeTab.content.match(/print\(['"`](.+?)['"`]\)/g);
          if (matches) {
            matches.forEach((match) => {
              const content = match.match(/print\(['"`](.+?)['"`]\)/)?.[1] || '';
              addTerminalOutput({ type: 'output', content });
            });
          }
        } else {
          addTerminalOutput({ type: 'output', content: 'Program executed successfully.' });
        }
      }, 500);
    }
  };
  
  if (!terminalVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={toggleTerminal}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#6C5CE7] text-white rounded-lg shadow-lg hover:bg-[#5B4BD6] transition-colors"
      >
        <TerminalIcon className="w-4 h-4" />
        <span className="text-sm">Terminal</span>
      </motion.button>
    );
  }
  
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height }}
      className="flex flex-col bg-[#1E1E2E] border-t border-[#2D2D3A]"
    >
      {/* Resize Handle */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className="h-1 cursor-ns-resize hover:bg-[#6C5CE7] transition-colors"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252532] border-b border-[#2D2D3A]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Terminal
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-white"
            onClick={runCode}
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-white"
            onClick={clearTerminal}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-white"
            onClick={toggleTerminal}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm"
      >
        {terminalOutputs.map((output) => (
          <div
            key={output.id}
            className={`mb-1 ${
              output.type === 'input'
                ? 'text-green-400'
                : output.type === 'error'
                ? 'text-red-400'
                : 'text-gray-300'
            }`}
          >
            <pre className="whitespace-pre-wrap">{output.content}</pre>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center px-3 py-2 border-t border-[#2D2D3A]">
        <span className="text-green-400 mr-2">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
          className="flex-1 bg-transparent text-gray-300 outline-none font-mono text-sm"
          autoComplete="off"
        />
      </form>
    </motion.div>
  );
}
