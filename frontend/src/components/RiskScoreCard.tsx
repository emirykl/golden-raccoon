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
  const markerColor = boundedScore >= 71 ? "#ff6b6b" : boundedScore >= 41 ? "#f2c86d" : "#60d394";

  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/54">Portfolio risk</div>
          <div className="mt-1 text-4xl font-semibold">{boundedScore}/100</div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs font-medium" style={{ color: markerColor }}>
          {level}
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        <svg viewBox="0 0 200 116" className="h-36 w-full max-w-xs overflow-visible" role="img" aria-label={`Portfolio risk ${boundedScore} out of 100`}>
          <path d={arcPath(-90, -18)} fill="none" stroke="#60d394" strokeWidth="12" strokeLinecap="round" />
          <path d={arcPath(-12, 38)} fill="none" stroke="#f2c86d" strokeWidth="12" strokeLinecap="round" />
          <path d={arcPath(44, 90)} fill="none" stroke="#ff6b6b" strokeWidth="12" strokeLinecap="round" />
          <circle cx={marker.x} cy={marker.y} r="7" fill="#fff" stroke="#050505" strokeWidth="2" />
          <text x="100" y="78" textAnchor="middle" className="fill-white text-4xl font-semibold">
            {boundedScore}
          </text>
          <text x="100" y="104" textAnchor="middle" className="fill-white/45 text-sm">
            {level} risk
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/38">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </section>
  );
}
