import React from 'react';

interface HomeScreenProps {
  onStart: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700">
      <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 mb-4 animate-glow">
        رحلة التحدي الإيماني
      </h1>
      <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl">
        اختبر معلوماتك الدينية عبر 200 مرحلة من المعرفة والمتعة. هل أنت مستعد لبدء رحلتك؟
      </p>
      <button
        onClick={onStart}
        className="mt-8 px-12 py-5 text-2xl font-bold text-gray-900 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full shadow-lg hover:shadow-cyan-400/50 transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 ring-offset-slate-900 ring-cyan-400 animate-float"
      >
        ابدأ الرحلة
      </button>
    </div>
  );
};

export default HomeScreen;