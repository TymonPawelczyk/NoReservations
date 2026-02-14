'use client';

interface ConfirmExitModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmExitModal({ onConfirm, onCancel }: ConfirmExitModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900 to-pink-900 border-4 border-yellow-400 max-w-md w-full p-4 sm:p-6 space-y-4 animate-pulse-once overflow-y-auto max-h-[90vh]">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-4">😱</div>
          <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">Ratunku!</h2>
          <p className="text-yellow-300 font-bold text-base sm:text-lg mb-2">
            Chcesz nas zostawić?
          </p>
          <p className="text-pink-200 text-sm mb-4">
            No dobra, rozumiemy... czasem trzeba się wycofać.
            Ale pamiętaj - jak wyjdziesz, to partner zostanie sam jak palec! 😢
          </p>
          <div className="bg-white/10 border-2 border-white/30 p-3 mb-4">
            <p className="text-white text-xs italic">
              "Nie odchodź do tego światła!" - ktoś mądry, prawdopodobnie
            </p>
          </div>
          <p className="text-red-300 text-xs font-bold">
            ⚠️ Uwaga: Nie ma odwrotu! (no chyba że ponownie dołączysz)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="retro-button flex-1 bg-green-600 hover:bg-green-700"
          >
            💚 Zostaję!
          </button>
          <button
            onClick={onConfirm}
            className="retro-button flex-1 bg-red-600 hover:bg-red-700"
          >
            💔 Wychodzę
          </button>
        </div>
        
        <p className="text-center text-white/50 text-xs">
          (Serio, zostań... będzie fajnie!)
        </p>
      </div>
    </div>
  );
}
