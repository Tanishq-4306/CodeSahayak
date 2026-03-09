import { useState } from 'react';
import { School, BookOpen, BarChart3, Check, Users } from 'lucide-react';
import { useTranslation } from '@/store';
import { useUIStore } from '@/store/uiStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const universities = [
  { id: 'vtu', name: 'Visvesvaraya Technological University', code: 'CS301' },
  { id: 'mumbai', name: 'University of Mumbai', code: 'IT202' },
  { id: 'anna', name: 'Anna University', code: 'CS8451' },
  { id: 'jntu', name: 'JNTU Hyderabad', code: 'CSE401' },
  { id: 'du', name: 'Delhi University', code: 'CSH501' },
];

const students = [
  { name: 'Rahul Sharma', completed: true, score: 85 },
  { name: 'Priya Patel', completed: true, score: 92 },
  { name: 'Amit Kumar', completed: false, score: 0 },
  { name: 'Sneha Gupta', completed: true, score: 78 },
  { name: 'Vikram Rao', completed: false, score: 0 },
];

export function TeacherModal() {
  const { t } = useTranslation();
  const { isTeacherModalOpen, closeTeacherModal } = useUIStore();
  const [selectedUniversity, setSelectedUniversity] = useState(universities[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics'>('overview');

  const handleGenerateReport = () => {
    toast.success('Lab report generated successfully!', {
      description: `Generated for ${selectedUniversity.name}`,
    });
  };

  return (
    <Dialog open={isTeacherModalOpen} onOpenChange={closeTeacherModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-[#1A1D2B] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E86AB]/10 flex items-center justify-center">
              <School className="w-5 h-5 text-[#2E86AB]" />
            </div>
            {t('teachersTitle')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          {/* University Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#5A6078] mb-2">
              {t('university')}
            </label>
            <select
              value={selectedUniversity.id}
              onChange={(e) => {
                const uni = universities.find(u => u.id === e.target.value);
                if (uni) setSelectedUniversity(uni);
              }}
              className="input-field"
            >
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2E86AB] text-white'
                    : 'bg-[#F0F4FA] text-[#5A6078] hover:bg-[#2E86AB]/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="bg-[#F6F7FB] rounded-xl p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-[#5A6078]">Syllabus Code</p>
                    <p className="text-xl font-bold text-[#1A1D2B]">{selectedUniversity.code}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-[#5A6078]">Total Students</p>
                    <p className="text-xl font-bold text-[#1A1D2B]">42</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-[#5A6078]">Completion Rate</p>
                    <p className="text-xl font-bold text-[#2E86AB]">68%</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-[#1A1D2B] mb-3">Current Assignment</h4>
                  <p className="text-[#5A6078]">Write a Python function to calculate factorial using recursion.</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-[#5A6078]">Due: 3 days</span>
                    <span className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs rounded-full">Active</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'students' && (
              <div className="space-y-2">
                {students.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2E86AB]/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-[#2E86AB]">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-[#1A1D2B]">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {student.completed ? (
                        <>
                          <span className="text-sm font-medium text-[#2E86AB]">{student.score}%</span>
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-[#5A6078]">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-[#5A6078]">Average Score</p>
                    <p className="text-2xl font-bold text-[#2E86AB]">85%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-[#5A6078]">Struggling Concepts</p>
                    <p className="text-lg font-medium text-[#FF6B35]">Recursion</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-[#1A1D2B] mb-3">Concept Mastery</h4>
                  {[
                    { concept: 'Loops', mastery: 92 },
                    { concept: 'Functions', mastery: 78 },
                    { concept: 'Recursion', mastery: 45 },
                    { concept: 'Arrays', mastery: 68 },
                  ].map((item) => (
                    <div key={item.concept} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#5A6078]">{item.concept}</span>
                        <span className="font-medium text-[#1A1D2B]">{item.mastery}%</span>
                      </div>
                      <div className="h-2 bg-[#F0F4FA] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.mastery}%`,
                            backgroundColor: item.mastery > 70 ? '#2E86AB' : '#FF6B35',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleGenerateReport}
              className="flex-1 btn-primary"
            >
              Generate Report
            </button>
            <button
              onClick={closeTeacherModal}
              className="btn-secondary"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
