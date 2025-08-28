import React, { useState, useEffect } from 'react';
import { Stats } from '../types';

interface StatsScreenProps {
  stats: Stats;
  onPlayAgain: () => void;
}

const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const end = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}</span>;
};

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onPlayAgain }) => {
  const score = stats.correct * 10;
  
  const getMotivationalMessage = () => {
    const percentage = stats.total > 0 ? stats.correct / stats.total : 0;
    if (percentage >= 0.7) return "ممتاز! أداء رائع!";
    if (percentage >= 0.5) return "جيد جداً! استمر في التعلم.";
    return "لا بأس، كل رحلة تبدأ بخطوة. حاول مرة أخرى!";
  };

  return (
    <div className="p-6 md:p-10 bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 w-full max-w-4xl mx-auto text-center">
      <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 mb-4">
        انتهى التحدي!
      </h1>
      <p className="text-2xl text-slate-300 mb-8">{getMotivationalMessage()}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-white">
        <div className="bg-slate-800 p-6 rounded-2xl">
          <p className="text-xl text-slate-400 mb-2">النقاط</p>
          <p className="text-5xl font-bold text-cyan-400">
            <AnimatedNumber value={score} />
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl">
          <p className="text-xl text-slate-400 mb-2">الإجابات الصحيحة</p>
          <p className="text-5xl font-bold text-green-400">
            <AnimatedNumber value={stats.correct} />
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl">
          <p className="text-xl text-slate-400 mb-2">الإجابات الخاطئة</p>
          <p className="text-5xl font-bold text-red-400">
            <AnimatedNumber value={stats.incorrect} />
          </p>
        </div>
      </div>

      {stats.wrongQuestions.length > 0 && (
        <div className="text-right mb-10">
          <h2 className="text-3xl font-bold text-slate-300 mb-4">مراجعة الأخطاء</h2>
          <div className="space-y-4 max-h-60 overflow-y-auto bg-slate-800/50 p-4 rounded-xl">
            {stats.wrongQuestions.map((item, index) => (
              <div key={index} className="p-4 bg-slate-800 rounded-lg border-r-4 border-red-500">
                <p className="font-bold text-lg text-white mb-2">{item.question.question}</p>
                <p className="text-md"><span className="font-semibold text-red-400">إجابتك:</span> {item.selectedAnswer}</p>
                <p className="text-md"><span className="font-semibold text-green-400">الإجابة الصحيحة:</span> {item.question.correctAnswer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="mt-4 px-10 py-4 text-xl font-bold text-gray-900 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full shadow-lg hover:shadow-cyan-400/50 transform hover:scale-105 transition-all duration-300 animate-float"
      >
        العودة لخريطة الرحلة
      </button>
    </div>
  );
};

export default StatsScreen;