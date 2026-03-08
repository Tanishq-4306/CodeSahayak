import {
  Play,
  RotateCcw,
  Save,
  FolderOpen,
  Settings,
  Moon,
  Sun,
  Type,
  WrapText,
  Minimize2,
  List,
  Bot,
  Terminal,
  ChevronDown,
} from 'lucide-react';
import { useIDEStore } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Toolbar() {
  const {
    theme,
    fontSize,
    wordWrap,
    minimap,
    lineNumbers,
    sidebarVisible,
    terminalVisible,
    aiPanelVisible,
    setTheme,
    toggleWordWrap,
    toggleMinimap,
    toggleLineNumbers,
    toggleSidebar,
    toggleTerminal,
    toggleAIPanel,
    addTerminalOutput,
    openTabs,
    activeTabId,
  } = useIDEStore();
  
  const runCode = async () => {
    const activeTab = openTabs.find((t) => t.id === activeTabId);
    
    if (!activeTab) {
      alert('Please open a file first!');
      return;
    }
    
    // Open terminal if not visible
    if (!terminalVisible) {
      toggleTerminal();
    }
    
    // Add running message
    addTerminalOutput({ type: 'input', content: `$ python ${activeTab.name}` });
    addTerminalOutput({ type: 'output', content: 'Executing code...\n' });
    
    try {
      // Execute Python code using Gurujii API
      const response = await fetch('http://localhost:5000/api/gurujii/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: activeTab.content,
          message: 'Execute this code',
          language: 'en',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.hasError) {
        // Show error with details
        addTerminalOutput({
          type: 'error',
          content: `${result.explanation}\n`,
        });
        
        // Play voice if available
        if (result.voiceUrl) {
          const audio = new Audio(`http://localhost:5000${result.voiceUrl}`);
          audio.play().catch(err => console.error('Failed to play voice:', err));
        }
      } else {
        // Code executed successfully - show output
        const outputText = result.output || result.explanation;
        
        addTerminalOutput({
          type: 'output',
          content: outputText,
        });
      }
    } catch (error) {
      console.error('Code execution error:', error);
      addTerminalOutput({
        type: 'error',
        content: `❌ Failed to execute code: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure Gurujii API is running on http://localhost:5000`,
      });
    }
  };
  
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-[#E8EAF6]">
      {/* Left: File Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
        >
          <FolderOpen className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
        >
          <Save className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-[#E8EAF6] mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={runCode}
          className="h-8 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Play className="w-4 h-4" />
          <span className="text-xs font-medium">Run</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Center: View Toggles */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={`h-8 gap-2 ${
            sidebarVisible ? 'text-[#6C5CE7] bg-[#6C5CE7]/10' : 'text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]'
          }`}
        >
          <List className="w-4 h-4" />
          <span className="text-xs">Explorer</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTerminal}
          className={`h-8 gap-2 ${
            terminalVisible ? 'text-[#6C5CE7] bg-[#6C5CE7]/10' : 'text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span className="text-xs">Terminal</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAIPanel}
          className={`h-8 gap-2 ${
            aiPanelVisible ? 'text-[#6C5CE7] bg-[#6C5CE7]/10' : 'text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="text-xs">AI</span>
        </Button>
      </div>
      
      {/* Right: Settings */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
            >
              <Settings className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={toggleWordWrap}>
              <WrapText className="w-4 h-4 mr-2" />
              Word Wrap
              {wordWrap && <span className="ml-auto text-[#6C5CE7]">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleMinimap}>
              <Minimize2 className="w-4 h-4 mr-2" />
              Minimap
              {minimap && <span className="ml-auto text-[#6C5CE7]">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleLineNumbers}>
              <List className="w-4 h-4 mr-2" />
              Line Numbers
              {lineNumbers && <span className="ml-auto text-[#6C5CE7]">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Type className="w-4 h-4 mr-2" />
              Font Size
              <span className="ml-auto text-xs text-[#636E72]">{fontSize}px</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
