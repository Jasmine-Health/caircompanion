interface SplashScreenProps {
  fading?: boolean;
}

export function SplashScreen({ fading = false }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#453575' }}
      aria-hidden="true"
    >
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="CairCompanion"
        className="w-[120px] h-[120px] object-contain mb-4"
      />
      <div className="text-[34px] font-black tracking-tight mb-2">
        <span className="text-white">C</span>
        <span className="text-orange-400">ai</span>
        <span className="text-white">r</span>
        <span className="text-white">IQ</span>
      </div>
      <p className="text-2xl font-black text-white tracking-wide">CairCompanion</p>
    </div>
  );
}
