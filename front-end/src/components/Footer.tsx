export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-200/50 via-purple-200/50 to-violet-200/50 py-8 mt-8">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center gap-3 text-purple-400/60">
          <span>Made by Made by Made by</span>
          <div className="flex items-center gap-2">
            <div className="text-2xl">⚡</div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              LOGO
            </span>
            <div className="text-2xl">⚡</div>
          </div>
          <span>Made by Made by Made by</span>
        </div>
      </div>
    </footer>
  );
}
