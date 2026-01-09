import React, { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import QuizSettings from './QuizSettings';
import QuizCard from './QuizCard';
import QuizReview from './QuizReview';
import { useTranslation } from 'react-i18next';

const Quiz: React.FC = () => {
  const { activeQuiz, showSettings, reviewMode, history } = useAppSelector((state) => state.quiz);
  const { i18n } = useTranslation();

  // Preload quiz namespace
  useEffect(() => {
    i18n.loadNamespaces('quiz');
  }, [i18n]);

  // Show settings modal
  if (showSettings) {
    return <QuizSettings />;
  }

  // Show review after quiz completion or quit
  if (reviewMode && history.length > 0) {
    return <QuizReview />;
  }

  // Show active quiz
  if (activeQuiz) {
    return <QuizCard />;
  }

  // Fallback (should not reach here)
  return null;
};

export default Quiz;
