
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette, Noise } from '@react-three/postprocessing';
import { TAROT_DECK, THEME } from './constants';
import { GestureState, HandData } from './types';
import TarotCard from './components/TarotCard';
import CameraFeed from './components/CameraFeed';
import BackgroundParticles from './components/BackgroundParticles';
import { useGestureStateMachine } from './hooks/useGestureStateMachine';

const App: React.FC = () => {
  const [handData, setHandData] = useState<HandData | null>(null);
  const { state, selectedIndex, triggerState } = useGestureStateMachine(handData);
  const [showGuide, setShowGuide] = useState(true);

  const currentCard = selectedIndex !== null ? TAROT_DECK[selectedIndex] : null;

  return (
    <div className="relative w-screen h-screen bg-[#050510] text-white overflow-hidden font-sans">
      {/* Background/Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#050510']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color={THEME.etherealGold} />
          <pointLight position={[-10, -10, -5]} intensity={0.8} color={THEME.glowPurple} />

          <Suspense fallback={null}>
            <BackgroundParticles />
            {TAROT_DECK.map((card, i) => (
              <TarotCard
                key={card.id}
                index={i}
                total={TAROT_DECK.length}
                info={card}
                currentState={state}
                handX={handData?.x ?? 0.5}
                handY={handData?.y ?? 0.5}
                isSelected={selectedIndex === i}
              />
            ))}
          </Suspense>

          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.9} radius={0.4} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none z-10 p-10 flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="animate-in fade-in slide-in-from-top duration-1000">
            <h1 className="serif text-5xl font-light tracking-widest text-gold-300 drop-shadow-[0_0_15px_rgba(197,160,89,0.3)] opacity-80">
              ETHEREAL <span className="text-white/20">TAROT</span>
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
              Gesture-Based Ritual Interface v1.0
            </p>
          </div>
          
          <div className="text-right pointer-events-auto">
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 rounded-full hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              {showGuide ? 'Hide Guide' : 'Show Guide'}
            </button>
          </div>
        </div>

        {/* Selected Card Info */}
        <div className={`transition-all duration-1000 delay-300 ${state === GestureState.REVEALING ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
          {currentCard && (
            <div className="max-w-md bg-black/60 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <span className="text-xs uppercase tracking-[0.4em] text-gold-500 mb-2 block">The Drawn Arcana</span>
              <h2 className="serif text-4xl mb-4 text-[#f0d78c]">{currentCard.name}</h2>
              <p className="text-sm leading-relaxed text-white/70 italic">
                "{currentCard.description}"
              </p>
            </div>
          )}
        </div>

        {/* Footer / Status */}
        <div className="flex justify-between items-end">
          <div className="flex gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Ritual State</span>
                <span className="text-sm font-mono tracking-tighter text-gold-200 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {state}
                </span>
             </div>
             {handData && (
               <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Detected Gesture</span>
                  <span className="text-sm font-mono tracking-tighter text-purple-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {handData.gesture}
                  </span>
               </div>
             )}
          </div>

          <div className="text-right flex flex-col items-end pointer-events-auto">
             <span className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Controls Fallback</span>
             <div className="flex gap-2">
                {[
                  { s: GestureState.IDLE, l: 'Fist (Reset)' },
                  { s: GestureState.SHUFFLING, l: 'Open (Shuffle)' },
                  { s: GestureState.SELECTING, l: 'Point (Draw)' },
                  { s: GestureState.REVEALING, l: 'Wave (Flip)' }
                ].map(btn => (
                  <button 
                    key={btn.s}
                    onClick={() => triggerState(btn.s)} 
                    className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border rounded transition-all ${state === btn.s ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-white/40 hover:bg-white/5'}`}
                  >
                    {btn.l}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Camera Feed */}
      <CameraFeed onHandUpdate={setHandData} />

      {/* Guide Overlay */}
      {showGuide && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-40 flex items-center justify-center p-10">
          <div className="max-w-2xl w-full bg-[#0a0a1a] p-12 rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(123,44,191,0.2)] text-center animate-in zoom-in-95 duration-500">
            <h3 className="serif text-5xl mb-8 text-[#f0d78c] tracking-tight drop-shadow-[0_0_20px_rgba(240,215,140,0.3)]">Initiate Ritual</h3>
            <div className="grid grid-cols-2 gap-8 mb-10 text-left">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full border border-gold-500/30 flex items-center justify-center text-xs text-gold-400 font-mono">01</div>
                  <p className="text-sm leading-relaxed"><span className="text-gold-400 font-bold uppercase tracking-wider block mb-1">✊ FIST</span> Clench your hand to stack the deck and reset the ritual space.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full border border-gold-500/30 flex items-center justify-center text-xs text-gold-400 font-mono">02</div>
                  <p className="text-sm leading-relaxed"><span className="text-gold-400 font-bold uppercase tracking-wider block mb-1">✋ OPEN PALM</span> Spread your fingers to let the cards flow across the void.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full border border-gold-500/30 flex items-center justify-center text-xs text-gold-400 font-mono">03</div>
                  <p className="text-sm leading-relaxed"><span className="text-gold-400 font-bold uppercase tracking-wider block mb-1">☝️ POINT</span> Direct your index finger to select a card from the deck.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full border border-gold-500/30 flex items-center justify-center text-xs text-gold-400 font-mono">04</div>
                  <p className="text-sm leading-relaxed"><span className="text-gold-400 font-bold uppercase tracking-wider block mb-1">👋 WAVE</span> Move your finger horizontally to flip and reveal your destiny.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowGuide(false)}
              className="px-12 py-4 bg-indigo-900/40 hover:bg-indigo-800/60 text-white rounded-full text-xs uppercase tracking-[0.5em] transition-all border border-indigo-700/50 pointer-events-auto hover:shadow-[0_0_30px_rgba(123,44,191,0.4)]"
            >
              Begin Experience
            </button>
            <p className="mt-8 text-[10px] text-white/30 uppercase tracking-[0.2em]">Ensure you are in a well-lit environment</p>
          </div>
        </div>
      )}

      {/* Custom Styles for text glow */}
      <style>{`
        .text-gold-300 { color: #d4af37; }
        .text-gold-400 { color: #f0d78c; }
        .text-gold-500 { color: #c5a059; }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top { from { transform: translateY(-20px); } to { transform: translateY(0); } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .animate-in { animation: fade-in 1s ease-out; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-top { animation-name: slide-in-from-top; }
        .zoom-in-95 { animation-name: zoom-in-95; }
        .duration-1000 { animation-duration: 1000ms; }
        .duration-500 { animation-duration: 500ms; }
      `}</style>
    </div>
  );
};

export default App;
