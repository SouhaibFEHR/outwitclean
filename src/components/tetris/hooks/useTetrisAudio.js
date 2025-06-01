import { useRef, useEffect, useState, useCallback } from 'react';

export const useTetrisAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef({
    move: null,
    rotate: null,
    drop: null,
    lineClear: null,
    gameOver: null,
  });

  useEffect(() => {
    audioRefs.current.move = new Audio('/assets/sounds/tetris_move.wav');
    audioRefs.current.rotate = new Audio('/assets/sounds/tetris_rotate.wav');
    audioRefs.current.drop = new Audio('/assets/sounds/tetris_drop.wav');
    audioRefs.current.lineClear = new Audio('/assets/sounds/tetris_lineclear.wav');
    audioRefs.current.gameOver = new Audio('/assets/sounds/tetris_gameover.wav');
    
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = 0.3; // Default volume
        audio.onerror = (e) => console.warn(`Audio error for ${audio.src}:`, e);
      }
    });
  }, []);

  const playSound = useCallback((soundName) => {
    if (!isMuted && audioRefs.current[soundName]) {
      audioRefs.current[soundName].currentTime = 0;
      audioRefs.current[soundName].play().catch(e => console.warn(`Audio play failed for ${soundName}:`, e));
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, playSound, toggleMute };
};