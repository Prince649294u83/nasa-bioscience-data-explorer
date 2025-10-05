"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Trophy, Star, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import StarField from "@/components/StarField";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What percentage of bone density do astronauts lose per month in microgravity?",
    options: ["0.5-1%", "1-2%", "3-4%", "5-6%"],
    correctAnswer: 1,
    explanation:
      "Astronauts lose approximately 1-2% of bone mineral density per month in microgravity, particularly in weight-bearing bones. This is a major concern for long-duration missions.",
    category: "Human Physiology",
  },
  {
    id: 2,
    question: "Which plant was successfully grown on the ISS in the Veggie experiment?",
    options: ["Tomatoes", "Lettuce", "Potatoes", "Carrots"],
    correctAnswer: 1,
    explanation:
      "Red romaine lettuce was one of the first plants successfully grown and eaten by astronauts on the ISS using the Veggie plant growth system.",
    category: "Space Biology",
  },
  {
    id: 3,
    question: "What is the primary source of radiation exposure during deep space missions?",
    options: ["Solar flares", "Galactic cosmic rays", "Van Allen belts", "Earth's magnetosphere"],
    correctAnswer: 1,
    explanation:
      "Galactic cosmic rays (GCRs) are the primary concern for deep space missions. These high-energy particles come from outside our solar system and are difficult to shield against.",
    category: "Radiation Biology",
  },
  {
    id: 4,
    question: "How many hours of sleep do astronauts typically get per night on the ISS?",
    options: ["4-5 hours", "6-7 hours", "8-9 hours", "10+ hours"],
    correctAnswer: 1,
    explanation:
      "Studies show astronauts average only 6-7 hours of sleep per night on the ISS, less than the recommended 8 hours, due to noise, excitement, and altered circadian rhythms.",
    category: "Sleep Research",
  },
  {
    id: 5,
    question: "What temperature do protein crystals grow best at in microgravity experiments?",
    options: ["0°C", "4°C", "20°C", "37°C"],
    correctAnswer: 1,
    explanation:
      "Protein crystal growth experiments typically use refrigerated conditions around 4°C to slow growth and produce higher quality crystals in microgravity.",
    category: "Biotechnology",
  },
];

interface MemoryCard {
  id: number;
  icon: string;
  matched: boolean;
}

