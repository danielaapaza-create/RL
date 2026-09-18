import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { resolveGoogleMapsLink } from '@/services/linkResolver';
import { validateLocationInput } from '@/utils/validation';
import { LOCATION_CATEGORIES } from '@/types/location';
import type { LocationCategory, LocationInput, LocationRecord } from '@/types/location';

interface LocationFormProps {
  initial?: LocationRecord | null;
  onCancel: () => void;
  onSubmit: (input: LocationInput) => Promise<void>;
}

export function LocationForm({ initial, onCancel, onSubmit }: LocationFormProps) {
  const [form, setForm] = useState<LocationInput>({
    code: initial?.code ?? '',
    name: initial?.name ?? '',
    original_url: initial?.original_url ?? '',
    latitude: initial?.latitude ?? null,
    longitude: initial?.longitude ?? null,
    category: initial?.category ?? 'otro',
    description: initial?.description ?? '',
    observations: initial?.observations ?? '',
    address: initial?.address ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState(false);
  const [resolveMessage, setResolveMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof LocationInput>(key: K, value: LocationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleResolveLink() {
    if (!form.original_url) return;
    setResolving(true);
    setResolveMessage(null);
    try {
      const result = await resolveGoogleMapsLink(form.original_url);
      if (result.resolved && result.latitude != null && result.longitude != null) {
        update('latitude', result.latitude);
        update('longitude', result.longitude);
        if (result.name && !form.name) update('name', result.name);
        setResolveMessage('Coordenadas obtenidas correctamente desde el enlace.');
      } else {
        setResolveMessage(
          result.error ??
            'No fue posible resolver el enlace automáticamente. Completa las coordenadas manualmente o selecciona el punto en el mapa.',
        );
      }
    } finally {
      setResolving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateLocationInput(form);
    if (!validation.valid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={initial ? 'Editar ubicación' : 'Agregar ubicación'}
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
            type="submit"
            form="location-form"
            disabled={submitting}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="location-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
              placeholder="Almacén Central"
            />
          </Field>
          <Field label="Código" error={errors.code}>
            <input
              value={form.code}
              onChange={(e) => update('code', e.target.value)}
              className="input"
              placeholder="L10"
            />
          </Field>
        </div>

        <Field label="Categoría">
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value as LocationCategory)}
            className="input"
          >
            {LOCATION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Enlace de Google Maps" error={errors.original_url}>
          <div className="flex gap-2">
            <input
              value={form.original_url ?? ''}
              onChange={(e) => update('original_url', e.target.value)}
              className="input flex-1"
              placeholder="https://maps.app.goo.gl/…"
            />
            <button
              type="button"
              onClick={handleResolveLink}
              disabled={!form.original_url || resolving}
              className="shrink-0 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
            >
              {resolving ? 'Resolviendo…' : 'Resolver enlace'}
            </button>
          </div>
          {resolveMessage && <p className="mt-1 text-xs text-slate-500">{resolveMessage}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitud" error={errors.latitude}>
            <input
              type="number"
              step="any"
              value={form.latitude ?? ''}
              onChange={(e) => update('latitude', e.target.value === '' ? null : Number(e.target.value))}
              className="input"
              placeholder="-12.0464"
            />
          </Field>
          <Field label="Longitud" error={errors.longitude}>
            <input
              type="number"
              step="any"
              value={form.longitude ?? ''}
              onChange={(e) => update('longitude', e.target.value === '' ? null : Number(e.target.value))}
              className="input"
              placeholder="-77.0428"
            />
          </Field>
        </div>
        <p className="text-xs text-slate-400">
          Deja ambos campos vacíos para registrar la ubicación como "Pendiente de geolocalización" y completarla más
          adelante manualmente o seleccionando el punto en el mapa.
        </p>

        <Field label="Dirección (opcional)">
          <input
            value={form.address ?? ''}
            onChange={(e) => update('address', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Descripción">
          <textarea
            value={form.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            className="input min-h-[60px]"
          />
        </Field>

        <Field label="Observaciones">
          <textarea
            value={form.observations ?? ''}
            onChange={(e) => update('observations', e.target.value)}
            className="input min-h-[60px]"
          />
        </Field>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
