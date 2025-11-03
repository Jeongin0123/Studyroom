export function GrowthBar({ label, value, max=100 }:{label:string; value:number; max?:number}) {
  const pct = Math.max(0, Math.min(100, Math.round((value/max)*100)));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded bg-gray-200">
        <div className="h-2 rounded bg-blue-500" style={{width:`${pct}%`}} />
      </div>
    </div>
  );
}
