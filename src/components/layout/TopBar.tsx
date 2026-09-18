interface TopBarProps {
  onAddLocation: () => void;
  onOpenSettings: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  activeView: 'mapa' | 'rutas';
  onChangeView: (view: 'mapa' | 'rutas') => void;
}

export function TopBar({
  onAddLocation,
  onOpenSettings,
  search,
  onSearchChange,
  activeView,
  onChangeView,
}: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2C7.6 2 4 5.5 4 9.9 4 15.9 12 22 12 22s8-6.1 8-12.1C20 5.5 16.4 2 12 2zm0 10.5a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">GeoLogística</span>
      </div>

      <nav className="ml-2 flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => onChangeView('mapa')}
          className={`rounded-md px-3 py-1.5 transition ${
            activeView === 'mapa' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Mapa
        </button>
        <button
          type="button"
          onClick={() => onChangeView('rutas')}
          className={`rounded-md px-3 py-1.5 transition ${
            activeView === 'rutas' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rutas
        </button>
      </nav>

      <div className="mx-auto flex max-w-md flex-1 items-center">
        <div className="relative w-full">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔎
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, código o dirección…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onAddLocation}
        className="whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
      >
        + Agregar ubicación
      </button>

      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Configuración"
        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
      >
        ⚙️
      </button>
    </header>
  );
}