export default function GamesPage() {
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Memory game state
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const initializeMemoryGame = () => {
    const icons = ["🚀", "🛸", "🌍", "🌙", "⭐", "🌟", "🪐", "☄️"];
    const cards: MemoryCard[] = [];
    icons.forEach((icon, idx) => {
      cards.push({ id: idx * 2, icon, matched: false });
      cards.push({ id: idx * 2 + 1, icon, matched: false });
    });
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameStarted(true);
  };

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      const firstCard = memoryCards.find((c) => c.id === first);
      const secondCard = memoryCards.find((c) => c.id === second);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const isGameWon = matched.length === memoryCards.length && memoryCards.length > 0;

  return (
    <>
      <StarField />
      <Navigation />

      <div className="relative z-10 min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-6xl mx-auto mb-8">
            <h1
              className="text-5xl font-black mb-4 gradient-text"
              style={{ fontFamily: "var(--font-space)" }}
            >
              Games & Quizzes
            </h1>
            <p className="text-lg text-muted-foreground">
              Test your knowledge and have fun while learning about space bioscience!
            </p>
          </div>

          {/* Games Tabs */}
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="quiz" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="quiz">
                  <Trophy className="h-4 w-4 mr-2" />
                  Quiz Challenge
                </TabsTrigger>
                <TabsTrigger value="memory">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Memory Match
                </TabsTrigger>
              </TabsList>

              {/* Quiz Tab */}
              <TabsContent value="quiz">
                {!quizCompleted ? (
                  <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Question {currentQuestion + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-sm font-medium">
                          Score: {score}/{quizQuestions.length}
                        </span>
                      </div>
                      <Progress
                        value={((currentQuestion + 1) / quizQuestions.length) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Question */}
                    <div className="mb-6">
                      <Badge className="mb-4">{quizQuestions[currentQuestion].category}</Badge>
                      <h2 className="text-2xl font-bold mb-6">
                        {quizQuestions[currentQuestion].question}
                      </h2>

                      {/* Options */}
                      <div className="space-y-3">
                        {quizQuestions[currentQuestion].options.map((option, idx) => {
                          const isSelected = selectedAnswer === idx;
                          const isCorrect = idx === quizQuestions[currentQuestion].correctAnswer;
                          const showCorrect = showResult && isCorrect;
                          const showIncorrect = showResult && isSelected && !isCorrect;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswerSelect(idx)}
                              disabled={showResult}
                              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                showCorrect
                                  ? "border-green-500 bg-green-500/10"
                                  : showIncorrect
                                  ? "border-red-500 bg-red-500/10"
                                  : isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                                {showIncorrect && <XCircle className="h-5 w-5 text-red-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    {showResult && (
                      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Explanation:</h3>
                        <p className="text-sm text-muted-foreground">
                          {quizQuestions[currentQuestion].explanation}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      {!showResult ? (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={selectedAnswer === null}
                          className="glow"
                        >
                          Submit Answer
                        </Button>
                      ) : (
                        <Button onClick={handleNextQuestion} className="glow">
                          {currentQuestion < quizQuestions.length - 1 ? (
                            <>
                              Next Question
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              View Results
                              <Trophy className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  // Quiz Results
                  <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20 text-center">
                    <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-space)" }}>
                      Quiz Complete!
                    </h2>
                    <p className="text-6xl font-black mb-6 gradient-text">
                      {score}/{quizQuestions.length}
                    </p>
                    <p className="text-lg text-muted-foreground mb-8">
                      {score === quizQuestions.length
                        ? "Perfect score! You're a space bioscience expert! 🚀"
                        : score >= quizQuestions.length * 0.7
                        ? "Great job! You know your space biology! 🌟"
                        : "Keep learning! Every expert started somewhere! 📚"}
                    </p>

                    {/* Score breakdown */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      <Card className="p-4 bg-primary/10 border-primary/30">
                        <div className="text-3xl font-bold text-primary">{score}</div>
                        <div className="text-sm text-muted-foreground">Correct</div>
                      </Card>
                      <Card className="p-4 bg-muted/50">
                        <div className="text-3xl font-bold">{quizQuestions.length - score}</div>
                        <div className="text-sm text-muted-foreground">Incorrect</div>
                      </Card>
                      <Card className="p-4 bg-accent/10 border-accent/30">
                        <div className="text-3xl font-bold text-accent">
                          {Math.round((score / quizQuestions.length) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </Card>
                    </div>

                    <Button onClick={handleRestartQuiz} size="lg" className="glow">
                      Take Quiz Again
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Memory Game Tab */}
              <TabsContent value="memory">
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-space)" }}>
                      Space Memory Match
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Match all the space-themed pairs to win!
                    </p>

                    {gameStarted && (
                      <div className="flex items-center justify-center gap-8 mb-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{moves}</div>
                          <div className="text-sm text-muted-foreground">Moves</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{matched.length / 2}</div>
                          <div className="text-sm text-muted-foreground">Matched</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!gameStarted ? (
                    <div className="text-center py-12">
                      <Gamepad2 className="h-16 w-16 text-primary mx-auto mb-4" />
                      <Button onClick={initializeMemoryGame} size="lg" className="glow">
                        Start Game
                      </Button>
                    </div>
                  ) : isGameWon ? (
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-nebula mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-4">You Won! 🎉</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        Completed in {moves} moves!
                      </p>
                      <Button onClick={initializeMemoryGame} size="lg" className="glow">
                        Play Again
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {memoryCards.map((card) => {
                        const isFlipped = flipped.includes(card.id) || matched.includes(card.id);

                        return (
                          <button
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all ${
                              isFlipped
                                ? "bg-primary/20 border-2 border-primary"
                                : "bg-card border-2 border-border hover:border-primary/50"
                            } ${matched.includes(card.id) ? "opacity-50" : ""}`}
                          >
                            {isFlipped ? card.icon : "?"}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}