export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            BEZ
            <br />
            REZERWACJI
          </h1>
          <p className="text-sm text-pink-200">Randka dla dwojga 💕</p>
        </div>

        <div className="space-y-4 pt-8">
          <a 
            href="/create"
            className="block retro-button w-full"
          >
            Utwórz sesję
          </a>
          
          <a 
            href="/join"
            className="block retro-button w-full"
          >
            Dołącz do sesji
          </a>
        </div>

        <div className="pt-8 text-xs text-pink-300">
          <p>Pixel Dating Experience</p>
          <p className="mt-2">🎮 v0.1.0</p>
        </div>
      </div>
    </main>
  );
}
