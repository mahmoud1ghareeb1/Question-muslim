import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, Stats, RandomQuizSettings, CustomQuizSettings } from '../types';
import { generateRandomQuestions } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CheckIcon, XIcon, ClockIcon } from './icons';

interface QuizScreenProps {
  randomSettings: RandomQuizSettings | null;
  customSettings: CustomQuizSettings | null;
  onFinish: (stats: Stats) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ randomSettings, customSettings, onFinish }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [stats, setStats] = useState<Stats>({ correct: 0, incorrect: 0, total: 0, wrongQuestions: [] });
  const [feedbackClass, setFeedbackClass] = useState('');
  const [scoreKey, setScoreKey] = useState(0);
  
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const totalQuestions = useMemo(() => {
    if (customSettings) return customSettings.questions.length;
    if (randomSettings) return randomSettings.count;
    return 0;
  }, [randomSettings, customSettings]);

  const quizTitle = useMemo(() => {
    if (customSettings) return customSettings.title;
    return 'تحدي عشوائي';
  }, [customSettings]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (customSettings) {
            if (customSettings.questions.length === 0) throw new Error("لا توجد أسئلة لبدء هذا التحدي.");
            setQuestions(customSettings.questions);
            return;
        }

        let fetchedQuestions;
        if (randomSettings) {
          fetchedQuestions = await generateRandomQuestions(randomSettings);
        }
        else {
          throw new Error("لم يتم تحديد إعدادات التحدي.");
        }
        
        const questionsWithIdsAndTime = fetchedQuestions.map(q => ({
            ...q, 
            id: crypto.randomUUID(),
            time: randomSettings?.timePerQuestion || 20 // Assign time from settings for random quizzes
        }));
        setQuestions(questionsWithIdsAndTime);

      } catch (err: any) {
        setError(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [randomSettings, customSettings]);

  useEffect(() => {
    // Set the timer when the question changes
    if (currentQuestion) {
        setTimeLeft(currentQuestion.time || 20); // Use question's time or a default
    }
  }, [currentQuestion]);


  const handleNextQuestion = useCallback(() => {
    setFeedbackClass('');
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      onFinish(stats);
    }
  }, [currentQuestionIndex, onFinish, stats, totalQuestions]);

  useEffect(() => {
    if (isAnswered || !currentQuestion) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up! Count as incorrect, but DON'T show shake animation.
      setIsAnswered(true);
      setStats(prev => ({ 
        ...prev, 
        incorrect: prev.incorrect + 1, 
        total: prev.total + 1,
        wrongQuestions: [...prev.wrongQuestions, { question: currentQuestion, selectedAnswer: "نفذ الوقت" }] 
      }));
      setTimeout(handleNextQuestion, 1500);
    }
  }, [timeLeft, isAnswered, handleNextQuestion, currentQuestion, stats, onFinish]);

  const handleAnswerClick = (answer: string) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedAnswer(answer);

    if (answer === currentQuestion.correctAnswer) {
      setFeedbackClass('correct');
      setStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      setScoreKey(k => k + 1);
    } else {
      setFeedbackClass('incorrect'); // Shake effect for actively wrong answers
      setStats(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        total: prev.total + 1,
        wrongQuestions: [...prev.wrongQuestions, { question: currentQuestion, selectedAnswer: answer }]
      }));
    }
    
    setTimeout(handleNextQuestion, 2000);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-slate-700 hover:bg-slate-600 scale-100 hover:scale-105';
    }
    if (option === currentQuestion.correctAnswer) {
      return 'bg-green-600 scale-105 ring-4 ring-green-400/50 shadow-lg shadow-green-400/30';
    }
    if (option === selectedAnswer) {
      return 'bg-red-600 scale-100';
    }
    return 'bg-slate-800 opacity-60 scale-100';
  };

  if (loading) return <LoadingSpinner message={`جاري تحضير أسئلة: ${quizTitle}`} />;
  if (error) return <div className="text-center text-red-400 text-2xl p-8 bg-slate-800/50 rounded-2xl">{error}</div>;
  if (!currentQuestion) return null;

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const timePercentage = (timeLeft / (currentQuestion.time || 20)) * 100;

  return (
    <div className={`p-6 md:p-10 bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 w-full max-w-4xl mx-auto transition-transform duration-500 ${feedbackClass === 'incorrect' ? 'animate-shake' : ''}`}>
      <header className="mb-6">
         <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-cyan-300">{quizTitle}</h1>
        </div>
        <div className="flex justify-between items-center text-lg font-bold text-slate-300 mb-3">
          <span><span className="text-cyan-400 text-2xl">{currentQuestionIndex + 1}</span>/{totalQuestions}</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full">
            <ClockIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 text-2xl font-mono">{timeLeft}</span>
          </div>
          <span key={scoreKey} className={`text-green-400 text-2xl ${feedbackClass === 'correct' ? 'animate-pop-in' : ''}`}>{stats.correct * 10}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </header>

      <main key={currentQuestion.id} className="animate-slideInUp" style={{animationDuration: '0.4s'}}>
        <div className="bg-slate-800 p-6 rounded-2xl mb-8 min-h-[120px] flex items-center justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white">{currentQuestion.question}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              disabled={isAnswered}
              className={`p-5 rounded-xl text-xl font-semibold text-right transition-all duration-300 transform flex items-center justify-between ${getButtonClass(option)} ${isAnswered ? 'cursor-not-allowed' : ''}`}
            >
              <span>{option}</span>
              {isAnswered && (
                option === currentQuestion.correctAnswer ? <CheckIcon className="w-8 h-8 text-white" /> : 
                (option === selectedAnswer && <XIcon className="w-8 h-8 text-white" />)
              )}
            </button>
          ))}
        </div>
      </main>

      <footer className="mt-8">
        <div className="w-full bg-slate-700 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500 animate-pulse-danger' : 'bg-yellow-400'}`} style={{width: `${timePercentage}%`}}></div>
        </div>
      </footer>
    </div>
  );
};

export default QuizScreen;