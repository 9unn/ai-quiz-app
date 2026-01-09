import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { quizQuestions, familiarityLevels } from '@/lib/quiz-data';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, Star } from 'lucide-react';
import { Link } from 'wouter';

export default function Quiz() {
  const saveResultMutation = trpc.quiz.saveResult.useMutation();

  const [step, setStep] = useState<'intro' | 'familiarity' | 'quiz' | 'result'>('intro');
  const [familiarity, setFamiliarity] = useState<number>(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleStart = () => setStep('familiarity');

  const handleFamiliaritySubmit = () => setStep('quiz');

  const handleAnswer = (answer: any) => {
    const isCorrect = 
      currentQuestion.type === 'text' 
        ? answer.toLowerCase().trim() === (currentQuestion.correctAnswer as string).toLowerCase()
        : answer === currentQuestion.correctAnswer;

    setAnswers({ ...answers, [currentQuestion.id]: answer });
    if (isCorrect) setScore(score + 1);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setTextAnswer('');
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('result');
    }
  };

  const restartQuiz = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setShowExplanation(false);
    setTextAnswer('');
  };

  // Save result when step changes to 'result'
  useEffect(() => {
    if (step === 'result' && Object.keys(answers).length > 0 && !isSaving) {
      setIsSaving(true);
      
      const answersForApi = Object.entries(answers).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, any>
      );

      saveResultMutation.mutate(
        {
          familiarityLevel: familiarity,
          score,
          totalQuestions: quizQuestions.length,
          percentage: Math.round((score / quizQuestions.length) * 100),
          answers: answersForApi,
        },
        {
          onSuccess: () => {
            console.log('Quiz result saved successfully');
            toast.success('Your quiz result has been saved!');
          },
          onError: (error) => {
            console.error('Error saving result:', error);
            toast.error('Failed to save your result. Please try again.');
          },
          onSettled: () => {
            setIsSaving(false);
          },
        }
      );
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="container max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="glass-panel border-none shadow-2xl">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-32 h-32 mb-6 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/40">
                    <img src="/images/ai-hero-glass.png" alt="AI Brain" className="w-24 h-24 object-contain drop-shadow-lg" style={{backgroundColor: '#ffffff'}} />
                  </div>
                  <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    AI Knowledge Quiz
                  </CardTitle>
                  <CardDescription className="text-lg mt-2 text-muted-foreground">
                    Discover how much you really know about Artificial Intelligence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Button onClick={handleStart} size="lg" className="w-full text-lg h-14 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300 bg-primary hover:bg-primary/90">
                    Start Journey <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'familiarity' && (
            <motion.div
              key="familiarity"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="glass-panel border-none">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Before we begin...</CardTitle>
                  <CardDescription className="text-center text-base">
                    How familiar are you with Artificial Intelligence?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {familiarityLevels.map((level) => (
                      <div
                        key={level.value}
                        onClick={() => setFamiliarity(level.value)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                          familiarity === level.value
                            ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                            : 'border-transparent bg-white/40 hover:bg-white/60'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          familiarity === level.value ? 'bg-primary text-white' : 'bg-white/50 text-muted-foreground'
                        }`}>
                          {level.value}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{level.label}</h4>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleFamiliaritySubmit} className="w-full h-12 text-lg rounded-xl mt-4">
                    Continue to Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <div className="mb-6 flex justify-between items-center text-sm font-medium text-muted-foreground px-2">
                <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                <span>Score: {score}</span>
              </div>
              <Progress value={((currentQuestionIndex) / quizQuestions.length) * 100} className="h-2 mb-8 rounded-full bg-white/30" />
              
              <Card className="glass-panel border-none overflow-hidden">
                <CardHeader className="bg-white/10 backdrop-blur-sm border-b border-white/10 pb-8">
                  <CardTitle className="text-2xl leading-snug">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-6">
                  {!showExplanation ? (
                    <div className="space-y-4">
                      {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option) => (
                        <Button
                          key={option}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-4 px-6 text-lg rounded-xl border-white/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
                          onClick={() => handleAnswer(option)}
                        >
                          {option}
                        </Button>
                      ))}

                      {currentQuestion.type === 'true-false' && (
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            className="h-32 text-xl font-bold rounded-2xl border-white/30 hover:bg-green-500/10 hover:border-green-500 hover:text-green-600 transition-all flex flex-col gap-2"
                            onClick={() => handleAnswer(true)}
                          >
                            <CheckCircle2 className="w-8 h-8" /> True
                          </Button>
                          <Button
                            variant="outline"
                            className="h-32 text-xl font-bold rounded-2xl border-white/30 hover:bg-red-500/10 hover:border-red-500 hover:text-red-600 transition-all flex flex-col gap-2"
                            onClick={() => handleAnswer(false)}
                          >
                            <XCircle className="w-8 h-8" /> False
                          </Button>
                        </div>
                      )}

                      {currentQuestion.type === 'text' && (
                        <div className="space-y-4">
                          <Input
                            placeholder="Type your answer here..."
                            value={textAnswer}
                            onChange={(e) => setTextAnswer(e.target.value)}
                            className="h-14 text-lg bg-white/50 border-white/30 focus:ring-primary rounded-xl"
                            onKeyDown={(e) => e.key === 'Enter' && textAnswer && handleAnswer(textAnswer)}
                          />
                          <Button
                            onClick={() => textAnswer && handleAnswer(textAnswer)}
                            className="w-full h-12 text-lg rounded-xl"
                            disabled={!textAnswer}
                          >
                            Submit Answer
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className={`p-6 rounded-2xl ${
                        answers[currentQuestion.id] === currentQuestion.correctAnswer
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-red-500/20 border-2 border-red-500'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          {answers[currentQuestion.id] === currentQuestion.correctAnswer ? (
                            <>
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                              <span className="font-bold text-green-600">Correct!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6 text-red-600" />
                              <span className="font-bold text-red-600">Incorrect</span>
                            </>
                          )}
                        </div>
                        <p className="text-foreground/80">{currentQuestion.explanation}</p>
                      </div>

                      <Button
                        onClick={nextQuestion}
                        className="w-full h-12 text-lg rounded-xl"
                      >
                        {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'} <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              <Card className="glass-panel border-none shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-6">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray={`${(score / quizQuestions.length) * 283} 283`}
                          strokeLinecap="round"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                            <stop offset="100%" stopColor="rgb(168, 85, 247)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                          {Math.round((score / quizQuestions.length) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {score}/{quizQuestions.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
                  <CardDescription className="text-lg">
                    {score === quizQuestions.length && "Perfect score! You're an AI expert!"}
                    {score >= quizQuestions.length * 0.8 && score < quizQuestions.length && "Excellent work! You know your AI!"}
                    {score >= quizQuestions.length * 0.6 && score < quizQuestions.length * 0.8 && "Good job! Keep learning about AI!"}
                    {score < quizQuestions.length * 0.6 && "Keep exploring AI! There's so much to learn!"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 py-8">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-white/20">
                      <div className="text-2xl font-bold text-primary">{score}</div>
                      <div className="text-xs text-muted-foreground mt-1">Correct</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/20">
                      <div className="text-2xl font-bold text-accent">{quizQuestions.length - score}</div>
                      <div className="text-xs text-muted-foreground mt-1">Incorrect</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/20">
                      <div className="text-2xl font-bold text-secondary-foreground">{familiarity}/5</div>
                      <div className="text-xs text-muted-foreground mt-1">Familiarity</div>
                    </div>
                  </div>

                  {isSaving && (
                    <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/50 text-sm text-blue-600">
                      Saving your result...
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-4">
                  <Button
                    onClick={restartQuiz}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
                  </Button>
                  <Link href="/">
                    <Button className="flex-1 h-12 rounded-xl">
                      Back to Home
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
