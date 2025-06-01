import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const DraggableButton = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  onClick,
  storageKey,
  initialPosition = { x: 100, y: 100 },
  ...props
}) => {
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const savedPosition = localStorage.getItem(storageKey);
      if (savedPosition) {
        try {
          return JSON.parse(savedPosition);
        } catch (e) {
          console.error("Failed to parse saved position:", e);
          return initialPosition;
        }
      }
    }
    return initialPosition;
  });

  const constraintsRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(position));
    }
  }, [position, storageKey]);

  useEffect(() => {
    // Ensure button stays within viewport on resize
    const handleResize = () => {
      if (buttonRef.current && constraintsRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const containerRect = constraintsRef.current.getBoundingClientRect();
        
        setPosition(prev => ({
          x: Math.min(Math.max(0, prev.x), containerRect.width - buttonRect.width),
          y: Math.min(Math.max(0, prev.y), containerRect.height - buttonRect.height),
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <>
      {/* Constraints container - covers the viewport */}
      <div 
        ref={constraintsRef} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          pointerEvents: 'none', /* Allows clicks to pass through */
          zIndex: 9998 /* Below the button itself */
        }} 
      />
      <motion.div
        ref={buttonRef}
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          setPosition({ x: info.point.x, y: info.point.y });
        }}
        initial={false} 
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          "fixed cursor-grab active:cursor-grabbing p-0 rounded-full shadow-xl group",
          "hover:scale-105 transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "animate-subtle-breath"
        )}
        style={{ zIndex: 9999 }}
        whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px hsl(var(--primary))" }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        {...props}
      >
        <Button
          variant={variant}
          size={size}
          className={cn("pl-3 pr-4 py-2 h-auto flex items-center space-x-2 pointer-events-auto", className)}
          onClick={onClick}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
          <span>{children}</span>
        </Button>
      </motion.div>
    </>
  );
};

export default DraggableButton;