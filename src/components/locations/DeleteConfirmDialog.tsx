import { Modal } from '@/components/common/Modal';

export function DeleteConfirmDialog({
  locationName,
  onCancel,
  onConfirm,
  deleting,
}: {
  locationName: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <Modal
      title="Eliminar ubicación"
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? 'Eliminando…' : 'Eliminar definitivamente'}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        ¿Seguro que deseas eliminar <span className="font-semibold">{locationName}</span>? Esta acción no se puede
        deshacer.
      </p>
    </Modal>
  );
}
