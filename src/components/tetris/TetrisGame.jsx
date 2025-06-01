import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ArrowLeft, ArrowRight, ArrowDown, RotateCw, Maximize, Minimize, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { ROWS, COLS, BLOCK_SIZE, EMPTY_COLOR, BORDER_COLOR, INITIAL_DROP_INTERVAL, FAST_DROP_INTERVAL, POINTS_PER_LINE, WIN_SCORE_DEFAULT } from './tetrisConstants.js';
import { createEmptyBoard, getRandomPiece, isValidMove, rotatePiece, mergePieceToBoard, clearLines as clearLinesLogic } from './tetrisLogic.js';
import { useTetrisAudio } from './hooks/useTetrisAudio.js';
import { supabase } from '@/lib/supabaseClient.js';
import { useToast } from '@/components/ui/use-toast.js';

const TetrisGame = ({ onGameEnd, winScore: propWinScore }) => {
  const canvasRef = useRef(null);
  const nextPieceCanvasRef = useRef(null);
  const gameAreaRef = useRef(null);

  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(getRandomPiece());
  const [nextPiece, setNextPiece] = useState(getRandomPiece());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  const [effectiveWinScore, setEffectiveWinScore] = useState(propWinScore || WIN_SCORE_DEFAULT);
  const [baseDropInterval, setBaseDropInterval] = useState(INITIAL_DROP_INTERVAL);

  const dropInterval = useRef(INITIAL_DROP_INTERVAL);
  const lastDropTime = useRef(0);
  const gameLoopId = useRef(null);
  const isFastDropping = useRef(false);

  const { isMuted, playSound, toggleMute } = useTetrisAudio();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGameSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const { data, error } = await supabase
          .from('game_settings')
          .select('drop_speed, win_score')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const fetchedSettings = data[0];
          setBaseDropInterval(fetchedSettings.drop_speed || INITIAL_DROP_INTERVAL);
          dropInterval.current = fetchedSettings.drop_speed || INITIAL_DROP_INTERVAL;
          setEffectiveWinScore(fetchedSettings.win_score || WIN_SCORE_DEFAULT);
          console.log("Fetched game settings:", fetchedSettings);
        } else {
          dropInterval.current = INITIAL_DROP_INTERVAL;
          setEffectiveWinScore(WIN_SCORE_DEFAULT);
          console.warn("No game settings found in DB, using defaults.");
        }
      } catch (err) {
        console.error("Error fetching game settings for TetrisGame:", err);
        toast({
          title: "Could not load game settings",
          description: "Using default Tetris settings. Please check admin panel.",
          variant: "destructive",
        });
        dropInterval.current = INITIAL_DROP_INTERVAL;
        setEffectiveWinScore(WIN_SCORE_DEFAULT);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchGameSettings();
  }, [toast]);


  const drawBlock = (ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = BORDER_COLOR;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  };

  const drawBoard = useCallback((ctx) => {
    ctx.fillStyle = EMPTY_COLOR;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          drawBlock(ctx, x, y, color);
        }
      });
    });
  }, [board]);

  const drawPiece = useCallback((ctx, piece) => {
    if (!piece) return;
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(ctx, piece.x + x, piece.y + y, piece.color);
        }
      });
    });
  }, []);
  
  const drawNextPiece = useCallback(() => {
    const ctx = nextPieceCanvasRef.current?.getContext('2d');
    if (!ctx || !nextPiece) return;

    const previewCols = 4;
    const previewRows = 4;
    const previewBlockSize = BLOCK_SIZE * 0.8;
    ctx.canvas.width = previewCols * previewBlockSize;
    ctx.canvas.height = previewRows * previewBlockSize;
    
    ctx.fillStyle = EMPTY_COLOR;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const shape = nextPiece.shape;
    const shapeWidth = shape[0].length;
    const shapeHeight = shape.length;
    const offsetX = Math.floor((previewCols - shapeWidth) / 2);
    const offsetY = Math.floor((previewRows - shapeHeight) / 2);

    shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          ctx.fillStyle = nextPiece.color;
          ctx.fillRect((offsetX + x) * previewBlockSize, (offsetY + y) * previewBlockSize, previewBlockSize, previewBlockSize);
          ctx.strokeStyle = BORDER_COLOR;
          ctx.strokeRect((offsetX + x) * previewBlockSize, (offsetY + y) * previewBlockSize, previewBlockSize, previewBlockSize);
        }
      });
    });
  }, [nextPiece]);

  const redrawGame = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawBoard(ctx);
    drawPiece(ctx, currentPiece);
    drawNextPiece();
  }, [drawBoard, drawPiece, currentPiece, drawNextPiece]);

  const movePiece = useCallback((dx, dy) => {
    if (gameOver || isPaused) return false;
    const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
    if (isValidMove(newPiece, board)) {
      setCurrentPiece(newPiece);
      if (dx !== 0) playSound('move');
      return true;
    }
    return false;
  }, [currentPiece, board, gameOver, isPaused, playSound]);

  const handleRotate = useCallback(() => {
    if (gameOver || isPaused) return;
    const rotatedPiece = rotatePiece(currentPiece);
    if (isValidMove(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
      playSound('rotate');
    } else {
      const kickedLeft = { ...rotatedPiece, x: rotatedPiece.x - 1 };
      if (isValidMove(kickedLeft, board)) {
        setCurrentPiece(kickedLeft);
        playSound('rotate');
        return;
      }
      const kickedRight = { ...rotatedPiece, x: rotatedPiece.x + 1 };
      if (isValidMove(kickedRight, board)) {
        setCurrentPiece(kickedRight);
        playSound('rotate');
      }
    }
  }, [currentPiece, board, gameOver, isPaused, playSound]);

  const dropCurrentPiece = useCallback(() => {
    if (gameOver || isPaused) return;
    if (!movePiece(0, 1)) { 
      const newBoard = mergePieceToBoard(currentPiece, board);
      const { board: boardAfterClear, linesCleared: numCleared } = clearLinesLogic(newBoard);
      setBoard(boardAfterClear);
      playSound('drop');

      if (numCleared > 0) {
        playSound('lineClear');
        setScore(prev => prev + (POINTS_PER_LINE[numCleared] || 0) * level);
        setLinesCleared(prev => {
          const totalLines = prev + numCleared;
          const newLevel = Math.floor(totalLines / 10) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            // Adjust drop interval based on new level and fetched baseDropInterval
            dropInterval.current = Math.max(100, baseDropInterval - (newLevel - 1) * 75);
          }
          return totalLines;
        });
      }
      
      const next = nextPiece;
      setCurrentPiece(next);
      setNextPiece(getRandomPiece());

      if (!isValidMove(next, boardAfterClear)) {
        setGameOver(true);
        playSound('gameOver');
        if (onGameEnd) onGameEnd(score, false);
      }
    }
    lastDropTime.current = performance.now();
  }, [currentPiece, board, nextPiece, gameOver, isPaused, level, score, onGameEnd, playSound, movePiece, baseDropInterval]);

  const startGame = useCallback(() => {
    if (isLoadingSettings) {
        toast({ title: "Loading settings...", description: "Please wait for game settings to load before starting."});
        return;
    }
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    dropInterval.current = baseDropInterval; // Use fetched/default base speed
    lastDropTime.current = performance.now();
    isFastDropping.current = false;
  }, [isLoadingSettings, baseDropInterval, toast]);

  useEffect(() => {
    if (score >= effectiveWinScore && !gameOver && gameStarted) {
      setGameOver(true);
      if (onGameEnd) onGameEnd(score, true);
      playSound('gameOver'); 
    }
  }, [score, effectiveWinScore, gameOver, onGameEnd, playSound, gameStarted]);
  
  useEffect(() => {
    const mainCanvas = canvasRef.current;
    if (mainCanvas) {
        mainCanvas.width = COLS * BLOCK_SIZE;
        mainCanvas.height = ROWS * BLOCK_SIZE;
    }
    const nextCanvas = nextPieceCanvasRef.current;
     if (nextCanvas) {
        const previewCols = 4;
        const previewRows = 4;
        const previewBlockSize = BLOCK_SIZE * 0.8;
        nextCanvas.width = previewCols * previewBlockSize;
        nextCanvas.height = previewRows * previewBlockSize;
    }
    redrawGame();
  }, [redrawGame, gameStarted]);

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused || isLoadingSettings) {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
      return;
    }

    const gameLoop = (currentTime) => {
      const deltaTime = currentTime - lastDropTime.current;
      const currentInterval = isFastDropping.current ? FAST_DROP_INTERVAL : dropInterval.current;

      if (deltaTime > currentInterval) {
        dropCurrentPiece();
        lastDropTime.current = currentTime;
      }
      redrawGame();
      gameLoopId.current = requestAnimationFrame(gameLoop);
    };

    lastDropTime.current = performance.now();
    gameLoopId.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameLoopId.current);
  }, [gameStarted, gameOver, isPaused, dropCurrentPiece, redrawGame, isLoadingSettings]);


  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameOver || isLoadingSettings) return;
    if (e.key.toLowerCase() === 'p') { e.preventDefault(); setIsPaused(prev => !prev); return; }
    if (isPaused) return;

    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); movePiece(-1, 0); break;
      case 'ArrowRight': e.preventDefault(); movePiece(1, 0); break;
      case 'ArrowDown': 
        e.preventDefault(); 
        isFastDropping.current = true;
        break;
      case 'ArrowUp':
      case ' ': 
      case 'x':
      case 'X':
        e.preventDefault(); handleRotate(); break;
      case 'f': case 'F': e.preventDefault(); toggleFullscreenGame(); break;
      case 'm': case 'M': e.preventDefault(); toggleMute(); break;
      default: break;
    }
  }, [gameStarted, gameOver, isPaused, movePiece, handleRotate, toggleMute, isLoadingSettings]);

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      isFastDropping.current = false;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const toggleFullscreenGame = useCallback(() => {
    if (!document.fullscreenElement) {
      gameAreaRef.current?.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  if (!gameStarted) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold mb-4 text-gradient font-['Space_Grotesk',_sans-serif]">Outwit Tetris Reborn!</h3>
        {isLoadingSettings ? (
            <div className="flex flex-col items-center justify-center my-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground font-['Poppins',_sans-serif]">Loading Game Configuration...</p>
            </div>
        ) : (
            <p className="text-muted-foreground mb-6 font-['Poppins',_sans-serif]">Score {effectiveWinScore} points to win! Arrows to move, Down to speed up, Up/Space/X to rotate. P to Pause. F for Fullscreen. M to Mute.</p>
        )}
        <Button onClick={startGame} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4 button-hover-glow font-['Space_Grotesk',_sans-serif]" disabled={isLoadingSettings}>
          {isLoadingSettings ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Play className="mr-2 h-6 w-6" />}
          {isLoadingSettings ? "Loading..." : "Start Game"}
        </Button>
      </div>
    );
  }

  return (
    <div ref={gameAreaRef} className="flex flex-col items-center p-1 md:p-2 bg-background/50 rounded-lg w-full tetris-game-wrapper">
      <div className="mb-1 md:mb-2 p-1 md:p-2 rounded-lg glassmorphism w-full flex justify-around text-center text-xs sm:text-sm">
        <div><p className="text-muted-foreground font-['Poppins',_sans-serif]">Score</p><p className="font-bold text-primary font-['Space_Grotesk',_sans-serif]">{score}</p></div>
        <div><p className="text-muted-foreground font-['Poppins',_sans-serif]">Level</p><p className="font-bold text-primary font-['Space_Grotesk',_sans-serif]">{level}</p></div>
        <div><p className="text-muted-foreground font-['Poppins',_sans-serif]">Lines</p><p className="font-bold text-primary font-['Space_Grotesk',_sans-serif]">{linesCleared}</p></div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        <div className="tetris-playfield-frame mb-1 md:mb-0 md:mr-1 border-2 border-primary/50 shadow-lg">
          <canvas ref={canvasRef} className="tetris-canvas-main-reborn" />
        </div>
        <div className="tetris-info-panel p-1 glassmorphism rounded-md">
            <p className="text-xs text-center text-muted-foreground font-['Poppins',_sans-serif] mb-0.5">Next:</p>
            <div className="tetris-next-piece-preview-container border border-primary/30">
                <canvas ref={nextPieceCanvasRef} />
            </div>
        </div>
      </div>

      <div className="mt-2 flex space-x-0.5 sm:space-x-1 flex-wrap justify-center">
        <Button variant="outline" onClick={() => movePiece(-1, 0)} disabled={gameOver || isPaused} aria-label="Move Left" className="m-0.5 button-hover-glow"><ArrowLeft /></Button>
        <Button variant="outline" onClick={() => movePiece(1, 0)} disabled={gameOver || isPaused} aria-label="Move Right" className="m-0.5 button-hover-glow"><ArrowRight /></Button>
        <Button variant="outline" onClick={handleRotate} disabled={gameOver || isPaused} aria-label="Rotate" className="m-0.5 button-hover-glow"><RotateCw /></Button>
        <Button variant="outline" onClick={() => { isFastDropping.current = true; }} onMouseUp={() => isFastDropping.current = false} onMouseLeave={() => isFastDropping.current = false} disabled={gameOver || isPaused} aria-label="Drop" className="m-0.5 button-hover-glow"><ArrowDown /></Button>
      </div>
      <div className="mt-1 flex space-x-0.5 sm:space-x-1 flex-wrap justify-center">
        <Button variant="outline" onClick={() => setIsPaused(!isPaused)} disabled={gameOver} aria-label={isPaused ? "Resume" : "Pause"} className="m-0.5 button-hover-glow">
          {isPaused ? <Play /> : <Pause />}
        </Button>
        <Button variant="destructive" onClick={startGame} aria-label="Restart" className="m-0.5 button-hover-glow" disabled={isLoadingSettings}>
            <RotateCcw />
        </Button>
         <Button variant="outline" onClick={toggleFullscreenGame} aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} className="m-0.5 button-hover-glow">
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
        <Button variant="outline" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"} className="m-0.5 button-hover-glow">
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
       {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-10">
          <p className="text-4xl font-bold text-red-500 mb-4">GAME OVER</p>
          <p className="text-xl text-white mb-6">Final Score: {score}</p>
          <Button onClick={startGame} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoadingSettings}>
            Play Again?
          </Button>
        </div>
      )}
    </div>
  );
};

export default TetrisGame;
