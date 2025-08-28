import React, { useState, useEffect, useRef } from 'react';
import { Level, Question, CustomQuizSettings } from '../types';
import { TOTAL_QUESTIONS } from '../constants';
import { generateQuestions } from '../services/geminiService';
import { ArrowRightIcon, PencilIcon, XIcon, DragHandleIcon, ClockIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface LevelQuizSetupScreenProps {
  level: Level;
  onStart: (settings: CustomQuizSettings) => void;
  onBack: () => void;
}

// Re-using the QuestionEditModal from CustomQuizSetupScreen
const QuestionEditModal: React.FC<{
  question: Question;
  onSave: (updatedQuestion: Question) => void;
  onClose: () => void;
}> = ({ question, onSave, onClose }) => {
  const [editedQuestion, setEditedQuestion] = useState(question.question);
  const [editedOptions, setEditedOptions] = useState(question.options);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedOptions];
    newOptions[index] = value;
    setEditedOptions(newOptions);
  };

  const handleSave = () => {
    if (!editedOptions.includes(correctAnswer)) {
      alert("الإجابة الصحيحة المحددة لم تعد موجودة في الخيارات. الرجاء تحديثها.");
      return;
    }
    onSave({ ...question, question: editedQuestion, options: editedOptions, correctAnswer });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-slate-600 animate-slideInUp" style={{animationDuration: '0.3s'}} onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-cyan-300 mb-6">تعديل السؤال</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">نص السؤال</label>
            <textarea value={editedQuestion} onChange={(e) => setEditedQuestion(e.target.value)} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الخيارات (حدد الإجابة الصحيحة)</label>
            <div className="space-y-2">
              {editedOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="correct-answer" checked={correctAnswer === opt} onChange={() => setCorrectAnswer(opt)} className="w-5 h-5 accent-cyan-400"/>
                  <input type="text" value={opt} onChange={e => handleOptionChange(i, e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold">إلغاء</button>
          <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold text-white">حفظ</button>
        </div>
      </div>
    </div>
  );
};


const LevelQuizSetupScreen: React.FC<LevelQuizSetupScreenProps> = ({ level, onStart, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const newRawQuestions = await generateQuestions(level, TOTAL_QUESTIONS);
            // Add unique ID and default time to each question
            const newQuestions = newRawQuestions.map(q => ({ ...q, id: crypto.randomUUID(), time: 20 }));
            setQuestions(newQuestions);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء توليد الأسئلة.');
        } finally {
            setLoading(false);
        }
    };
    loadQuestions();
  }, [level]);

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };
  
  const handleQuestionDelete = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };
  
  const handleQuestionTimeChange = (id: string, time: number) => {
    if (isNaN(time) || time < 5) time = 5;
    if (time > 120) time = 120;
    setQuestions(prev => 
        prev.map(q => q.id === id ? { ...q, time: time } : q)
    );
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const questionsCopy = [...questions];
    const draggedItemContent = questionsCopy.splice(dragItem.current, 1)[0];
    questionsCopy.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setQuestions(questionsCopy);
  };

  const handleSubmit = () => {
    if (questions.length === 0) {
        alert('يجب أن يحتوي التحدي على سؤال واحد على الأقل.');
        return;
    }
    onStart({ title: level.title, questions });
  };

  const difficultyColors: { [key: string]: string } = {
    'سهل': 'border-green-500 text-green-400',
    'متوسط': 'border-yellow-500 text-yellow-400',
    'صعب': 'border-red-500 text-red-400',
  };

  const renderContent = () => {
    if (loading) return <div className="mt-8"><LoadingSpinner message={`جاري تحضير أسئلة المرحلة...`} /></div>;
    if (error) return <div className="text-center text-red-400 text-2xl p-8 bg-slate-800/50 rounded-2xl">{error}</div>;

    return (
        <>
            <div className="my-6 flex-grow space-y-2 overflow-y-auto pr-2 bg-slate-800/50 p-3 rounded-lg min-h-[350px] max-h-[50vh]">
                <h3 className="text-lg font-bold text-slate-300 mb-2">قائمة الأسئلة ({questions.length}):</h3>
                {questions.map((q, index) => (
                <div
                    key={q.id}
                    draggable
                    onDragStart={() => dragItem.current = index}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={handleDragSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg cursor-grab active:cursor-grabbing"
                >
                    <DragHandleIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <p className="flex-grow text-white truncate">{index + 1}. {q.question}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-yellow-400" />
                        <input 
                            type="number"
                            value={q.time || 20}
                            onChange={(e) => handleQuestionTimeChange(q.id, parseInt(e.target.value, 10))}
                            className="w-16 bg-slate-800 border border-slate-600 rounded-md p-1 text-center text-white focus:ring-2 focus:ring-cyan-500"
                            min="5"
                            max="120"
                            aria-label={`مدة السؤال ${index + 1}`}
                        />
                         <span className="text-sm text-slate-400">ث</span>
                    </div>
                    <button onClick={() => setEditingQuestion(q)} className="p-1.5 text-slate-400 hover:text-cyan-300 flex-shrink-0" aria-label="تعديل السؤال"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleQuestionDelete(q.id)} className="p-1.5 text-slate-400 hover:text-red-400 flex-shrink-0" aria-label="حذف السؤال"><XIcon className="w-5 h-5" /></button>
                </div>
                ))}
                {questions.length === 0 && <p className="text-center text-slate-400 mt-10">تم حذف جميع الأسئلة. لا يمكن بدء التحدي.</p>}
            </div>

            <button
                onClick={handleSubmit}
                disabled={questions.length === 0}
                className="mt-6 w-full px-10 py-4 text-2xl font-bold text-gray-900 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full shadow-lg hover:shadow-cyan-400/50 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 ring-offset-slate-900 ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ابدأ التحدي
            </button>
        </>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 w-full max-w-4xl mx-auto flex flex-col">
      {editingQuestion && <QuestionEditModal question={editingQuestion} onSave={handleQuestionUpdate} onClose={() => setEditingQuestion(null)} />}
      <header className="flex justify-between items-start mb-4">
        <div className="text-right">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">
                غرفة التحكم
            </h1>
            <p className={`text-2xl font-bold mt-1 ${difficultyColors[level.difficulty]}`}>{level.title}</p>
        </div>
        <button
          onClick={onBack}
          className="p-3 bg-slate-700 rounded-full text-cyan-300 hover:bg-cyan-800/60 transition-colors"
          aria-label="العودة"
        >
          <ArrowRightIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </header>
      
      {renderContent()}

    </div>
  );
};

export default LevelQuizSetupScreen;