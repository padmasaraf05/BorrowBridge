interface BorrowBridgeLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const BorrowBridgeLogo = ({ size = 48, showText = true, className = "" }: BorrowBridgeLogoProps) => {
  const iconSize = size;
  const textScale = size / 48;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left person (teal) */}
        <circle cx="28" cy="14" r="7" fill="#0d9488" />
        <path d="M20 26c0-4.4 3.6-8 8-8s8 3.6 8 8v14h-16V26z" fill="#0d9488" />
        {/* Left arm reaching right */}
        <path d="M36 30c4-2 8-2 12 0" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />

        {/* Right person (orange) */}
        <circle cx="72" cy="14" r="7" fill="#f59e0b" />
        <path d="M64 26c0-4.4 3.6-8 8-8s8 3.6 8 8v14H64V26z" fill="#f59e0b" />
        {/* Right arm reaching left */}
        <path d="M64 30c-4-2-8-2-12 0" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

        {/* Book in center */}
        <rect x="44" y="24" width="12" height="9" rx="1" fill="#f59e0b" />
        <line x1="50" y1="24" x2="50" y2="33" stroke="#fbbf24" strokeWidth="1" />
        <rect x="44" y="24" width="12" height="2" rx="0.5" fill="#d97706" />

        {/* Bridge arches - left teal, right orange */}
        <path d="M10 70 Q25 52 40 70" stroke="#0d9488" strokeWidth="3" fill="none" />
        <path d="M30 70 Q45 52 60 70" stroke="#0d9488" strokeWidth="3" fill="none" opacity="0.7" />
        <path d="M40 70 Q55 52 70 70" stroke="#f59e0b" strokeWidth="3" fill="none" opacity="0.7" />
        <path d="M60 70 Q75 52 90 70" stroke="#f59e0b" strokeWidth="3" fill="none" />
        {/* Bridge deck */}
        <line x1="5" y1="70" x2="50" y2="70" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="70" x2="95" y2="70" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {showText && (
        <span
          className="font-bold leading-none"
          style={{ fontSize: `${14 * textScale}px` }}
        >
          <span style={{ color: "#0d9488" }}>Borrow</span>
          <span style={{ color: "#f59e0b" }}>Bridge</span>
        </span>
      )}
    </div>
  );
};

export default BorrowBridgeLogo;
