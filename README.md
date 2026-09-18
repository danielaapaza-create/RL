# GeoLogística

Plataforma web para centralizar, visualizar y gestionar ubicaciones logísticas sobre Google Maps: importación de referencias desde enlaces de Google Maps, listado con búsqueda y filtros, CRUD completo, y un módulo de rutas y distancias.

> **Estado del proyecto:** funcional y ejecutable de inmediato en modo de desarrollo sin credenciales reales (usa almacenamiento local del navegador y muestra el mapa deshabilitado hasta que configures una clave de Google Maps). Con las credenciales de Google Maps Platform y Supabase configuradas, queda lista para producción.

---

## Índice

1. [Funcionalidades](#funcionalidades)
2. [Tecnologías utilizadas](#tecnologías-utilizadas)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación](#instalación)
5. [Ejecución local (sin credenciales)](#ejecución-local-sin-credenciales)
6. [Configuración de Google Maps Platform](#configuración-de-google-maps-platform)
7. [Configuración de Supabase](#configuración-de-supabase)
8. [Variables de entorno](#variables-de-entorno)
9. [Pruebas](#pruebas)
10. [Despliegue](#despliegue)
11. [Subir el proyecto a GitHub](#subir-el-proyecto-a-github)
12. [Importación inicial de ubicaciones](#importación-inicial-de-ubicaciones)
13. [Limitaciones conocidas](#limitaciones-conocidas)
14. [Estructura del proyecto](#estructura-del-proyecto)

---

## Funcionalidades

- **Mapa interactivo** con marcadores personalizados por categoría, encuadre automático, popups de información y sincronización con el listado lateral. No se colocan marcadores para ubicaciones sin coordenadas verificadas.
- **Panel lateral** con listado de ubicaciones, buscador, filtros por categoría/estado y contadores (registradas, geolocalizadas, pendientes, duplicadas).
- **Panel de detalle** con nombre, código, categoría, coordenadas, dirección, enlace original, estado de geolocalización, fecha de registro y observaciones; botones para centrar en el mapa, editar, eliminar y abrir en Google Maps.
- **CRUD completo** de ubicaciones, con validaciones (coordenadas dentro de rango, campos obligatorios).
- **Resolución de enlaces de Google Maps**: coordenadas explícitas se extraen directamente; enlaces cortos (`maps.app.goo.gl`, `goo.gl/maps`) se resuelven mediante una función backend segura (Supabase Edge Function). Si no se puede resolver, la ubicación queda como **"Pendiente de geolocalización"**, conservando el enlace y permitiendo completar coordenadas manualmente.
- **Detección de duplicados**: enlaces idénticos no generan marcadores duplicados (se conserva el registro, referenciado al original); ubicaciones con coordenadas coincidentes pero enlaces distintos se marcan como **"posible duplicado físico"** sin eliminarse automáticamente.
- **Módulo de Rutas** independiente: selección de origen/destino, cálculo de distancia y tiempo con la Routes API, trazado de la ruta en el mapa y enlace para abrirla en Google Maps. Arquitectura preparada para múltiples paradas.
- **Modo sin credenciales**: la app corre igual sin Supabase (usa `localStorage`) y muestra un aviso claro cuando falta la clave de Google Maps, en lugar de fallar.

## Tecnologías utilizadas

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | |
| Estilos | Tailwind CSS | |
| Mapa | Google Maps JavaScript API | vía `@vis.gl/react-google-maps` (wrapper oficial recomendado por Google para React) |
| Geocodificación / resolución de enlaces | Backend propio (Supabase Edge Function) | ver justificación abajo |
| Rutas y distancias | Google Routes API | |
| Base de datos | Supabase (PostgreSQL + RLS) | con repositorio local de respaldo (`localStorage`) |
| Pruebas | Vitest | |

**Nota sobre la resolución de enlaces cortos:** la Geocoding API **no resuelve enlaces cortos de Google Maps** (`maps.app.goo.gl`, `goo.gl/maps`); esos enlaces son simples redirecciones HTTP. Por eso se implementó una función backend (`supabase/functions/resolve-link`) que sigue la redirección del lado del servidor y lee el encabezado `Location`, sin scraping del contenido de la página ni dependencias frágiles de terceros.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior y npm.
- Una cuenta de [Google Cloud Platform](https://console.cloud.google.com/) con facturación habilitada (para Google Maps Platform).
- Una cuenta de [Supabase](https://supabase.com/) (plan gratuito es suficiente para empezar).
- [Git](https://git-scm.com/) y una cuenta de GitHub, para el control de versiones.
- Opcional: [Supabase CLI](https://supabase.com/docs/guides/cli) para desplegar la Edge Function de resolución de enlaces.

## Instalación

```bash
# 1. Descomprime el ZIP y entra a la carpeta del proyecto
cd geologistica

# 2. Instala las dependencias
npm install
```

## Ejecución local (sin credenciales)

El proyecto puede ejecutarse de inmediato sin configurar nada:

```bash
npm run dev
```

Abre `http://localhost:5173`. En este modo:

- Las ubicaciones se guardan en el `localStorage` del navegador (persisten entre recargas, pero solo en ese navegador).
- El mapa muestra un aviso indicando que falta la clave de Google Maps, en vez de romperse.
- Puedes crear, editar y eliminar ubicaciones, usar filtros y ver el panel de detalle con normalidad.

Para la experiencia completa (mapa real, rutas, base de datos compartida), sigue las secciones siguientes.

## Configuración de Google Maps Platform

1. **Crear un proyecto** en [Google Cloud Console](https://console.cloud.google.com/projectcreate).
2. **Habilitar las APIs necesarias** (menú "APIs y servicios" → "Biblioteca"):
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Routes API
3. **Configurar facturación**: Google Maps Platform requiere una cuenta de facturación asociada al proyecto, aunque exista una capa gratuita mensual. Revisa las condiciones vigentes en [la página oficial de precios](https://mapsplatform.google.com/pricing/), ya que pueden cambiar; **este proyecto no garantiza que el uso sea gratuito**.
4. **Crear y restringir las claves** (menú "Credenciales"):
   - **Clave de navegador** (para el frontend): restríngela por **referente HTTP** (tu dominio, y `localhost` para desarrollo) y limita las APIs permitidas a Maps JavaScript API y Places API.
   - **Clave de servidor** (para Edge Functions/backend, si decides mover ahí el cálculo de rutas): restríngela por **dirección IP** y a Geocoding API / Routes API.
5. **Configurar variables de entorno** (ver siguiente sección).

**Sobre costos:** varias de estas APIs se facturan por uso una vez agotada la cuota gratuita mensual. Antes de desplegar a producción, revisa los precios y configura **alertas de presupuesto** y, si es posible, **cuotas diarias** en Google Cloud Console para controlar el consumo.

## Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com/dashboard).
2. En el **SQL Editor**, ejecuta en este orden:
   - `supabase/schema.sql` (crea la tabla `locations`, tipos, restricciones e índices).
   - `supabase/policies.sql` (configura Row Level Security).
3. Copia la **URL del proyecto** y la **clave `anon`** desde "Project Settings" → "API".
4. (Opcional pero recomendado) Despliega la función de resolución de enlaces:
   ```bash
   supabase login
   supabase link --project-ref TU_PROJECT_REF
   supabase functions deploy resolve-link
   ```
   Esta función corre en el servidor de Supabase (Deno) y no expone ninguna clave al navegador.

## Variables de entorno

Copia `.env.example` como `.env` y completa los valores:

```bash
cp .env.example .env
```

| Variable | Dónde se usa | Notas |
|---|---|---|
| `VITE_GOOGLE_MAPS_BROWSER_KEY` | Frontend | Clave de navegador restringida por dominio/HTTP referrer. |
| `VITE_GOOGLE_MAPS_MAP_ID` | Frontend (opcional) | Para estilos personalizados vía Cloud-based Map Styling. |
| `VITE_SUPABASE_URL` | Frontend | URL pública del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Clave `anon`, segura de exponer si las políticas RLS están bien configuradas. |
| `GOOGLE_MAPS_SERVER_KEY` | Backend (Edge Function) | Clave de servidor, restringida por IP. **Nunca** debe llevar el prefijo `VITE_` para no exponerse al navegador. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend (Edge Function) | Clave con privilegios elevados. **Nunca** usar en el frontend. |

Las variables con prefijo `VITE_` son las únicas que Vite expone al navegador; el resto solo debe usarse dentro de `supabase/functions/`.

## Pruebas

```bash
npm run test        # ejecuta las pruebas una vez
npm run test:watch  # modo interactivo
```

Cobertura actual: utilidades de interpretación de enlaces de Google Maps, detección de duplicados (literal y físico) y validación de formularios — la lógica de negocio más sensible a errores. La integración real contra Google Maps Platform y Supabase se valida manualmente configurando credenciales de prueba, ya que depende de servicios externos.

## Despliegue

El frontend es una aplicación estática (Vite) y puede desplegarse en cualquier proveedor de hosting estático:

```bash
npm run build      # genera la carpeta dist/
npm run preview    # sirve dist/ localmente para verificar el build
```

Sube el contenido de `dist/` a servicios como Vercel, Netlify, Cloudflare Pages o un bucket estático. Configura allí las mismas variables `VITE_*` como variables de entorno de build. La Edge Function de Supabase se despliega por separado con `supabase functions deploy resolve-link`.

## Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Initial commit: GeoLogística"
git branch -M main
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

Reemplaza `URL_DEL_REPOSITORIO` por la URL de tu propio repositorio en GitHub. El archivo `.gitignore` ya excluye `node_modules/`, `dist/`, y los archivos `.env*` para que nunca subas credenciales reales.

## Importación inicial de ubicaciones

El proyecto incluye las 9 referencias solicitadas (`src/data/initialLocations.ts`), que se cargan automáticamente la primera vez que se ejecuta la app (en Supabase, solo si la tabla está vacía; en modo local, solo si no hay datos previos en `localStorage`). Resumen del análisis:

| Registro | Origen del dato | Resultado |
|---|---|---|
| L01 | Enlace corto, resuelto siguiendo su redirección | Geolocalizado: -5.6838846, -78.7869977 ("5N, Jaén") |
| L02 | Enlace corto, resuelto siguiendo su redirección | Geolocalizado: -5.6838846, -78.7869977 ("5N, Jaén") |
| L03 | **Enlace idéntico a L02** | Geolocalizado (mismos datos); marcado como duplicado literal de L02, no genera un marcador independiente |
| L04 | Coordenadas explícitas en la URL (`?q=`) | Geolocalizado: -5.7273151, -78.7986693 |
| L05 | Coordenadas explícitas en la URL (`?q=`) | Geolocalizado: -7.1828104, -78.4919801 |
| L06 | Enlace corto, resuelto siguiendo su redirección | Geolocalizado: -9.104127, -78.541082 |
| L07 | Enlace corto, resuelto siguiendo su redirección | Geolocalizado: -9.609734, -77.508260 |
| L08 | Enlace corto, resuelto siguiendo su redirección | Geolocalizado: -9.104127, -78.541082 |
| L09 | Enlace corto, resuelto siguiendo su redirección | Geolocalizado: -9.609734, -77.508260 |

**Duplicados detectados:**

- **Duplicado literal** (mismo enlace original): L02 y L03. Solo L02 recibe marcador propio en el mapa; L03 se conserva en la base de datos referenciando a L02 (`duplicate_of`).
- **Posibles duplicados físicos** (coordenadas coincidentes con enlaces distintos, no se fusionan automáticamente, quedan marcados para revisión manual): {L01, L02, L03}, {L06, L08} y {L07, L09}.

**Resumen de la importación:** 9 registros importados · 9 geolocalizados · 0 pendientes · 1 duplicado literal (L03, idéntico a L02) · 7 registros marcados con posible duplicado físico, repartidos en 3 grupos de coordenadas coincidentes: {L01, L02, L03}, {L06, L08} y {L07, L09}.

Todas las coordenadas anteriores provienen de seguir la redirección real de cada enlace o de leer directamente el parámetro de coordenadas de la URL; **ninguna fue inventada**. Si en tu entorno un enlace corto ya no resuelve (por ejemplo, por expirar), la aplicación lo marcará como "Pendiente de geolocalización" y te permitirá completar las coordenadas manualmente o seleccionando el punto en el mapa.

## Limitaciones conocidas

- El cálculo de rutas llama a la Routes API directamente desde el navegador usando la clave de navegador; para producción de alto tráfico se recomienda mover esta llamada a una Edge Function (mismo patrón que `resolve-link`) para no exponer cuotas de la clave pública. El código deja este cambio señalado en `src/services/routesService.ts`.
- La resolución de enlaces cortos depende de que Google mantenga el mismo formato de redirección; si Google cambia el comportamiento, la Edge Function podría requerir ajustes menores.
- El módulo de Rutas soporta un solo par origen-destino por diseño; los tipos (`RoutePoint`) ya están preparados para extenderse a múltiples paradas.
- Sin Supabase configurado, los datos no se comparten entre navegadores/dispositivos (quedan en `localStorage`).

## Estructura del proyecto

```
geologistica/
├── src/
│   ├── components/       # Componentes de UI (layout, mapa, ubicaciones, rutas, comunes)
│   ├── pages/             # Vistas de alto nivel (Dashboard, Rutas)
│   ├── services/          # Acceso a datos: Supabase, almacenamiento local, resolución de enlaces, rutas
│   ├── hooks/              # Hooks de React (useLocations, useGoogleMaps)
│   ├── types/              # Tipos de TypeScript compartidos
│   ├── utils/              # Lógica pura: parsing de enlaces, duplicados, validaciones, geo
│   └── data/                # Carga inicial de las 9 ubicaciones
├── supabase/
│   ├── schema.sql          # Modelo de datos y restricciones
│   ├── policies.sql        # Políticas de Row Level Security
│   └── functions/resolve-link/  # Edge Function para resolver enlaces cortos de forma segura
├── tests/                  # Pruebas unitarias (Vitest)
├── public/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
