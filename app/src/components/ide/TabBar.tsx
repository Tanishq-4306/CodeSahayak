import { X, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIDEStore } from '@/store/ideStore';
import { getFileIcon } from '@/lib/fileIcons';

export function TabBar() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useIDEStore();
  
  if (openTabs.length === 0) {
    return (
      <div className="h-9 bg-[#1E1E2E] border-b border-[#2D2D3A] flex items-center px-4">
        <span className="text-sm text-gray-500">No files open</span>
      </div>
    );
  }
  
  return (
    <div className="h-9 bg-[#1E1E2E] border-b border-[#2D2D3A] flex overflow-x-auto scrollbar-hide">
      {openTabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        
        return (
          <motion.div
            key={tab.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer text-sm min-w-fit border-r border-[#2D2D3A] transition-colors ${
              isActive
                ? 'bg-[#252532] text-white border-t-2 border-t-[#6C5CE7]'
                : 'bg-[#1E1E2E] text-gray-400 hover:bg-[#252532] hover:text-gray-300'
            }`}
          >
            {getFileIcon(tab.name)}
            <span className="truncate max-w-[120px]">{tab.name}</span>
            
            {tab.isModified && (
              <Circle className="w-2 h-2 fill-current" />
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-1 p-0.5 rounded hover:bg-[#3D3D4A] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
