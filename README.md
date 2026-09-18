# GeoLogística

Plataforma web para centralizar, visualizar y gestionar ubicaciones logísticas: importación de referencias desde enlaces de Google Maps, listado con búsqueda y filtros, CRUD completo, mapa interactivo sobre OpenStreetMap y un módulo de rutas y distancias.

> **Estado del proyecto:** funcional y ejecutable de inmediato, sin necesidad de ninguna credencial ni tarjeta de crédito — el mapa usa OpenStreetMap (gratuito, sin API key) y los datos se guardan en `localStorage` del navegador. Configurando Supabase (opcional) obtienes persistencia compartida entre dispositivos.

---

## Índice

1. [Funcionalidades](#funcionalidades)
2. [Tecnologías utilizadas](#tecnologías-utilizadas)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación](#instalación)
5. [Ejecución local (sin credenciales)](#ejecución-local-sin-credenciales)
6. [Configuración de Supabase](#configuración-de-supabase)
7. [Variables de entorno](#variables-de-entorno)
8. [Pruebas](#pruebas)
9. [Despliegue](#despliegue)
10. [Subir el proyecto a GitHub](#subir-el-proyecto-a-github)
11. [Importación inicial de ubicaciones](#importación-inicial-de-ubicaciones)
12. [Limitaciones conocidas](#limitaciones-conocidas)
13. [Estructura del proyecto](#estructura-del-proyecto)

---

## Funcionalidades

- **Mapa interactivo** (OpenStreetMap vía Leaflet, sin API key) con marcadores personalizados por categoría, encuadre automático, popups de información y sincronización con el listado lateral. No se colocan marcadores para ubicaciones sin coordenadas verificadas.
- **Panel lateral** con listado de ubicaciones, buscador, filtros por categoría/estado y contadores (registradas, geolocalizadas, pendientes, duplicadas).
- **Panel de detalle** con nombre, código, categoría, coordenadas, dirección, enlace original, estado de geolocalización, fecha de registro y observaciones; botones para centrar en el mapa, editar, eliminar y abrir en Google Maps.
- **CRUD completo** de ubicaciones, con validaciones (coordenadas dentro de rango, campos obligatorios).
- **Resolución de enlaces de Google Maps**: coordenadas explícitas se extraen directamente; enlaces cortos (`maps.app.goo.gl`, `goo.gl/maps`) se resuelven mediante una función backend segura (Supabase Edge Function). Si no se puede resolver, la ubicación queda como **"Pendiente de geolocalización"**, conservando el enlace y permitiendo completar coordenadas manualmente.
- **Detección de duplicados**: enlaces idénticos no generan marcadores duplicados (se conserva el registro, referenciado al original); ubicaciones con coordenadas coincidentes pero enlaces distintos se marcan como **"posible duplicado físico"** sin eliminarse automáticamente.
- **Módulo de Rutas** independiente: selección de origen/destino, cálculo de distancia y tiempo con OSRM (OpenStreetMap, sin API key), trazado de la ruta en el mapa y enlace para abrirla en Google Maps. Arquitectura preparada para múltiples paradas.
- **Modo sin credenciales**: la app corre igual sin Supabase (usa `localStorage`); el mapa funciona siempre, con o sin Supabase configurado.

## Tecnologías utilizadas

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | |
| Estilos | Tailwind CSS | |
| Mapa | OpenStreetMap | vía `react-leaflet` / `leaflet`, gratuito y sin API key |
| Geocodificación / resolución de enlaces | Backend propio (Supabase Edge Function) | ver justificación abajo |
| Rutas y distancias | OSRM (Open Source Routing Machine) | servidor demo público sobre datos de OpenStreetMap, gratuito y sin API key |
| Base de datos | Supabase (PostgreSQL + RLS) | con repositorio local de respaldo (`localStorage`) |
| Pruebas | Vitest | |

**Nota sobre la resolución de enlaces cortos:** la Geocoding API **no resuelve enlaces cortos de Google Maps** (`maps.app.goo.gl`, `goo.gl/maps`); esos enlaces son simples redirecciones HTTP. Por eso se implementó una función backend (`supabase/functions/resolve-link`) que sigue la redirección del lado del servidor y lee el encabezado `Location`, sin scraping del contenido de la página ni dependencias frágiles de terceros.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior y npm.
- Una cuenta de [Supabase](https://supabase.com/) (plan gratuito es suficiente para empezar; opcional, solo para persistencia compartida).
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
- El mapa funciona con normalidad (OpenStreetMap no requiere configuración ni clave).
- Puedes crear, editar y eliminar ubicaciones, usar filtros y ver el panel de detalle con normalidad.

Para persistencia compartida entre dispositivos, sigue la sección siguiente (Supabase es opcional).

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
| `VITE_SUPABASE_URL` | Frontend | URL pública del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Clave `anon`, segura de exponer si las políticas RLS están bien configuradas. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend (Edge Function) | Clave con privilegios elevados. **Nunca** usar en el frontend. |

El mapa (OpenStreetMap/Leaflet) y el cálculo de rutas (OSRM) no requieren ninguna variable de entorno.

Las variables con prefijo `VITE_` son las únicas que Vite expone al navegador; el resto solo debe usarse dentro de `supabase/functions/`.

## Pruebas

```bash
npm run test        # ejecuta las pruebas una vez
npm run test:watch  # modo interactivo
```

Cobertura actual: utilidades de interpretación de enlaces de Google Maps, detección de duplicados (literal y físico) y validación de formularios — la lógica de negocio más sensible a errores. La integración real contra Supabase se valida manualmente configurando credenciales de prueba, ya que depende de un servicio externo.

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

- El cálculo de rutas usa el servidor demo público de OSRM (`router.project-osrm.org`), gratuito pero sin SLA ni garantía de disponibilidad; para producción de alto tráfico se recomienda alojar tu propia instancia de OSRM (o un proveedor gestionado equivalente) y cambiar la URL en `src/services/routesService.ts`.
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
│   ├── hooks/              # Hooks de React (useLocations)
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
