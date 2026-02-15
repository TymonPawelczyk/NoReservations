'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SessionData } from '@/lib/session';
import Avatar from '@/components/Avatar';
import Stage1 from '@/components/stages/Stage1';
import Stage2 from '@/components/stages/Stage2';
import Stage3 from '@/components/stages/Stage3';
import ConfirmExitModal from '@/components/ConfirmExitModal';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStageView, setCurrentStageView] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const advancingStageRef = useRef(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedCode = localStorage.getItem('sessionCode');

    if (!storedUserId || storedCode !== code) {
      router.push('/');
      return;
    }

    setUserId(storedUserId);

    // Real-time listener
    const unsubscribe = onSnapshot(doc(db, 'sessions', code), (snapshot) => {
      if (snapshot.exists()) {
        setSession(snapshot.data() as SessionData);
        setLoading(false);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [code, router]);

  // Check if both users are ready and advance to next stage
  useEffect(() => {
    if (!session || !userId) return;

    const ready = session.ready || {};
    const userIds = Object.keys(ready);

    // Check if both users are ready (2 users, both true)
    if (userIds.length === 2 && userIds.every(uid => ready[uid] === true)) {
      // Prevent multiple simultaneous advances
      if (advancingStageRef.current) return;
      advancingStageRef.current = true;

      // Both ready - advance to next stage after a short delay
      const advanceStage = async () => {
        const nextStage = (session.stage + 1) as 1 | 2 | 3;
        if (nextStage > 3) {
          advancingStageRef.current = false;
          return; // Don't go beyond stage 3
        }

        // Small delay so users see both are ready
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
          await updateDoc(doc(db, 'sessions', code), {
            stage: nextStage,
            stageUnlockedAt: new Date().toISOString(),
            // Reset ready flags for next stage
            ready: {
              [userIds[0]]: false,
              [userIds[1]]: false,
            },
          });
        } catch (err) {
          console.error('Error advancing stage:', err);
        } finally {
          advancingStageRef.current = false;
        }
      };

      // Advance stage
      advanceStage();
    } else {
      // Reset flag when not both ready
      advancingStageRef.current = false;
    }
  }, [session, userId, code]);

  const handleReady = async () => {
    if (!userId) return;

    try {
      await updateDoc(doc(db, 'sessions', code), {
        [`ready.${userId}`]: true,
      });
    } catch (err) {
      console.error('Error marking ready:', err);
    }
  };

  const handleExitSession = () => {
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionCode');
    localStorage.removeItem('userName');
    
    // Redirect to home
    router.push('/');
  };

  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  if (loading || !session || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  // Get participants
  const participants = Object.entries(session.participants || {});
  const currentUser = participants.find(([uid]) => uid === userId)?.[1];
  const partner = participants.find(([uid]) => uid !== userId)?.[1];
  const isWaitingForPartner = participants.length < 2;

  // Stage rendering
  if (currentStageView !== null) {
    switch (currentStageView) {
      case 1:
        return <Stage1 code={code} userId={userId} onComplete={() => setCurrentStageView(null)} />;
      case 2:
        return <Stage2 code={code} userId={userId} onComplete={() => setCurrentStageView(null)} />;
      case 3:
        return <Stage3 code={code} userId={userId} onComplete={() => setCurrentStageView(null)} />;
    }
  }

  // Main stage map view
  return (
    <main className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with code */}
        <div className="text-center bg-white/10 border-4 border-white/30 p-4">
          <h2 className="text-white text-sm mb-2">Kod sesji:</h2>
          <div className="text-2xl sm:text-4xl font-bold text-yellow-400 tracking-widest">{code}</div>
          {isWaitingForPartner && (
            <p className="text-pink-200 text-xs mt-2">Czekam na partnera...</p>
          )}
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current User */}
          <div className="bg-white/10 border-4 border-yellow-400 p-4 text-center">
            <Avatar avatarKey={currentUser?.avatarKey || 'tymon'} emotion="happy" size={100} animated={true} clickable={true} />
            <p className="text-white font-bold mt-2">TY</p>
            <p className="text-pink-200 text-xs">{currentUser?.displayName}</p>
          </div>

          {/* Partner */}
          <div className="bg-white/10 border-4 border-white/30 p-4 text-center">
            {partner ? (
              <>
                <Avatar avatarKey={partner.avatarKey} emotion="happy" size={100} animated={true} clickable={true} />
                <p className="text-white font-bold mt-2">PARTNER</p>
                <p className="text-pink-200 text-xs">{partner.displayName}</p>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-white/50">
                <div>
                  <div className="text-4xl mb-2">❓</div>
                  <p className="text-xs">Oczekiwanie...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stage Map */}
        <div className="space-y-4">
          <h3 className="text-white text-center text-xl font-bold">Etapy randki</h3>

          {/* Stage 1 */}
          <StageCard
            number={1}
            title="🍝 Jedzenie"
            locked={session.stage < 1}
            current={session.stage === 1}
            completed={session.stage > 1}
            onEnter={() => setCurrentStageView(1)}
            disabled={isWaitingForPartner}
          />

          {/* Stage 2 */}
          <StageCard
            number={2}
            title="🎮 Co robimy?"
            locked={session.stage < 2}
            current={session.stage === 2}
            completed={session.stage > 2}
            onEnter={() => setCurrentStageView(2)}
            disabled={isWaitingForPartner}
          />

          {/* Stage 3 */}
          <StageCard
            number={3}
            title="🏆 Nagrody"
            locked={session.stage < 3}
            current={session.stage === 3}
            completed={session.stage > 3}
            onEnter={() => setCurrentStageView(3)}
            disabled={isWaitingForPartner}
          />
        </div>

        {/* Ready Button */}
        {!isWaitingForPartner && session.ready && (
          <div className="bg-white/10 border-4 border-white/30 p-4">
            <p className="text-white text-sm text-center mb-3">
              Gotowi na następny etap?
            </p>
            <div className="flex gap-2 justify-center mb-3">
              <span className={`px-3 py-1 text-xs ${session.ready[userId] ? 'bg-green-500' : 'bg-gray-500'}`}>
                TY: {session.ready[userId] ? '✓' : '○'}
              </span>
              <span className={`px-3 py-1 text-xs ${session.ready[Object.keys(session.ready).find(id => id !== userId) || ''] ? 'bg-green-500' : 'bg-gray-500'}`}>
                PARTNER: {session.ready[Object.keys(session.ready).find(id => id !== userId) || ''] ? '✓' : '○'}
              </span>
            </div>
            
            {/* Both ready - transitioning */}
            {Object.values(session.ready).length === 2 && 
             Object.values(session.ready).every(r => r === true) && (
              <div className="text-center space-y-2 animate-pulse">
                <p className="text-green-400 font-bold text-lg">🎉 2/2 Gotowe!</p>
                <p className="text-pink-200 text-xs">Przechodzę do następnego etapu...</p>
              </div>
            )}
            
            {/* Not both ready yet */}
            {!(Object.values(session.ready).length === 2 && 
               Object.values(session.ready).every(r => r === true)) && (
              <>
                {!session.ready[userId] && (
                  <button onClick={handleReady} className="retro-button w-full">
                    Lecimy dalej!
                  </button>
                )}
                {session.ready[userId] && (
                  <p className="text-center text-pink-200 text-xs">Czekam na partnera...</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Exit Button */}
        <div className="mt-8 pt-4 border-t-2 border-white/20">
          <button
            onClick={handleExitClick}
            className="text-red-300 hover:text-red-400 text-sm w-full text-center transition-colors"
          >
            🚪 Wyjdź z sesji
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <ConfirmExitModal
          onConfirm={handleExitSession}
          onCancel={handleCancelExit}
        />
      )}
    </main>
  );
}

interface StageCardProps {
  number: number;
  title: string;
  locked: boolean;
  current: boolean;
  completed: boolean;
  onEnter: () => void;
  disabled: boolean;
}

function StageCard({ number, title, locked, current, completed, onEnter, disabled }: StageCardProps) {
  let bgClass = 'bg-white/10 border-white/30';
  let textClass = 'text-white/50';
  let icon = '🔒';

  if (completed) {
    bgClass = 'bg-green-500/30 border-green-500';
    textClass = 'text-green-300';
    icon = '✓';
  } else if (current) {
    bgClass = 'bg-yellow-400/30 border-yellow-400';
    textClass = 'text-yellow-400';
    icon = '▶';
  }

  return (
    <button
      onClick={onEnter}
      disabled={locked || disabled}
      className={`w-full p-4 sm:p-6 border-4 ${bgClass} ${textClass} text-left transition-all ${
        !locked && !disabled ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="text-2xl sm:text-4xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base sm:text-lg">Etap {number}</div>
          <div className="text-xs sm:text-sm">{title}</div>
        </div>
      </div>
    </button>
  );
}
