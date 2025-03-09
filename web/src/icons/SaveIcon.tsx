interface SaveIconProps {
  filled?: boolean;
  className?: string;
}

export default function SaveIcon({ filled, className = "" }: SaveIconProps) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}