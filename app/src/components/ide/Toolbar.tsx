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
  } = useIDEStore();
  
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#252532] border-b border-[#2D2D3A]">
      {/* Left: File Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-white hover:bg-[#3D3D4A]"
        >
          <FolderOpen className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-white hover:bg-[#3D3D4A]"
        >
          <Save className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-[#3D3D4A] mx-2" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-green-400 hover:text-green-300 hover:bg-green-400/10"
        >
          <Play className="w-4 h-4" />
          <span className="text-xs">Run</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-white hover:bg-[#3D3D4A]"
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
            sidebarVisible ? 'text-[#6C5CE7] bg-[#6C5CE7]/10' : 'text-gray-400 hover:text-white'
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
            terminalVisible ? 'text-[#6C5CE7] bg-[#6C5CE7]/10' : 'text-gray-400 hover:text-white'
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
            aiPanelVisible ? 'text-[#6C5CE7] bg-[#6C5CE7]/10' : 'text-gray-400 hover:text-white'
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
          className="w-8 h-8 text-gray-400 hover:text-white hover:bg-[#3D3D4A]"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-gray-400 hover:text-white"
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
              <span className="ml-auto text-xs text-gray-500">{fontSize}px</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
