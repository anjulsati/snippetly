export default function Logo({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
            <defs>
                <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#34D399" />
                    <stop offset="1" stopColor="#22D3EE" />
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logo-g)" />
            <path
                d="M12 10l-5 6 5 6M20 10l5 6-5 6"
                stroke="#06281C"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}
