import React, { useEffect, useState } from 'react';

interface QuizCountdownProps {
  onComplete: () => void;
}

export const QuizCountdown: React.FC<QuizCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="text-center space-y-4">
        {/* Main countdown number */}
        <div
          className={`text-9xl font-black transition-all duration-300 ${
            count === 3
              ? 'text-blue-500'
              : count === 2
              ? 'text-yellow-500'
              : 'text-red-500'
          } ${pulse ? 'scale-150 opacity-50' : 'scale-100 opacity-100'}`}
          style={{
            animation: pulse
              ? 'none'
              : `pulse-count 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) infinite`,
          }}
        >
          {count}
        </div>

        {/* Motivational text */}
        <div className="text-white text-xl font-semibold">
          {count === 3
            ? 'Get Ready! 🎯'
            : count === 2
            ? 'Focus! 💪'
            : 'GO! 🚀'}
        </div>

        {/* Animated circles */}
        <div className="flex justify-center gap-3 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < 3 - count
                  ? 'bg-green-500 scale-125'
                  : 'bg-gray-600 scale-100'
              }`}
              style={{
                animation:
                  i < 3 - count
                    ? 'bounce-circle 0.6s ease-out'
                    : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-count {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-circle {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizCountdown;
