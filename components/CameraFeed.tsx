
import React, { useEffect, useRef, useState } from 'react';
import { HandData } from '../types';

interface CameraFeedProps {
  onHandUpdate: (data: HandData | null) => void;
  showSkeleton?: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onHandUpdate, showSkeleton = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hands: any = null;
    let camera: any = null;
    let isActive = true;

    const setupMediaPipe = async () => {
      try {
        const loadScript = (src: string) => new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.crossOrigin = "anonymous";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // Load scripts sequentially to ensure dependencies
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');

        const mpHands = (window as any).Hands;
        const mpCamera = (window as any).Camera;
        
        // MediaPipe drawing utils often exports functions directly to the window object
        const drawConnectors = (window as any).drawConnectors;
        const drawLandmarks = (window as any).drawLandmarks;
        const handConnections = (window as any).HAND_CONNECTIONS;

        if (!mpHands || !videoRef.current || !canvasRef.current) {
          throw new Error("Failed to initialize MediaPipe components");
        }

        hands = new mpHands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        const onResults = (results: any) => {
          if (!isActive || !canvasRef.current) return;

          const canvasCtx = canvasRef.current.getContext('2d');
          if (!canvasCtx) return;

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            if (showSkeleton && drawConnectors && drawLandmarks) {
              drawConnectors(canvasCtx, landmarks, handConnections, { color: '#c5a059', lineWidth: 2 });
              drawLandmarks(canvasCtx, landmarks, { color: '#7b2cbf', lineWidth: 1, radius: 2 });
            }

            // Simple Gesture Logic
            const isFist = (lm: any) => {
              const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
              const tips = [8, 12, 16, 20];
              const mids = [6, 10, 14, 18];
              let foldedCount = 0;
              tips.forEach((t, i) => {
                if (dist(lm[t], lm[0]) < dist(lm[mids[i]], lm[0])) foldedCount++;
              });
              return foldedCount >= 3;
            };

            const isPointing = (lm: any) => {
              const tips = [12, 16, 20];
              const mids = [10, 14, 18];
              let foldedCount = 0;
              tips.forEach((t, i) => {
                 if (lm[t].y > lm[mids[i]].y) foldedCount++;
              });
              return foldedCount === 3 && lm[8].y < lm[6].y;
            };

            const isOpen = (lm: any) => {
               const tips = [8, 12, 16, 20];
               let extendedCount = 0;
               tips.forEach(t => { if (lm[t].y < lm[t-2].y) extendedCount++; });
               return extendedCount >= 4;
            };

            let gesture: any = 'UNKNOWN';
            if (isFist(landmarks)) gesture = 'FIST';
            else if (isPointing(landmarks)) gesture = 'POINTING';
            else if (isOpen(landmarks)) gesture = 'OPEN';

            onHandUpdate({
              landmarks,
              gesture,
              x: landmarks[9].x,
              y: landmarks[9].y,
              velocity: { x: 0, y: 0 }
            });
          } else {
            onHandUpdate(null);
          }
          canvasCtx.restore();
        };

        hands.onResults(onResults);

        camera = new mpCamera(videoRef.current, {
          onFrame: async () => {
            if (hands && isActive) {
              try {
                await hands.send({ image: videoRef.current! });
              } catch (e) {
                console.warn("Hand processing frame error", e);
              }
            }
          },
          width: 320,
          height: 240
        });

        camera.start().catch((err: any) => {
          console.error("Camera access error", err);
          if (isActive) setError(err.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'CAMERA_ERROR');
        });
      } catch (e) {
        console.error("MediaPipe Setup Error", e);
        if (isActive) setError('SETUP_ERROR');
      }
    };

    setupMediaPipe();

    return () => {
      isActive = false;
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed top-6 right-6 w-80 h-60 rounded-xl overflow-hidden border-2 border-indigo-900 shadow-2xl opacity-80 z-50 bg-[#0a0a1a]">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-indigo-950/90 text-white">
          <svg className="w-8 h-8 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60">Camera Error</span>
          <p className="text-[11px] mt-2 text-indigo-200">
            {error === 'PERMISSION_DENIED' 
              ? 'Please grant camera access to use hand gestures.' 
              : 'Failed to initialize hand tracking. Mouse controls available.'}
          </p>
        </div>
      ) : (
        <>
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline muted />
          <canvas ref={canvasRef} width={320} height={240} className="absolute inset-0 w-full h-full scale-x-[-1]" />
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-[10px] uppercase tracking-widest rounded text-[#c5a059]">
            Live Feed
          </div>
        </>
      )}
    </div>
  );
};

export default CameraFeed;
