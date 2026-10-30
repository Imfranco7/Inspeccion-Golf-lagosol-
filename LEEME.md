# Inspección Carros de Golf · Lagosol (FOR-PSB-07)

App web instalable (PWA) para la inspección diaria de los carros **Lencero** y **H5**.
Funciona sin internet: guarda en el celular y sincroniza con Supabase (datos y fotos) cuando hay conexión.

## Qué hace
- Varias inspecciones por carro y por día, cada una con su **hora**.
- Cargo (Camarero o Anfitrión de servicios) y nombre de quien registra.
- Formulario por secciones desplegables; ítems B / M / N/A, detalle al marcar M y observaciones generales.
- El nombre y el cargo se registran una vez en cada celular y se usan en todas las inspecciones.
- **Fotos de evidencia** en cualquier ítem (cámara o galería), comprimidas a ~150 KB.
- Hoja semanal igual al papel: una columna por inspección, agrupadas del Día 1 (lunes) al Día 7 (domingo).
- Pestaña **Registros**: todos ven todas las inspecciones del equipo (filtro por carro, nombre y novedades), en solo lectura.
- Panel admin (clave `admin123`): días sin registro, ítems en mal estado con fotos, exportar Excel / PDF.
- Cada inspección se abre en modo lectura; solo quien la registró (o un administrador con la clave) puede editarla o eliminarla.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (configuración al inicio del `<script>`) |
| `sw.js`, `manifest.json`, íconos | Instalación y uso sin internet |

## Base de datos (Supabase, gratis)
Una sola tabla `registros` sin RLS:

| Columna | Tipo | Nota |
|---|---|---|
| `id` | text | Primary key |
| `created_at` | timestamptz | por defecto |
| `tipo` | text | `insp` o `foto` |
| `semana` | text | lunes de la semana (AAAA-MM-DD) |
| `datos` | text | inspección en JSON o foto en base64 |

En `index.html` van `SUPABASE_URL` (Project URL) y `SUPABASE_KEY` (clave publishable / anon).
El panel admin de la app y la vista Semana muestran todo; el Excel se exporta desde el panel.

## Instalar en cada celular
- **iPhone:** abrir el link en Safari → Compartir → *Agregar a pantalla de inicio*.
- **Android:** abrir en Chrome → menú ⋮ → *Instalar app* / *Agregar a pantalla principal*.

La primera vez cada persona elige su cargo y escribe su nombre.

## Notas
- El indicador arriba a la derecha muestra si hay inspecciones o fotos pendientes por enviar. Tocarlo fuerza la sincronización.
- Supabase pausa los proyectos gratis tras 7 días sin uso; con uso diario no pasa. Si se pausa, se reactiva desde supabase.com.
- La clave publishable va dentro de la app: cualquiera con el link podría leer o escribir la tabla. Es aceptable para uso interno; no guardes datos sensibles.
- La clave de admin es un candado de pantalla, no seguridad real. Se cambia en `ADMIN_PIN` dentro de `index.html`.
- Si actualizas la app, sube el número de `CACHE` en `sw.js` (v2 → v3) para que los celulares tomen la versión nueva.
