
import { useState, useRef, useEffect, useCallback } from 'react';
import { GestureState, HandData } from '../types';
import { GESTURE_THRESHOLDS } from '../constants';

export const useGestureStateMachine = (handData: HandData | null) => {
  const [state, setState] = useState<GestureState>(GestureState.IDLE);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Fixed: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility
  const fistHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastX = useRef<number | null>(null);
  const waveAccumulator = useRef<number>(0);

  useEffect(() => {
    if (!handData) return;

    // FIST (Hold 0.5s) -> IDLE
    if (handData.gesture === 'FIST') {
      if (!fistHoldTimer.current) {
        fistHoldTimer.current = setTimeout(() => {
          setState(GestureState.IDLE);
          setSelectedIndex(null);
        }, GESTURE_THRESHOLDS.FIST_HOLD_TIME);
      }
    } else {
      if (fistHoldTimer.current) {
        clearTimeout(fistHoldTimer.current);
        fistHoldTimer.current = null;
      }
    }

    // OPEN -> SHUFFLING or RESETTING
    if (handData.gesture === 'OPEN') {
      if (state === GestureState.REVEALING || state === GestureState.SELECTING) {
        // Transitional state back to shuffle
        setState(GestureState.SHUFFLING);
        setSelectedIndex(null);
      } else if (state === GestureState.IDLE) {
        setState(GestureState.SHUFFLING);
      }
    }

    // POINTING -> SELECTING
    if (handData.gesture === 'POINTING' && state === GestureState.SHUFFLING) {
      setState(GestureState.SELECTING);
      setSelectedIndex(Math.floor(Math.random() * 22));
    }

    // WAVING -> REVEALING
    // Detecting waving: change in X beyond threshold
    if (state === GestureState.SELECTING) {
      if (lastX.current !== null) {
        const deltaX = Math.abs(handData.x - lastX.current);
        if (deltaX > 0.05) { // Roughly > 10 degrees in FOV
          waveAccumulator.current += deltaX;
          if (waveAccumulator.current > 0.3) {
             setState(GestureState.REVEALING);
             waveAccumulator.current = 0;
          }
        }
      }
      lastX.current = handData.x;
    } else {
      lastX.current = null;
      waveAccumulator.current = 0;
    }

  }, [handData, state]);

  // Mouse Fallback for testing or missing camera
  const triggerState = useCallback((newState: GestureState) => {
    setState(newState);
    if (newState === GestureState.SELECTING) {
        setSelectedIndex(Math.floor(Math.random() * 22));
    } else if (newState === GestureState.IDLE) {
        setSelectedIndex(null);
    }
  }, []);

  return { state, selectedIndex, triggerState };
};
