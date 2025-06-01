import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Award, Play, Gift, AlertTriangle, Trophy, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import TetrisGame from '@/components/tetris/TetrisGame.jsx';
import { WIN_SCORE_DEFAULT } from '@/components/tetris/tetrisConstants.js';
import { supabase } from '@/lib/supabaseClient.js';

const titleAnimation = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const tetrisProtocolCardAnimation = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }
};


const GameZoneSection = () => {
  const [couponCode, setCouponCode] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [isGameEndModalOpen, setIsGameEndModalOpen] = useState(false);
  const [gameOutcome, setGameOutcome] = useState(''); // 'win' or 'lose'
  const { toast } = useToast();
  const rocketGifUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/49856b200925567560b46b1713724484.gif"; 

  const handleGameEnd = async (scoreVal, isWin) => {
    setFinalScore(scoreVal);
    if (isWin) {
      setGameOutcome('win');
      const newCoupon = `OUTWIT-AI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setCouponCode(newCoupon);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user ? user.email : 'anonymous_player@outwit.agency';

        const { error } = await supabase
          .from('coupons')
          .insert([{ 
            code: newCoupon, 
            user_email: userEmail, 
            generated_at: new Date().toISOString(),
            used: false,
          }]);

        if (error) throw error;
        
        console.log('Supabase Edge Function for coupon win notification would be invoked here with:', { email: 'admin@outwit.agency', couponCode: newCoupon, userEmail });

        toast({
          title: "🏆 VICTORY ACHIEVED! 🏆",
          description: `Your score: ${scoreVal}. Check the popup for your reward!`,
          duration: 7000,
          variant: "default", 
          className: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-xl"
        });

      } catch (error) {
        console.error('Error saving coupon to Supabase:', error);
        toast({
          title: "Coupon Generation Error",
          description: "Could not save your reward. Please contact support if this persists.",
          variant: "destructive"
        });
      }

    } else {
      setGameOutcome('lose');
       toast({
        title: "Mission Terminated",
        description: `Your score: ${scoreVal}. Better luck next time!`,
        variant: "destructive"
      });
    }
    setShowGame(false); 
    setIsGameEndModalOpen(true); 
  };

  const claimRewardAndScroll = () => {
    setIsGameEndModalOpen(false);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    toast({
      title: "Reward Protocol Initiated!",
      description: `Coupon ${couponCode} is ready for your project submission.`,
    });
  };

  const restartGame = () => {
    setIsGameEndModalOpen(false);
    setCouponCode(null);
    setFinalScore(0);
    setGameOutcome('');
    setShowGame(true); 
  };

  return (
    <>
      <section id="game-zone" className="section-padding bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...titleAnimation}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 font-['Space_Grotesk',_sans-serif]">
              The <span className="text-gradient">Outwit Protocol:</span> Tetris Challenge
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-['Poppins',_sans-serif]">
              Engage the system. Conquer the blocks. Unlock a 10% efficiency boost (discount) for your next venture with Outwit.
            </p>
          </motion.div>

          <motion.div {...tetrisProtocolCardAnimation}>
            <Card className="max-w-4xl mx-auto p-0 md:p-0 glassmorphism overflow-hidden">
              <CardContent className="p-4 md:p-6">
                {!showGame && !isGameEndModalOpen && (
                  <div className="text-center py-8">
                      <Award className="h-20 w-20 text-primary mx-auto mb-6 animate-bounce" style={{animationDuration: '1.5s'}}/>
                      <h3 className="text-3xl mb-4 font-['Space_Grotesk',_sans-serif]">Initiate Tetris Protocol?</h3>
                      <p className="text-lg text-muted-foreground mb-8 font-['Poppins',_sans-serif]">
                          Prove your strategic prowess. Achieve {WIN_SCORE_DEFAULT} points to secure your reward.
                      </p>
                      <Button size="lg" onClick={() => setShowGame(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl px-10 py-6 button-hover-glow font-['Space_Grotesk',_sans-serif]">
                          <Play className="mr-3 h-6 w-6"/> Engage System
                      </Button>
                  </div>
                )}

                {showGame && (
                  <TetrisGame onGameEnd={handleGameEnd} winScore={WIN_SCORE_DEFAULT} />
                )}
                
                {!showGame && isGameEndModalOpen && gameOutcome === 'win' && couponCode && (
                  <div className="text-center p-8">
                      <Trophy className="h-24 w-24 text-yellow-400 mx-auto mb-4 animate-pulse-glow" style={{filter: 'drop-shadow(0 0 15px hsl(var(--primary)))'}}/>
                      <img alt="Futuristic rocket launching animation for Tetris win" className="w-40 h-auto mx-auto my-1" src={rocketGifUrl} />
                      <h3 className="text-3xl font-bold text-gradient mt-2 mb-3 font-['Space_Grotesk',_sans-serif]">Protocol Conquered!</h3>
                      <p className="text-xl text-foreground/90 mb-2 font-['Poppins',_sans-serif]">Score Achieved: {finalScore}. Reward Unlocked: 10% Discount.</p>
                      <p className="text-lg text-muted-foreground mb-6 font-['Poppins',_sans-serif]">Your unique access code:</p>
                      <div className="my-4 p-4 border-2 border-dashed border-primary rounded-lg bg-primary/10">
                        <strong className="text-3xl font-mono text-primary tracking-wider">{couponCode}</strong>
                      </div>
                      <Button onClick={claimRewardAndScroll} size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 text-xl px-10 py-6 mt-4 button-hover-glow font-['Space_Grotesk',_sans-serif]">
                        <Gift className="mr-3 h-6 w-6" /> Activate Reward & Launch Project
                      </Button>
                      <Button variant="outline" onClick={restartGame} className="mt-4 ml-0 sm:ml-4 text-primary border-primary hover:bg-primary/10 button-hover-glow font-['Space_Grotesk',_sans-serif]">Re-engage Protocol</Button>
                  </div>
                )}
                {!showGame && isGameEndModalOpen && gameOutcome === 'lose' &&(
                  <div className="text-center p-8">
                      <XCircle className="h-24 w-24 text-destructive mx-auto mb-6"/>
                      <h3 className="text-3xl font-bold text-destructive mb-3 font-['Space_Grotesk',_sans-serif]">Challenge Incomplete</h3>
                      <p className="text-xl text-foreground/90 mb-6 font-['Poppins',_sans-serif]">Your final score: {finalScore}. The future is resilient. Try again!</p>
                      <Button variant="outline" onClick={restartGame} className="mt-4 text-primary border-primary hover:bg-primary/10 button-hover-glow font-['Space_Grotesk',_sans-serif]">Re-engage Protocol</Button>
                  </div>
                )}
                {!showGame && isGameEndModalOpen && !gameOutcome && ( 
                  <div className="text-center p-8">
                      <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4"/>
                      <h3 className="text-2xl font-semibold text-foreground font-['Space_Grotesk',_sans-serif]">System Anomaly...</h3>
                      <p className="text-muted-foreground font-['Poppins',_sans-serif]">An unexpected error occurred. Please try to re-engage the Tetris protocol.</p>
                      <Button onClick={restartGame} className="mt-6 button-hover-glow font-['Space_Grotesk',_sans-serif]">Retry Challenge</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Dialog open={isGameEndModalOpen} onOpenChange={(open) => {
        setIsGameEndModalOpen(open);
        if (!open) { 
            setShowGame(false); 
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-['Space_Grotesk',_sans-serif]">
              {gameOutcome === 'win' ? (
                <span className="text-gradient flex items-center justify-center"><Trophy className="h-7 w-7 mr-2 text-yellow-400"/> Protocol Conquered!</span>
              ) : gameOutcome === 'lose' ? (
                <span className="text-destructive flex items-center justify-center"><XCircle className="h-7 w-7 mr-2"/> Challenge Incomplete</span>
              ) : (
                <span className="text-foreground flex items-center justify-center"><AlertTriangle className="h-7 w-7 mr-2"/> Status Report</span>
              )}
            </DialogTitle>
            <DialogDescription className="text-center pt-2 font-['Poppins',_sans-serif]">
              Your final score: <strong className="text-primary">{finalScore}</strong>.
              {gameOutcome === 'win' && couponCode && (
                <>
                  <br />Congratulations! You've unlocked a 10% discount.
                  <br />Your reward code:
                  <div className="my-3 p-3 border border-dashed border-primary rounded-md bg-primary/5">
                    <strong className="text-xl font-mono text-primary tracking-wider">{couponCode}</strong>
                  </div>
                  <img alt="Futuristic rocket launching animation for Tetris win" className="w-32 h-auto mx-auto my-2" src={rocketGifUrl} />
                </>
              )}
              {gameOutcome === 'lose' && (
                <><br />The future favors the persistent. Feel free to try again!</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center pt-4">
            {gameOutcome === 'win' && couponCode && (
              <Button onClick={claimRewardAndScroll} className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 button-hover-glow font-['Space_Grotesk',_sans-serif]">
                <Gift className="mr-2 h-5 w-5" /> Activate & Launch Project
              </Button>
            )}
            <Button variant="outline" onClick={restartGame} className="w-full sm:w-auto text-primary border-primary hover:bg-primary/10 button-hover-glow font-['Space_Grotesk',_sans-serif]">
              Re-engage Protocol
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="w-full sm:w-auto font-['Space_Grotesk',_sans-serif]">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameZoneSection;