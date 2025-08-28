import React, { useState, useCallback } from 'react';
import { GameState, Stats, Level, RandomQuizSettings, CustomQuizSettings } from './types';
import HomeScreen from './components/HomeScreen';
import LevelSelectionScreen from './components/LevelSelectionScreen';
import QuizScreen from './components/QuizScreen';
import StatsScreen from './components/StatsScreen';
import RandomQuizSetupScreen from './components/RandomQuizSetupScreen';
import LevelQuizSetupScreen from './components/LevelQuizSetupScreen';
import CustomQuizSetupScreen from './components/CustomQuizSetupScreen';
import { LEVELS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [randomQuizSettings, setRandomQuizSettings] = useState<RandomQuizSettings | null>(null);
  const [customQuizSettings, setCustomQuizSettings] = useState<CustomQuizSettings | null>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, incorrect: 0, total: 0, wrongQuestions: [] });
  const [animationState, setAnimationState] = useState('slideInUp');
  
  const changeScreen = (updateLogic: () => void) => {
    setAnimationState('slideOutDown');
    setTimeout(() => {
      updateLogic();
      setAnimationState('slideInUp');
    }, 500);
  };

  const showLevelSelection = useCallback(() => {
    changeScreen(() => {
        setCurrentLevel(null);
        setRandomQuizSettings(null);
        setCustomQuizSettings(null);
        setGameState(GameState.LEVEL_SELECTION)
    });
  }, []);

  const handleLevelSetup = useCallback((level: Level) => {
    changeScreen(() => {
        setCurrentLevel(level);
        setGameState(GameState.LEVEL_QUIZ_SETUP);
    });
  }, []);

  // This function now accepts CustomQuizSettings, unifying level-based and fully custom quizzes.
  const startQuiz = useCallback((settings: CustomQuizSettings) => {
    changeScreen(() => {
      setCurrentLevel(null); // Level info is now within settings.title
      setRandomQuizSettings(null);
      setCustomQuizSettings(settings);
      setStats({ correct: 0, incorrect: 0, total: 0, wrongQuestions: [] });
      setGameState(GameState.QUIZ);
    });
  }, []);
  
  const showRandomQuizSetup = useCallback(() => {
    changeScreen(() => setGameState(GameState.RANDOM_QUIZ_SETUP));
  }, []);
  
  const showCustomQuizSetup = useCallback(() => {
    changeScreen(() => setGameState(GameState.CUSTOM_QUIZ_SETUP));
  }, []);

  const startRandomQuiz = useCallback((settings: RandomQuizSettings) => {
    changeScreen(() => {
        setCurrentLevel(null);
        setRandomQuizSettings(settings);
        setCustomQuizSettings(null);
        setStats({ correct: 0, incorrect: 0, total: 0, wrongQuestions: [] });
        setGameState(GameState.QUIZ);
    });
  }, []);

  const finishQuiz = useCallback((finalStats: Stats) => {
    changeScreen(() => {
      setStats(finalStats);
      setGameState(GameState.STATS);
    });
  }, []);

  const renderScreen = () => {
    switch (gameState) {
      case GameState.LEVEL_SELECTION:
        return <LevelSelectionScreen levels={LEVELS} onSelectLevel={handleLevelSetup} onStartRandomQuiz={showRandomQuizSetup} onStartCustomQuiz={showCustomQuizSetup} />;
      case GameState.RANDOM_QUIZ_SETUP:
        return <RandomQuizSetupScreen onStart={startRandomQuiz} onBack={showLevelSelection} />;
      case GameState.LEVEL_QUIZ_SETUP:
        return <LevelQuizSetupScreen level={currentLevel!} onStart={startQuiz} onBack={showLevelSelection} />;
      case GameState.CUSTOM_QUIZ_SETUP:
        return <CustomQuizSetupScreen onStart={startQuiz} onBack={showLevelSelection} />;
      case GameState.QUIZ:
        return <QuizScreen randomSettings={randomQuizSettings} customSettings={customQuizSettings} onFinish={finishQuiz} />;
      case GameState.STATS:
        return <StatsScreen stats={stats} onPlayAgain={showLevelSelection} />;
      case GameState.HOME:
      default:
        return <HomeScreen onStart={showLevelSelection} />;
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <div className={`w-full max-w-5xl mx-auto container ${animationState === 'slideOutDown' ? 'animate-slideOutDown' : 'animate-slideInUp'}`}>
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;