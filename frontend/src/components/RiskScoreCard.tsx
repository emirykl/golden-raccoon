function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(100, 100, 74, endAngle);
  const end = polarToCartesian(100, 100, 74, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A 74 74 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function RiskScoreCard({ score }: { score: number }) {
  const boundedScore = Math.min(100, Math.max(0, score));
  const level = boundedScore >= 71 ? "High" : boundedScore >= 41 ? "Medium" : "Low";
  const markerAngle = -90 + boundedScore * 1.8;
  const marker = polarToCartesian(100, 100, 74, markerAngle);
  const markerStem = polarToCartesian(100, 100, 58, markerAngle);
  const markerColor = boundedScore >= 71 ? "#ff6b6b" : boundedScore >= 41 ? "#f2c86d" : "#60d394";

  return (
    <section className="glass-panel flex h-full flex-col rounded-[28px] p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/54">Portfolio risk</div>
          <div className="mt-1 text-4xl font-semibold">{boundedScore}/100</div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs font-medium" style={{ color: markerColor }}>
          {level}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <svg viewBox="0 0 200 128" className="h-40 w-full max-w-xs overflow-visible" role="img" aria-label={`Portfolio risk ${boundedScore} out of 100`}>
          <defs>
            <linearGradient id="riskGaugeGradient" x1="24" x2="176" y1="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60d394" />
              <stop offset="50%" stopColor="#f2c86d" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
          </defs>
          <path d={arcPath(-90, 90)} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="16" strokeLinecap="round" />
          <path d={arcPath(-90, 90)} fill="none" stroke="url(#riskGaugeGradient)" strokeWidth="16" strokeLinecap="round" />
          <line x1={markerStem.x} y1={markerStem.y} x2={marker.x} y2={marker.y} stroke="#050505" strokeWidth="4" strokeLinecap="round" />
          <circle cx={marker.x} cy={marker.y} r="9" fill="#fff" stroke="#050505" strokeWidth="3" />
          <circle cx={marker.x} cy={marker.y} r="4" fill={markerColor} />
          <text x="100" y="78" textAnchor="middle" className="fill-white text-4xl font-semibold">
            {boundedScore}
          </text>
          <text x="100" y="106" textAnchor="middle" className="fill-white/45 text-sm">
            {level} risk
          </text>
          <text x="26" y="124" textAnchor="middle" className="fill-white/32 text-xs">
            Low
          </text>
          <text x="100" y="124" textAnchor="middle" className="fill-white/32 text-xs">
            Medium
          </text>
          <text x="174" y="124" textAnchor="middle" className="fill-white/32 text-xs">
            High
          </text>
        </svg>
      </div>
    </section>
  );
}
