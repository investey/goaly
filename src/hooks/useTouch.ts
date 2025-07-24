import { useCallback } from 'react';

interface UseTouchProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  touchStartY: number | null;
  isScrolling: boolean;
  setTouchStartY: (y: number | null) => void;
  setIsScrolling: (scrolling: boolean) => void;
}

export const useTouch = ({
  onSwipeUp,
  onSwipeDown,
  touchStartY,
  isScrolling,
  setTouchStartY,
  setIsScrolling
}: UseTouchProps) => {
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setIsScrolling(false);
  }, [setTouchStartY, setIsScrolling]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY === null) return;
    
    const currentY = e.touches[0].clientY;
    const diff = Math.abs(currentY - touchStartY);
    
    if (diff > 10) {
      setIsScrolling(true);
    }
  }, [touchStartY, setTouchStartY, setIsScrolling]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY === null || !isScrolling) {
      setTouchStartY(null);
      setIsScrolling(false);
      return;
    }

    const endY = e.changedTouches[0].clientY;
    const diff = touchStartY - endY;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        onSwipeUp();
      } else {
        onSwipeDown();
      }
    }

    setTouchStartY(null);
    setIsScrolling(false);
  }, [touchStartY, isScrolling, onSwipeUp, onSwipeDown, setTouchStartY, setIsScrolling]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};