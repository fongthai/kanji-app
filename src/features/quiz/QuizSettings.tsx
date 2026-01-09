import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setNumberSelection,
  setIncludeKanji,
  setLevelType,
  toggleJlptLevel,
  toggleGradeLevel,
  setSelectedJlptLevels,
  setSelectedGradeLevels,
  setShowField,
  setAskField,
  toggleAskField,
  setQuestionOrder,
  setMaxTimePerQuestion,
  startQuiz,
  setQuizQuestions,
  abandonQuiz,
  resumeQuiz,
  type NumberSelection,
  type ShowField,
  type AskField,
} from './quizSlice';
import { generateQuestions } from '../../utils/questionGenerator';
import { useState, useEffect } from 'react';

const QuizSettings: React.FC = () => {
  const { t, ready } = useTranslation('quiz');
  const dispatch = useAppDispatch();
  
  const settings = useAppSelector(state => state.quiz.settings);
  const activeQuiz = useAppSelector(state => state.quiz.activeQuiz);
  const allKanjis = useAppSelector(state => state.kanji.allKanjis);
  
  const [showInterruptionModal, setShowInterruptionModal] = useState(!!activeQuiz);
  const [availableCount, setAvailableCount] = useState(0);

  // Sync interruption modal with active quiz state
  useEffect(() => {
    setShowInterruptionModal(!!activeQuiz);
  }, [activeQuiz]);

  // Filter available kanjis by current level selection
  useEffect(() => {
    const getAvailableKanjisCount = () => {
      if (settings.levelType === 'jlpt') {
        if (settings.selectedJlptLevels.length === 0) return 0;
        
        const upperLevels = settings.selectedJlptLevels.map(l => l.toUpperCase());
        
        return allKanjis.filter(k => 
          k.jlptLevel && upperLevels.includes(k.jlptLevel.toUpperCase())
        ).length;
      } else if (settings.levelType === 'grade') {
        if (settings.selectedGradeLevels.length === 0) return 0;
        
        return allKanjis.filter(k => {
          if (typeof k.gradeLevel === 'number') {
            return settings.selectedGradeLevels.includes(k.gradeLevel);
          } else if (typeof k.gradeLevel === 'string') {
            const numVal = parseInt(k.gradeLevel, 10);
            return !isNaN(numVal) && settings.selectedGradeLevels.includes(numVal);
          }
          return false;
        }).length;
      }
      
      return 0;
    };

    setAvailableCount(getAvailableKanjisCount());
  }, [settings.levelType, settings.selectedJlptLevels, settings.selectedGradeLevels, allKanjis]);

  // Wait for translations to load
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  const hasActiveQuiz = !!activeQuiz;
  
  const hasLevelsSelected = 
    (settings.levelType === 'jlpt' && settings.selectedJlptLevels.length > 0) ||
    (settings.levelType === 'grade' && settings.selectedGradeLevels.length > 0);
  
  const hasContentSelected = settings.includeKanji || settings.includeVocabulary;
  
  const canStartQuiz = hasLevelsSelected && hasContentSelected && availableCount > 0;

  const handleStartQuiz = () => {
    if (hasActiveQuiz) {
      setShowInterruptionModal(true);
    } else {
      const questions = generateQuestions(settings, allKanjis);
      
      if (questions.length === 0) {
        alert('No questions could be generated. Please adjust your filters.');
        return;
      }
      
      dispatch(startQuiz({ allKanjis }));
      dispatch(setQuizQuestions(questions));
    }
  };

  const handleResumeQuiz = () => {
    dispatch(resumeQuiz());
    setShowInterruptionModal(false);
  };

  const handleStartNewQuiz = () => {
    const questions = generateQuestions(settings, allKanjis);
    
    if (questions.length === 0) {
      alert('No questions could be generated. Please adjust your filters.');
      return;
    }
    
    dispatch(abandonQuiz());
    dispatch(startQuiz({ allKanjis }));
    dispatch(setQuizQuestions(questions));
    setShowInterruptionModal(false);
  };

  const handleCancelInterruption = () => {
    setShowInterruptionModal(false);
  };

  const handleSelectAllJlpt = () => {
    dispatch(setSelectedJlptLevels(['n5', 'n4', 'n3', 'n2', 'n1']));
  };

  const handleSelectNoneJlpt = () => {
    dispatch(setSelectedJlptLevels([]));
  };

  const handleSelectAllGrade = () => {
    dispatch(setSelectedGradeLevels([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
  };

  const handleSelectNoneGrade = () => {
    dispatch(setSelectedGradeLevels([]));
  };

  const handleShowFieldChange = (value: ShowField) => {
    dispatch(setShowField(value));
  };

  const handleAskFieldChange = (value: AskField) => {
    dispatch(setAskField(value));
  };

  const getAskFieldOptions = (): AskField[] => {
    const allOptions: AskField[] = ['kanji', 'hanViet', 'onyomi', 'vietnamese', 'english'];
    return allOptions.filter(option => option !== settings.showField);
  };

  const getShowFieldOptions = (): ShowField[] => {
    const allOptions: ShowField[] = ['kanji', 'hanViet', 'onyomi', 'vietnamese', 'english'];
    return allOptions.filter(option => option !== settings.askField);
  };

  const showFieldOptions = settings.askField === 'kanji' 
    ? ['kanji', 'hanViet', 'onyomi', 'vietnamese', 'english'] as ShowField[]
    : getShowFieldOptions();
    
  const askFieldOptions = settings.showField === 'kanji'
    ? ['kanji', 'hanViet', 'onyomi', 'vietnamese', 'english'] as AskField[]
    : getAskFieldOptions();

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{t('settings.title')}</h1>
          <p className="text-sm text-gray-400 mt-1">{t('settings.description')}</p>
        </div>

        <div className="max-w-5xl mx-auto w-full space-y-6">
          <div className="bg-gray-700 rounded-xl p-6 space-y-6">
            
            <div className="flex flex-wrap items-center gap-2 text-white text-base md:text-lg">
              <span className="text-gray-300">{t('settings.giveMe')}</span>
              
              <select
                value={settings.numberSelection}
                onChange={(e) => dispatch(setNumberSelection(e.target.value as NumberSelection))}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="all">{t('settings.all') || 'all'}</option>
                <option value="random-10">{t('settings.random10') || 'random 10'}</option>
                <option value="random-20">{t('settings.random20') || 'random 20'}</option>
                <option value="random-30">{t('settings.random30') || 'random 30'}</option>
                <option value="random-50">{t('settings.random50') || 'random 50'}</option>
                <option value="random-100">{t('settings.random100') || 'random 100'}</option>
              </select>

              <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-750 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.includeKanji}
                  onChange={(e) => dispatch(setIncludeKanji(e.target.checked))}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-1 focus:ring-blue-500"
                />
                <span className="font-medium">{t('settings.kanji')}</span>
              </label>

              <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded cursor-not-allowed opacity-60 relative">
                <input
                  type="checkbox"
                  checked={settings.includeVocabulary}
                  disabled
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 cursor-not-allowed"
                />
                <span className="font-medium">{t('settings.vocabularies')}</span>
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  🔜 {t('settings.soon')}
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-white text-base md:text-lg">
              <span className="text-gray-300">{t('settings.from')}</span>
              
              <select
                value={settings.levelType}
                onChange={(e) => dispatch(setLevelType(e.target.value as 'jlpt' | 'grade'))}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="jlpt">JLPT</option>
                <option value="grade">{t('settings.level.grade')}</option>
              </select>

              <span className="text-gray-300">{t('settings.levels')}</span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                {settings.levelType === 'jlpt' ? (
                  <>
                    <button
                      onClick={handleSelectAllJlpt}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      {t('settings.selectAll')}
                    </button>
                    <button
                      onClick={handleSelectNoneJlpt}
                      className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                    >
                      {t('settings.clear')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSelectAllGrade}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      {t('settings.selectAll')}
                    </button>
                    <button
                      onClick={handleSelectNoneGrade}
                      className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                    >
                      {t('settings.clear')}
                    </button>
                  </>
                )}
              </div>

              {settings.levelType === 'jlpt' ? (
                <div className="flex flex-wrap gap-2">
                  {['n5', 'n4', 'n3', 'n2', 'n1'].map((level) => (
                    <button
                      key={level}
                      onClick={() => dispatch(toggleJlptLevel(level))}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        settings.selectedJlptLevels.includes(level)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((level) => (
                    <button
                      key={level}
                      onClick={() => dispatch(toggleGradeLevel(level))}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        settings.selectedGradeLevels.includes(level)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-white text-base md:text-lg">
              <span className="text-gray-300">{t('settings.showMe')}</span>
              
              <select
                value={settings.showField}
                onChange={(e) => handleShowFieldChange(e.target.value as ShowField)}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                {showFieldOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'hanViet' ? 'Hán-Việt' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>

              <span className="text-gray-300">{t('settings.illAnswerWith')}</span>
              
              {settings.showField === 'kanji' ? (
                <div className="flex flex-wrap gap-2">
                  {['hanViet', 'onyomi', 'vietnamese', 'english'].map((option) => (
                    <button
                      key={option}
                      onClick={() => dispatch(toggleAskField(option as AskField))}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        settings.askFields.includes(option as AskField)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      {option === 'hanViet' ? 'Hán-Việt' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={settings.askField}
                  onChange={(e) => handleAskFieldChange(e.target.value as AskField)}
                  className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {askFieldOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'hanViet' ? 'Hán-Việt' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-white text-base md:text-lg">
              <span className="text-gray-300">{t('settings.in')}</span>
              
              <select
                value={settings.questionOrder}
                onChange={(e) => dispatch(setQuestionOrder(e.target.value as 'sequential' | 'random'))}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="sequential">{t('settings.questionOrder.sequential')}</option>
                <option value="random">{t('settings.questionOrder.random')}</option>
              </select>

              <span className="text-gray-300">{t('settings.order')}</span>
              
              <select
                value={settings.maxTimePerQuestion}
                onChange={(e) => dispatch(setMaxTimePerQuestion(Number(e.target.value) as 10 | 30 | 60 | 0))}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={0}>{t('settings.unlimited')}</option>
              </select>

              <span className="text-gray-300">{t('settings.secondsPerQuestion')}</span>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-lg font-semibold ${availableCount > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {availableCount > 0 
                ? t('settings.kanjiAvailable', { count: availableCount, plural: availableCount > 1 ? 's' : '' })
                : t('settings.noKanjisMatch')}
            </p>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={!canStartQuiz}
            className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${
              canStartQuiz
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {t('settings.startQuiz')}
          </button>
        </div>
      </div>

      {showInterruptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white text-center">
              {t('resumeQuiz.title')}
            </h3>
            <p className="text-gray-300 text-center">
              {t('resumeQuiz.description')}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleResumeQuiz}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                {t('resumeQuiz.continueQuiz')}
              </button>
              <button
                onClick={handleStartNewQuiz}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {t('resumeQuiz.startNewQuiz')}
              </button>
              <button
                onClick={handleCancelInterruption}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
              >
                {t('resumeQuiz.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizSettings;
