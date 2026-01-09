import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setShowSettings, setReviewMode, restartQuiz } from './quizSlice';
import { useState } from 'react';

const QuizReview: React.FC = () => {
  const { t } = useTranslation('quiz');
  const dispatch = useAppDispatch();
  
  const history = useAppSelector(state => state.quiz.history);
  
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-gray-400">
        <p className="text-xl mb-6">{t('review.noResults')}</p>
        <button
          onClick={() => {
            dispatch(setReviewMode(false));
            dispatch(setShowSettings(true));
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          {t('review.backToSettings')}
        </button>
      </div>
    );
  }

  const currentResult = history[selectedResultIndex];
  const correctCount = currentResult.answers.filter(a => a.correct).length;
  const totalQuestions = currentResult.answers.length;
  const score = currentResult.score;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // Calculate average time per question
  const totalTime = currentResult.answers.reduce((sum, a) => sum + a.timeSpent, 0);
  const avgTime = Math.round(totalTime / totalQuestions);

  // Question type breakdown
  const typeBreakdown = {
    kanjiToHanViet: { correct: 0, total: 0 },
    hanVietToKanji: { correct: 0, total: 0 },
    kanjiToMeaning: { correct: 0, total: 0 },
    kanjiToOnyomi: { correct: 0, total: 0 },
    onyomiToKanji: { correct: 0, total: 0 },
    meaningToKanji: { correct: 0, total: 0 },
  };

  currentResult.questions.forEach((q, i) => {
    const answer = currentResult.answers[i];
    typeBreakdown[q.type].total++;
    if (answer?.correct) {
      typeBreakdown[q.type].correct++;
    }
  });

  const handleBackToSettings = () => {
    dispatch(setReviewMode(false));
    dispatch(setShowSettings(true));
  };

  const handleRestartQuiz = () => {
    dispatch(setReviewMode(false));
    dispatch(restartQuiz());
  };

  const handleExportQuiz = () => {
    // Generate quiz content in text format
    const timestamp = new Date(currentResult.completedAt);
    const formattedDate = timestamp.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const quizNumber = String(currentResult.timestamp).slice(-6);
    
    let content = `Quiz #${quizNumber}\n`;
    content += `Date: ${timestamp.toLocaleString()}\n`;
    content += `Settings: ${currentResult.settings.levelType.toUpperCase()} - `;
    if (currentResult.settings.levelType === 'jlpt') {
      content += currentResult.settings.selectedJlptLevels.map(l => l.toUpperCase()).join(', ');
    } else {
      content += `Grade ${currentResult.settings.selectedGradeLevels.join(', ')}`;
    }
    content += `\n`;
    content += `Show: ${currentResult.settings.showField} | Ask: ${currentResult.settings.askField}\n`;
    content += `Order: ${currentResult.settings.questionOrder} | Time: ${currentResult.settings.maxTimePerQuestion === 0 ? 'unlimited' : currentResult.settings.maxTimePerQuestion + 's'}\n`;
    content += `Total Questions: ${currentResult.questions.length}\n`;
    content += `Score: ${currentResult.score}/10 (${currentResult.percentage}%)\n`;
    content += `\n`;
    content += `================================\n\n`;

    currentResult.questions.forEach((question, index) => {
      const answer = currentResult.answers[index];
      const isCorrect = answer?.correct;
      
      content += `Q${index + 1}. ${question.questionText}\n`;
      
      question.options.forEach((option, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
        const isCorrectOption = optIndex === question.correctIndex;
        const wasSelected = answer?.selectedIndex === optIndex;
        
        content += `${letter}. ${option}`;
        if (isCorrectOption) content += ' *';
        if (wasSelected && !isCorrect) content += ' (your answer)';
        content += `\n`;
      });
      
      content += `Result: ${isCorrect ? '✓ Correct' : '✗ Wrong'}`;
      if (!isCorrect && answer?.selectedIndex !== null && answer?.selectedIndex !== undefined) {
        content += ` - You answered: ${String.fromCharCode(65 + answer.selectedIndex)}`;
      }
      content += `\n`;
      content += `Time: ${answer?.timeSpent || 0}s\n`;
      content += `\n`;
    });

    // Create download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-${quizNumber}-${formattedDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">{t('review.title')}</h1>
        <p className="text-gray-400">
          {new Date(currentResult.completedAt).toLocaleDateString()} {' '}
          {new Date(currentResult.completedAt).toLocaleTimeString()}
        </p>
      </div>

      {/* History Selector */}
      {history.length > 1 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {history.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedResultIndex(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedResultIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {t('review.quiz')} {history.length - index}
            </button>
          ))}
        </div>
      )}

      {/* Score Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-center space-y-4">
        <div className="text-6xl font-bold text-white">{score.toFixed(1)}</div>
        <div className="text-2xl text-white">{t('review.outOf10')}</div>
        <div className="text-lg text-blue-100">
          {correctCount} / {totalQuestions} {t('review.correct')} ({accuracy}%)
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Stats */}
        <div className="bg-gray-700 rounded-xl p-5 space-y-2">
          <h3 className="text-lg font-semibold text-white">{t('review.timeStats')}</h3>
          <div className="space-y-1 text-gray-300">
            <p>{t('review.totalTime')}: {Math.floor(totalTime / 60)}m {totalTime % 60}s</p>
            <p>{t('review.avgTimePerQuestion')}: {avgTime}s</p>
          </div>
        </div>

        {/* Level Info */}
        <div className="bg-gray-700 rounded-xl p-5 space-y-2">
          <h3 className="text-lg font-semibold text-white">{t('review.quizSettings')}</h3>
          <div className="space-y-1 text-gray-300">
            <p>{t('review.level')}: {currentResult.settings.levelType === 'jlpt' 
              ? currentResult.settings.selectedJlptLevels.map(l => l.toUpperCase()).join(', ')
              : `Grade ${currentResult.settings.selectedGradeLevels.join(', ')}`
            }</p>
            <p>{t('review.timeLimit')}: {currentResult.settings.maxTimePerQuestion === 0 ? 'Unlimited' : `${currentResult.settings.maxTimePerQuestion}s`}</p>
            <p>Format: {currentResult.settings.showField} → {currentResult.settings.askField}</p>
          </div>
        </div>
      </div>

      {/* Question Type Breakdown */}
      <div className="bg-gray-700 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-white">{t('review.typeBreakdown')}</h3>
        <div className="space-y-3">
          {Object.entries(typeBreakdown).map(([type, stats]) => {
            if (stats.total === 0) return null;
            const typeAccuracy = Math.round((stats.correct / stats.total) * 100);
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>{t(`settings.questionTypes.${type}`)}</span>
                  <span>{stats.correct}/{stats.total} ({typeAccuracy}%)</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      typeAccuracy >= 70 ? 'bg-green-500' : 
                      typeAccuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${typeAccuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Answers */}
      <div className="bg-gray-700 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-white">{t('review.detailedAnswers')}</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {currentResult.questions.map((question, index) => {
            const answer = currentResult.answers[index];
            const isCorrect = answer?.correct;
            const selectedOption = answer?.selectedIndex !== null && answer?.selectedIndex !== undefined
              ? question.options[answer.selectedIndex]
              : t('review.noAnswer');
            const correctOption = question.options[question.correctIndex];

            return (
              <div 
                key={question.id}
                className={`p-4 rounded-lg border-l-4 ${
                  isCorrect ? 'border-green-500 bg-gray-800' : 'border-red-500 bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="text-white font-semibold">
                      {question.questionText}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                        {t('review.yourAnswer')}: {selectedOption}
                      </div>
                      {!isCorrect && (
                        <div className="text-green-400">
                          {t('review.correctAnswer')}: {correctOption}
                        </div>
                      )}
                      <div className="text-gray-400">
                        {t('review.timeTaken')}: {answer?.timeSpent || 0}s
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleExportQuiz}
          className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>📥</span>
          <span>{t('review.saveQuiz')}</span>
        </button>
        <button
          onClick={handleRestartQuiz}
          className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-colors"
        >
          {t('review.restartQuiz')}
        </button>
        <button
          onClick={handleBackToSettings}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors"
        >
          {t('review.newQuiz')}
        </button>
      </div>
    </div>
  );
};

export default QuizReview;
