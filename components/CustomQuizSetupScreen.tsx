import React, { useState, useMemo, useRef } from 'react';
import { Level, CustomQuizSettings, Question } from '../types';
import { LEVELS } from '../constants';
import { generateQuestions } from '../services/geminiService';
import { ArrowRightIcon, PencilIcon, XIcon, DragHandleIcon, ClockIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface CustomQuizSetupScreenProps {
  onStart: (settings: CustomQuizSettings) => void;
  onBack: () => void;
}

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

const CustomQuizSetupScreen: React.FC<CustomQuizSetupScreenProps> = ({ onStart, onBack }) => {
  const [customTitle, setCustomTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loadingTopicId, setLoadingTopicId] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const filteredLevels = useMemo(() => {
    if (!searchQuery) return LEVELS;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return LEVELS.filter(level => 
      level.title.toLowerCase().includes(lowerCaseQuery) ||
      level.description.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery]);

  const handleGenerateQuestions = async (level: Level) => {
    setLoadingTopicId(level.id);
    try {
      const newRawQuestions = await generateQuestions(level, 5);
      const newQuestions = newRawQuestions.map(q => ({ ...q, id: crypto.randomUUID(), time: 20 }));
      setQuestions(prev => [...prev, ...newQuestions]);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء توليد الأسئلة. حاول مرة أخرى.');
    } finally {
      setLoadingTopicId(null);
    }
  };

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
    if (customTitle.trim() === '' || questions.length === 0) {
      alert('الرجاء كتابة اسم للتحدي وإضافة سؤال واحد على الأقل.');
      return;
    }
    onStart({ title: customTitle, questions });
  };

  return (
    <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 w-full max-w-6xl mx-auto">
      {editingQuestion && <QuestionEditModal question={editingQuestion} onSave={handleQuestionUpdate} onClose={() => setEditingQuestion(null)} />}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
          استوديو تصميم الاختبارات
        </h1>
        <button onClick={onBack} className="p-3 bg-slate-700 rounded-full text-purple-300 hover:bg-purple-800/60 transition-colors" aria-label="العودة">
          <ArrowRightIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Design Area */}
        <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col h-[65vh]">
          <h2 className="text-xl font-bold text-slate-300 mb-3">لوحة تصميم التحدي</h2>
          <div className="mb-4">
            <input id="challenge-name" type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="اكتب اسم التحدي هنا..." className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex-grow space-y-2 overflow-y-auto pr-2">
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
                <DragHandleIcon className="w-5 h-5 text-slate-400" />
                <p className="flex-grow text-white truncate">{index + 1}. {q.question}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-yellow-400" />
                    <input 
                        type="number"
                        value={q.time || 20}
                        onChange={(e) => handleQuestionTimeChange(q.id, parseInt(e.target.value, 10))}
                        className="w-16 bg-slate-800 border border-slate-600 rounded-md p-1 text-center text-white focus:ring-2 focus:ring-purple-500"
                        min="5"
                        max="120"
                        aria-label={`مدة السؤال ${index + 1}`}
                    />
                </div>
                <button onClick={() => setEditingQuestion(q)} className="p-1.5 text-slate-400 hover:text-cyan-300"><PencilIcon className="w-5 h-5" /></button>
                <button onClick={() => handleQuestionDelete(q.id)} className="p-1.5 text-slate-400 hover:text-red-400"><XIcon className="w-5 h-5" /></button>
              </div>
            ))}
             {questions.length === 0 && <p className="text-center text-slate-400 mt-10">لوحة التصميم فارغة. ابدأ بتوليد بعض الأسئلة من بنك المواضيع!</p>}
          </div>
          <button onClick={handleSubmit} disabled={customTitle.trim() === '' || questions.length === 0} className="mt-4 w-full px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none">
            ابدأ التحدي ({questions.length} سؤال)
          </button>
        </div>

        {/* Right Panel: Topic Bank */}
        <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col h-[65vh]">
            <h2 className="text-xl font-bold text-slate-300 mb-3">بنك المواضيع</h2>
            <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ابحث عن موضوع..." className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 mb-4 text-white focus:ring-2 focus:ring-purple-500" />
            <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                {filteredLevels.map(level => (
                    <div key={level.id} className="flex items-center justify-between p-2 pl-3 bg-slate-700 rounded-lg">
                       <p className="font-semibold text-white truncate">{level.id}. {level.title}</p>
                       <button onClick={() => handleGenerateQuestions(level)} disabled={loadingTopicId === level.id} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-semibold text-sm disabled:bg-slate-500 disabled:cursor-wait w-36 text-center">
                           {loadingTopicId === level.id ? 'جاري...' : '➕ توليد 5 أسئلة'}
                       </button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CustomQuizSetupScreen;