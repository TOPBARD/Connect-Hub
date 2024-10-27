const XSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <circle
      cx="24"
      cy="24"
      r="22"
      stroke="#4A90E2"
      strokeWidth="3"
      fill="none"
    />

    {/* Centered "C" slightly shifted left */}
    <path
      d="M16.5 24c0-4 3.5-7 7-7"
      stroke="#4A90E2"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M16.5 24c0 4 3.5 7 7 7"
      stroke="#4A90E2"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Centered "H" */}
    <line
      x1="29"
      y1="17"
      x2="29"
      y2="31"
      stroke="#4A90E2"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="35"
      y1="17"
      x2="35"
      y2="31"
      stroke="#4A90E2"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="29"
      y1="24"
      x2="35"
      y2="24"
      stroke="#4A90E2"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);
export default XSvg;
