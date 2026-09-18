import { describe, expect, it } from 'vitest';
import {
  extractCoordinatesFromUrl,
  extractPlaceNameFromUrl,
  isShortGoogleMapsLink,
  isValidLatLng,
  normalizeUrl,
} from '@/utils/googleMapsLink';

describe('isShortGoogleMapsLink', () => {
  it('detecta enlaces cortos maps.app.goo.gl', () => {
    expect(isShortGoogleMapsLink('https://maps.app.goo.gl/dFWxKu7KvmkwSxeY7')).toBe(true);
  });

  it('detecta enlaces cortos goo.gl/maps', () => {
    expect(isShortGoogleMapsLink('https://goo.gl/maps/MYHaKdSbbAL2')).toBe(true);
  });

  it('no marca como corto un enlace largo con coordenadas', () => {
    expect(isShortGoogleMapsLink('https://www.google.com/maps?q=-5.72,-78.79')).toBe(false);
  });
});

describe('extractCoordinatesFromUrl', () => {
  it('extrae coordenadas del parámetro q= (enlace #4 del prompt)', () => {
    const coords = extractCoordinatesFromUrl('https://www.google.com/maps?q=-5.7273151,-78.7986693&z=17&hl=es');
    expect(coords).toEqual({ latitude: -5.7273151, longitude: -78.7986693 });
  });

  it('extrae coordenadas del parámetro q= (enlace #5 del prompt)', () => {
    const coords = extractCoordinatesFromUrl('https://www.google.com/maps?q=-7.1828104,-78.4919801&z=17&hl=es');
    expect(coords).toEqual({ latitude: -7.1828104, longitude: -78.4919801 });
  });

  it('extrae coordenadas exactas del bloque !3d!4d', () => {
    const url =
      'https://www.google.com.pe/maps/place/5N,+Ja%C3%A9n/@-5.6838793,-78.7891864,780m/data=!3m2!1e3!4b1!4m5!3m4!1s0x91b4fc675218edb9:0xbc81d031794a62e0!8m2!3d-5.6838846!4d-78.7869977?hl=es';
    expect(extractCoordinatesFromUrl(url)).toEqual({ latitude: -5.6838846, longitude: -78.7869977 });
  });

  it('extrae coordenadas de /maps/search/lat,+lng', () => {
    const url =
      'https://www.google.com/maps/search/-9.104127,+-78.541082?entry=tts&g_ep=abc';
    expect(extractCoordinatesFromUrl(url)).toEqual({ latitude: -9.104127, longitude: -78.541082 });
  });

  it('retorna null cuando la URL no trae coordenadas', () => {
    expect(extractCoordinatesFromUrl('https://maps.app.goo.gl/dFWxKu7KvmkwSxeY7')).toBeNull();
  });

  it('retorna null ante una URL inválida', () => {
    expect(extractCoordinatesFromUrl('no-es-una-url')).toBeNull();
  });
});

describe('extractPlaceNameFromUrl', () => {
  it('extrae y decodifica el nombre del lugar', () => {
    const url = 'https://www.google.com.pe/maps/place/5N,+Ja%C3%A9n/@-5.68,-78.78,780m';
    expect(extractPlaceNameFromUrl(url)).toBe('5N, Jaén');
  });

  it('retorna null si no hay segmento /place/', () => {
    expect(extractPlaceNameFromUrl('https://maps.app.goo.gl/abc')).toBeNull();
  });
});

describe('isValidLatLng', () => {
  it('acepta coordenadas dentro de rango', () => {
    expect(isValidLatLng(-12.05, -77.03)).toBe(true);
  });

  it('rechaza latitud fuera de rango', () => {
    expect(isValidLatLng(95, -77)).toBe(false);
  });

  it('rechaza longitud fuera de rango', () => {
    expect(isValidLatLng(10, -200)).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('normaliza dos URLs idénticas de la misma forma (enlaces #2 y #3 del prompt)', () => {
    const a = normalizeUrl('https://goo.gl/maps/MYHaKdSbbAL2');
    const b = normalizeUrl('https://goo.gl/maps/MYHaKdSbbAL2');
    expect(a).toBe(b);
  });

  it('produce claves distintas para URLs distintas', () => {
    expect(normalizeUrl('https://maps.app.goo.gl/aaa')).not.toBe(normalizeUrl('https://maps.app.goo.gl/bbb'));
  });
});
