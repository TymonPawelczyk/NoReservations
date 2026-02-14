'use client';

import { useState } from 'react';

interface MuseumMiniGameProps {
  onComplete: (score: number) => void;
}

const artQuestions = [
  {
    question: 'Kto namalował Mona Lisę?',
    options: ['Leonardo da Vinci', 'Michelangelo', 'Rafael', 'Donatello'],
    correct: 0,
  },
  {
    question: 'Który artysta jest znany z "Gwiaździstej nocy"?',
    options: ['Claude Monet', 'Pablo Picasso', 'Vincent van Gogh', 'Salvador Dalí'],
    correct: 2,
  },
  {
    question: 'Gdzie znajduje się Muzeum Luwr?',
    options: ['Londyn', 'Paryż', 'Rzym', 'Madryt'],
    correct: 1,
  },
];

export default function MuseumMiniGame({ onComplete }: MuseumMiniGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const correct = index === artQuestions[currentQuestion].correct;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setTimeout(() => {
      if (currentQuestion < artQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Calculate final score
        const finalScore = Math.round(((correctAnswers + (correct ? 1 : 0)) / artQuestions.length) * 100);
        setTimeout(() => {
          onComplete(finalScore);
        }, 1500);
      }
    }, 1500);
  };

  const question = artQuestions[currentQuestion];

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-purple-900 to-indigo-900">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">🎨 Quiz Muzealny</h2>
          <p className="text-pink-200 text-sm">Pytanie {currentQuestion + 1}/{artQuestions.length}</p>
        </div>

        <div className="bg-white/10 border-4 border-white/30 p-8">
          <h3 className="text-white text-xl font-bold mb-6 text-center">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correct;
              
              let buttonClass = 'retro-button w-full';
              if (showResult && isSelected && isCorrect) {
                buttonClass += ' bg-green-500 border-green-700';
              } else if (showResult && isSelected && !isCorrect) {
                buttonClass += ' bg-red-500 border-red-700';
              } else if (showResult && isCorrectAnswer) {
                buttonClass += ' bg-green-500 border-green-700';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={buttonClass}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-6 text-center">
              <p className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✓ Poprawnie!' : '✗ Niepoprawnie'}
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-white text-sm">Wynik: {correctAnswers}/{currentQuestion + (showResult && isCorrect ? 1 : 0)} poprawnych</p>
        </div>
      </div>
    </div>
  );
}
