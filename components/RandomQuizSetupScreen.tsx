import React, { useState } from 'react';
import { Difficulty, RandomQuizSettings } from '../types';
import { MIN_RANDOM_QUESTIONS, MAX_RANDOM_QUESTIONS, TIMER_OPTIONS } from '../constants';
import { ArrowRightIcon } from './icons';

interface RandomQuizSetupScreenProps {
  onStart: (settings: RandomQuizSettings) => void;
  onBack: () => void;
}

const RandomQuizSetupScreen: React.FC<RandomQuizSetupScreenProps> = ({ onStart, onBack }) => {
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('متوسط');
  const [timePerQuestion, setTimePerQuestion] = useState(20);

  const difficulties: Difficulty[] = ['سهل', 'متوسط', 'صعب'];

  const handleSubmit = () => {
    onStart({ count, difficulty, timePerQuestion });
  };

  return (
    <div className="p-6 md:p-10 bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 w-full max-w-2xl mx-auto text-center">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">
          إعداد التحدي العشوائي
        </h1>
        <button
          onClick={onBack}
          className="p-3 bg-slate-700 rounded-full text-cyan-300 hover:bg-cyan-800/60 transition-colors"
          aria-label="العودة"
        >
          <ArrowRightIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>
      
      <div className="space-y-8">
        {/* Number of Questions Slider */}
        <div>
          <label htmlFor="question-count" className="block text-xl font-bold text-slate-300 mb-4">
            عدد الأسئلة: <span className="text-cyan-400 text-2xl">{count}</span>
          </label>
          <input
            id="question-count"
            type="range"
            min={MIN_RANDOM_QUESTIONS}
            max={MAX_RANDOM_QUESTIONS}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Difficulty Selection */}
        <div>
          <p className="block text-xl font-bold text-slate-300 mb-4">مستوى الصعوبة:</p>
          <div className="grid grid-cols-3 gap-4">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-4 rounded-xl text-xl font-semibold transition-all duration-200 border-2 ${
                  difficulty === d 
                  ? 'bg-cyan-500 border-cyan-400 text-white scale-105 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Time per Question Selection */}
        <div>
          <p className="block text-xl font-bold text-slate-300 mb-4">مدة الإجابة (ثواني):</p>
          <div className="grid grid-cols-4 gap-4">
            {TIMER_OPTIONS.map((time) => (
              <button
                key={time}
                onClick={() => setTimePerQuestion(time)}
                className={`p-4 rounded-xl text-xl font-semibold transition-all duration-200 border-2 ${
                  timePerQuestion === time 
                  ? 'bg-cyan-500 border-cyan-400 text-white scale-105 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-12 w-full px-10 py-4 text-2xl font-bold text-gray-900 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full shadow-lg hover:shadow-cyan-400/50 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 ring-offset-slate-900 ring-cyan-400"
      >
        ابدأ التحدي
      </button>
    </div>
  );
};

export default RandomQuizSetupScreen;