import type { ImportSummary } from '@/types/location';

export function StatsCounters({ summary }: { summary: ImportSummary }) {
  const items = [
    { label: 'Registradas', value: summary.total, tone: 'text-slate-900' },
    { label: 'Geolocalizadas', value: summary.geolocalizadas, tone: 'text-emerald-600' },
    { label: 'Pendientes', value: summary.pendientes, tone: 'text-amber-600' },
    { label: 'Duplicados', value: summary.duplicadasLiterales, tone: 'text-slate-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
          <div className={`text-lg font-semibold ${item.tone}`}>{item.value}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
