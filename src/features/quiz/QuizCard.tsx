import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { submitAnswer, nextQuestion, completeQuiz, abandonQuiz, quitAndCalculate } from './quizSlice';
import { useState, useEffect, useRef } from 'react';

const QuizCard: React.FC = () => {
  const { t } = useTranslation('quiz');
  const dispatch = useAppDispatch();
  
  const activeQuiz = useAppSelector(state => state.quiz.activeQuiz);
  const settings = useAppSelector(state => state.quiz.settings);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(settings.maxTimePerQuestion);
  const [startTime] = useState(Date.now());
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  
  const timerRef = useRef<number | null>(null);

  if (!activeQuiz) return null;

  const currentQuestion = activeQuiz.questions[activeQuiz.currentIndex];
  const progress = ((activeQuiz.currentIndex + 1) / activeQuiz.questions.length) * 100;
  const isLastQuestion = activeQuiz.currentIndex === activeQuiz.questions.length - 1;

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null);
    setShowAnswer(false);
    setTimeLeft(settings.maxTimePerQuestion === 0 ? 0 : settings.maxTimePerQuestion);
    setIsFlipping(false);
    
    // Trigger entrance animation
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 100);
    return () => clearTimeout(timer);
  }, [activeQuiz.currentIndex, settings.maxTimePerQuestion]);

  // Countdown timer (or count-up for unlimited time)
  useEffect(() => {
    if (showAnswer || activeQuiz.paused) return;

    const isUnlimited = settings.maxTimePerQuestion === 0;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (isUnlimited) {
          // Unlimited time: count UP
          return prev + 1;
        } else {
          // Limited time: count DOWN
          if (prev <= 1) {
            // Time's up - auto submit with no answer
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            
            dispatch(submitAnswer({
              questionId: currentQuestion.id,
              selectedIndex: null,
              timeSpent,
              correct: false,
            }));

            setShowAnswer(true);
            
            // Trigger flip animation then advance
            setTimeout(() => {
              setIsFlipping(true);
              setTimeout(() => {
                if (isLastQuestion) {
                  dispatch(completeQuiz());
                } else {
                  dispatch(nextQuestion());
                }
              }, 1000);
            }, 1200);
            
            return 0;
          }
          return prev - 1;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showAnswer, activeQuiz.paused, activeQuiz.currentIndex, settings.maxTimePerQuestion, startTime, currentQuestion.id, isLastQuestion, dispatch]);

  const handleSelectOption = (index: number) => {
    if (showAnswer) return;
    setSelectedIndex(index);
  };

  const handleNext = () => {
    if (selectedIndex === null || showAnswer) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedIndex === currentQuestion.correctIndex;

    dispatch(submitAnswer({
      questionId: currentQuestion.id,
      selectedIndex,
      timeSpent,
      correct: isCorrect,
    }));

    setShowAnswer(true);

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Trigger flip animation then advance
    setTimeout(() => {
      setIsFlipping(true);
      setTimeout(() => {
        if (isLastQuestion) {
          dispatch(completeQuiz());
        } else {
          dispatch(nextQuestion());
        }
      }, 1000); // Wait for flip animation (1s)
    }, 1200); // Show answer for 1.2s before flip
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showAnswer) return;

      const key = e.key.toLowerCase();
      if (key === 'a') handleSelectOption(0);
      else if (key === 'b') handleSelectOption(1);
      else if (key === 'c') handleSelectOption(2);
      else if (key === 'd') handleSelectOption(3);
      else if (key === 'enter' && selectedIndex !== null) handleNext();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, selectedIndex]);

  // Timer color and pulse
  const getTimerColor = (): string => {
    if (settings.maxTimePerQuestion === 0) return 'text-blue-500'; // Unlimited time: blue
    const percentage = (timeLeft / settings.maxTimePerQuestion) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const shouldPulse = settings.maxTimePerQuestion > 0 && timeLeft <= 3;

  const handleQuitWithoutSaving = () => {
    dispatch(abandonQuiz());
    setShowQuitModal(false);
  };

  const handleQuitAndCalculate = () => {
    dispatch(quitAndCalculate());
    setShowQuitModal(false);
  };

  return (
    <>
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Fixed Header - 80px */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">{t('quiz.title')}</h2>
          <button
            onClick={() => setShowQuitModal(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t('quit.title')}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{t('progress.question', { current: activeQuiz.currentIndex + 1, total: activeQuiz.questions.length })}</span>
            <span>{t('progress.progress', { percent: Math.round(progress) })}</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3D Card Container */}
      <div className="flex-1 min-h-0 px-4" style={{ perspective: '1500px' }}>
        <div 
          className="h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipping 
              ? 'rotateY(180deg) scale(0.9)' 
              : isEntering 
                ? 'rotateY(-10deg) scale(0.98)' 
                : 'rotateY(0deg) scale(1)',
            opacity: isFlipping ? 0 : 1,
            transition: isFlipping 
              ? 'transform 1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 500ms ease-out'
              : 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease-in',
          }}
        >
          {/* Card Front (Current Question) */}
          <div 
            className="absolute inset-0 overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              opacity: isEntering ? 0.5 : 1,
              transition: 'opacity 400ms ease-in',
            }}
          >
            <div className="flex flex-col space-y-4 pb-4">
              {/* Countdown Timer - Fixed Size */}
              <div className="flex justify-center py-2 transition-all duration-500"
                   style={{
                     transform: isEntering ? 'translateY(-20px)' : 'translateY(0)',
                     opacity: isEntering ? 0 : 1,
                     transitionDelay: '100ms',
                   }}>
                <div className={`relative w-20 h-20 flex-shrink-0 ${shouldPulse ? 'animate-pulse' : ''}`}>
                  {/* Background circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="none"
                      className="text-gray-700"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="none"
                      className={`${getTimerColor()} transition-all duration-1000`}
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={settings.maxTimePerQuestion === 0 ? '0' : `${2 * Math.PI * 34 * (1 - timeLeft / settings.maxTimePerQuestion)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Time text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${getTimerColor()}`}>
                      {settings.maxTimePerQuestion === 0 ? `${timeLeft}s` : `${timeLeft}s`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Card - Elevated with Shadow */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 min-h-[120px] flex items-center justify-center shadow-2xl border border-gray-600 transition-all duration-500"
                   style={{
                     transform: isEntering ? 'translateY(30px) scale(0.95)' : 'translateY(0) scale(1)',
                     opacity: isEntering ? 0 : 1,
                     transitionDelay: '200ms',
                   }}>
                <p className="text-center text-white break-words max-w-full leading-tight" 
                   style={{ 
                     fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
                     wordBreak: 'break-word',
                     overflowWrap: 'break-word'
                   }}>
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Answer Options - Card Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                   style={{
                     transform: isEntering ? 'translateY(40px)' : 'translateY(0)',
                     opacity: isEntering ? 0 : 1,
                     transition: 'all 500ms ease-out',
                     transitionDelay: '300ms',
                   }}>
                {currentQuestion.options.map((option: string, index: number) => {
                  const optionKey = ['A', 'B', 'C', 'D'][index];
                  const isSelected = selectedIndex === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  
                  let buttonClass = 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg';
                  
                  if (showAnswer) {
                    if (isCorrect) {
                      buttonClass = 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-2xl shadow-green-500/50';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl shadow-red-500/50';
                    } else {
                      buttonClass = 'bg-gray-800 text-gray-500';
                    }
                  } else if (isSelected) {
                    buttonClass = 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50 scale-105';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      disabled={showAnswer}
                      className={`${buttonClass} rounded-xl p-4 text-left transition-all duration-300 flex items-center gap-3 min-h-[80px] border border-gray-600`}
                    >
                      <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-900/50 flex items-center justify-center font-bold text-lg">
                        {optionKey}
                      </span>
                      <span className="text-xl break-words flex-1 line-clamp-3">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer - Next Button - 80px */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-gradient-to-t from-gray-800 to-transparent">
        <button
          onClick={handleNext}
          disabled={selectedIndex === null || showAnswer}
          className={`w-full py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
            selectedIndex === null || showAnswer
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-2xl hover:scale-[1.02]'
          }`}
        >
          {isLastQuestion ? t('quiz.finish') : t('quiz.next')}
        </button>
      </div>
    </div>

    {/* Quit Modal */}
    {showQuitModal && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-white text-center">
            {t('quit.title')}
          </h3>
          <p className="text-gray-300 text-center">
            {t('quit.description')}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleQuitAndCalculate}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              {t('quit.quitAndCalculate')}
            </button>
            <button
              onClick={handleQuitWithoutSaving}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              {t('quit.quitWithoutSaving')}
            </button>
            <button
              onClick={() => setShowQuitModal(false)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
            >
              {t('quit.cancel')}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default QuizCard;
