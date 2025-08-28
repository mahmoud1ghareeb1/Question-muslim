import React, { useState } from 'react';
import { Level } from '../types';

interface LevelSelectionScreenProps {
  levels: Level[];
  onSelectLevel: (level: Level) => void;
  onStartRandomQuiz: () => void;
  onStartCustomQuiz: () => void;
}

const LevelSelectionScreen: React.FC<LevelSelectionScreenProps> = ({ levels, onSelectLevel, onStartRandomQuiz, onStartCustomQuiz }) => {
  const [view, setView] = useState<'basic' | 'advanced'>('basic');
  
  const levelsToShow = view === 'basic' ? levels.slice(0, 100) : levels.slice(100, 200);

  const difficultyColors: { [key: string]: string } = {
    'سهل': 'bg-green-500',
    'متوسط': 'bg-yellow-500',
    'صعب': 'bg-red-500',
  };

  return (
    <div className="p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 w-full max-w-5xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 mb-4">
          خريطة الرحلة
        </h1>
        <p className="text-xl text-slate-300">اختر تحديك وانطلق في رحلة المعرفة!</p>
      </header>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
        <div className="flex gap-2 p-1.5 bg-slate-800 rounded-full">
          <button 
            onClick={() => setView('basic')}
            className={`px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-300 ${view === 'basic' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            المراحل الأساسية (1-100)
          </button>
          <button 
            onClick={() => setView('advanced')}
            className={`px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-300 ${view === 'advanced' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            المراحل المتقدمة (101-200)
          </button>
        </div>
        <div className="flex gap-2">
            <button
            onClick={onStartRandomQuiz}
            className="px-6 py-2.5 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
            أسئلة عشوائية
            </button>
            <button
            onClick={onStartCustomQuiz}
            className="px-6 py-2.5 bg-indigo-500 text-white font-semibold rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
            إنشاء تحدي مخصص
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[55vh] overflow-y-auto pr-2">
        {levelsToShow.map((level, index) => (
          <div 
            key={level.id} 
            className="relative group animate-slideInUp"
            style={{ animationDelay: `${index * 25}ms`, animationDuration: '0.4s' }}
          >
            <button
              onClick={() => onSelectLevel(level)}
              className="w-full p-4 rounded-xl text-center font-bold transition-all duration-300 transform flex flex-col items-center justify-center aspect-square bg-slate-700 text-slate-200 hover:bg-cyan-600 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 border-2 border-slate-600 hover:border-cyan-400"
              aria-label={`بدء المرحلة ${level.id}: ${level.title}`}
            >
              <span className="text-4xl mb-1">{level.id}</span>
              <span className="text-sm leading-tight">{level.title}</span>
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 w-64 p-3 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10 pointer-events-none right-1/2 translate-x-1/2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-cyan-400">المرحلة {level.id}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${difficultyColors[level.difficulty]}`}>{level.difficulty}</span>
              </div>
              <p className="text-slate-300">{level.description}</p>
              <div className="absolute right-1/2 translate-x-1/2 bottom-[-8px] w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelSelectionScreen;