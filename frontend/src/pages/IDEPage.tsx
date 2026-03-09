import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useIDEStore } from '@/store/ideStore';
import { FileExplorer } from '@/components/ide/FileExplorer';
import { TabBar } from '@/components/ide/TabBar';
import { CodeEditor } from '@/components/ide/CodeEditor';
import { Terminal } from '@/components/ide/Terminal';
import { AIAssistant } from '@/components/ide/AIAssistant';
import { Toolbar } from '@/components/ide/Toolbar';

export default function IDEPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const {
    sidebarVisible,
    terminalVisible,
    aiPanelVisible,
    initializeSampleProject,
  } = useIDEStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Initialize with sample project
    initializeSampleProject();
  }, [isAuthenticated, navigate, initializeSampleProject]);
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6C5CE7] border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-[#E8EAF6] shadow-sm">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-lg flex items-center justify-center shadow-md">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1A1D2B]">CodeSahayak</span>
          </div>
          
          <div className="h-6 w-px bg-[#E8EAF6]" />
          
          {/* Project Name */}
          <div className="flex items-center gap-2 text-sm text-[#636E72]">
            <span>my-project</span>
          </div>
        </div>
        
        {/* Center: Navigation */}
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#6C5CE7] bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20"
          >
            Editor
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/learning')}
            className="text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
          >
            Learning
          </Button>
        </nav>
        
        {/* Right: User Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-[#636E72] hover:text-[#1A1D2B] hover:bg-[#F6F7FB]"
          >
            <Bell className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-[#1A1D2B] hover:bg-[#F6F7FB]"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center shadow-md">
                  <span className="text-xs text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden bg-[#F6F7FB] ide-page-scrollbar">
        {/* Sidebar: File Explorer */}
        <AnimatePresence>
          {sidebarVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-[#E8EAF6] bg-white overflow-hidden"
            >
              <FileExplorer />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Center: Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Toolbar */}
          <Toolbar />
          
          {/* Tabs */}
          <TabBar />
          
          {/* Editor */}
          <CodeEditor />
          
          {/* Terminal */}
          <AnimatePresence>
            {terminalVisible && <Terminal />}
          </AnimatePresence>
        </div>
        
        {/* Right: AI Assistant */}
        <AnimatePresence>
          {aiPanelVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-[#E8EAF6] bg-white"
            >
              <AIAssistant />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Developer Footer */}
      <div className="h-10 flex items-center justify-center bg-[#1A1D2B] border-t border-[#2D2D3A]">
        <p className="text-xs text-gray-400">
          Developed by <span className="text-[#6C5CE7] font-medium">Hood_Technoid</span>
        </p>
      </div>
    </div>
  );
}
