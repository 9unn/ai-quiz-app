import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
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
  const { user, isAuthenticated } = useAuth();
  const saveResultMutation = trpc.quiz.saveResult.useMutation();

  const [step, setStep] = useState<'intro' | 'familiarity' | 'quiz' | 'result'>('intro');
  const [familiarity, setFamiliarity] = useState<number>(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');

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

  const handleSaveResult = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to save your results');
      return;
    }

    if (Object.keys(answers).length === 0) {
      console.warn('No answers to save');
      return;
    }

    try {
      console.log('Saving quiz result...', { familiarity, score, answers });
      
      // Convert answers object keys to strings for API
      const answersForApi = Object.entries(answers).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, any>
      );

      const result = await saveResultMutation.mutateAsync({
        familiarityLevel: familiarity,
        score,
        totalQuestions: quizQuestions.length,
        percentage: Math.round((score / quizQuestions.length) * 100),
        answers: answersForApi,
      });

      console.log('Quiz result saved successfully:', result);
      toast.success('Your quiz result has been saved!');
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save your result. Please try again.');
    }
  };

  useEffect(() => {
    if (step === 'result') {
      handleSaveResult();
    }
  }, [step, isAuthenticated, user, familiarity, score, answers, saveResultMutation]);

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
                            onClick={() => handleAnswer(textAnswer)}
                            disabled={!textAnswer}
                            className="w-full h-12 rounded-xl"
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
                      className="bg-white/40 rounded-xl p-6 border border-white/40"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {answers[currentQuestion.id] === currentQuestion.correctAnswer || 
                         (typeof answers[currentQuestion.id] === 'string' && 
                          answers[currentQuestion.id].toLowerCase().trim() === (currentQuestion.correctAnswer as string).toLowerCase()) ? (
                          <div className="text-green-600 flex items-center gap-2 font-bold text-xl">
                            <CheckCircle2 className="w-6 h-6" /> Correct!
                          </div>
                        ) : (
                          <div className="text-destructive flex items-center gap-2 font-bold text-xl">
                            <XCircle className="w-6 h-6" /> Incorrect
                          </div>
                        )}
                      </div>
                      <p className="text-lg text-foreground/90 mb-2 font-medium">
                        {currentQuestion.explanation}
                      </p>
                      <div className="mt-6 flex justify-end">
                        <Button onClick={nextQuestion} size="lg" className="rounded-xl px-8">
                          {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
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
              className="text-center"
            >
              <Card className="glass-panel border-none overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
                <CardHeader className="pt-10">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg mb-4">
                    <Star className="w-12 h-12 fill-current" />
                  </div>
                  <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
                  <CardDescription className="text-lg">
                    Here is how you performed
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="text-6xl font-black text-primary mb-2">
                    {Math.round((score / quizQuestions.length) * 100)}%
                  </div>
                  <p className="text-muted-foreground text-lg mb-8">
                    You got <span className="font-bold text-foreground">{score}</span> out of <span className="font-bold text-foreground">{quizQuestions.length}</span> questions correct.
                  </p>
                  
                  <div className="bg-white/30 rounded-xl p-6 mb-8 text-left">
                    <h4 className="font-bold mb-2 text-primary">Your AI Profile:</h4>
                    <p className="text-foreground/80">
                      {score === quizQuestions.length ? "You're an AI Expert! The machines might learn from you." :
                       score > quizQuestions.length / 2 ? "You have a solid understanding of AI basics. Keep learning!" :
                       "You're just getting started. The world of AI is vast and exciting!"}
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button 
                      variant="outline" 
                      onClick={restartQuiz} 
                      disabled={saveResultMutation.isPending}
                      className="h-12 px-6 rounded-xl border-white/40 hover:bg-white/50"
                    >
                      <RefreshCcw className="mr-2 w-4 h-4" /> Try Again
                    </Button>
                    <Link href="/">
                      <Button className="h-12 px-6 rounded-xl">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                  {!isAuthenticated && (
                    <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-center text-sm text-yellow-700">
                      <p>Sign in to save your results and track your progress!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
