import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { DashboardPage } from '@/pages/DashboardPage';
import { RoutesPage } from '@/pages/RoutesPage';
import { LocationForm } from '@/components/locations/LocationForm';
import { DeleteConfirmDialog } from '@/components/locations/DeleteConfirmDialog';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { useLocations } from '@/hooks/useLocations';
import { isSupabaseConfigured } from '@/services/supabaseClient';

type ModalState = { kind: 'none' } | { kind: 'create' } | { kind: 'edit' } | { kind: 'delete' } | { kind: 'settings' };

export default function App() {
  const store = useLocations();
  const [view, setView] = useState<'mapa' | 'rutas'>('mapa');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(input: Parameters<typeof store.add>[0]) {
    setFormError(null);
    try {
      await store.add(input);
      setModal({ kind: 'none' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar la ubicación.');
    }
  }

  async function handleEditSubmit(input: Parameters<typeof store.add>[0]) {
    if (!store.selected) return;
    setFormError(null);
    try {
      await store.edit(store.selected.id, input);
      setModal({ kind: 'none' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo actualizar la ubicación.');
    }
  }

  async function handleDelete() {
    if (!store.selected) return;
    setDeleting(true);
    try {
      await store.remove(store.selected.id);
      setModal({ kind: 'none' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        onAddLocation={() => setModal({ kind: 'create' })}
        onOpenSettings={() => setModal({ kind: 'settings' })}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        search={store.filters.search}
        onSearchChange={(search) => store.setFilters({ ...store.filters, search })}
        activeView={view}
        onChangeView={setView}
      />

      {store.loading && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner label="Cargando ubicaciones…" />
        </div>
      )}

      {!store.loading && store.error && (
        <div className="flex flex-1 items-center justify-center text-sm text-red-600">{store.error}</div>
      )}

      {!store.loading && !store.error && view === 'mapa' && (
        <DashboardPage
          store={store}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onEdit={() => setModal({ kind: 'edit' })}
          onDelete={() => setModal({ kind: 'delete' })}
        />
      )}

      {!store.loading && !store.error && view === 'rutas' && <RoutesPage locations={store.locations} />}

      {modal.kind === 'create' && (
        <LocationForm
          onCancel={() => setModal({ kind: 'none' })}
          onSubmit={handleCreate}
        />
      )}

      {modal.kind === 'edit' && store.selected && (
        <LocationForm
          initial={store.selected}
          onCancel={() => setModal({ kind: 'none' })}
          onSubmit={handleEditSubmit}
        />
      )}

      {modal.kind === 'delete' && store.selected && (
        <DeleteConfirmDialog
          locationName={store.selected.name}
          onCancel={() => setModal({ kind: 'none' })}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      {modal.kind === 'settings' && (
        <Modal title="Estado de la configuración" onClose={() => setModal({ kind: 'none' })}>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center justify-between rounded-md border border-slate-100 p-3">
              <span>Mapa (OpenStreetMap, sin configuración necesaria)</span>
              <StatusPill ok />
            </li>
            <li className="flex items-center justify-between rounded-md border border-slate-100 p-3">
              <span>Supabase (persistencia de datos)</span>
              <StatusPill ok={isSupabaseConfigured} />
            </li>
          </ul>
          {!isSupabaseConfigured && (
            <p className="mt-3 text-xs text-slate-500">
              Sin Supabase configurado, los datos se guardan localmente en este navegador
              (localStorage). Configura las variables en <code>.env</code> para usar una base de
              datos real y compartida. Ver README.md.
            </p>
          )}
        </Modal>
      )}

      {formError && (
        <div className="fixed bottom-4 right-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {formError}
        </div>
      )}
    </div>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {ok ? 'Configurado' : 'Pendiente'}
    </span>
  );
}
