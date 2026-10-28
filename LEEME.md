# Inspección Carros de Golf · Lagosol (FOR-PSB-07)

App web instalable (PWA) para la inspección diaria de los carros **Lencero** y **H5**.
Funciona sin internet: guarda en el celular y sincroniza con Google Sheets (datos) y Google Drive (fotos) cuando hay conexión.

## Qué hace
- Varias inspecciones por carro y por día, cada una con su **hora**.
- Ítems B / M / N/A, observación por ítem en M, observación general, Gestor y Conductor.
- **Fotos de evidencia** en cualquier ítem (cámara o galería), comprimidas a ~150 KB.
- Hoja semanal igual al papel: una columna por inspección, agrupadas del Día 1 (lunes) al Día 7 (domingo).
- Panel admin (PIN): días sin registro, ítems en mal estado con fotos, exportar Excel / PDF.
- Eliminar una inspección hecha por error (queda marcada "Eliminado" en la hoja).

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (configuración al inicio del `<script>`) |
| `sw.js`, `manifest.json`, íconos | Instalación y uso sin internet |
| `Code.gs` | Script de Google Sheets: base de datos conjunta + carpeta de fotos |

## Configurar Google Sheets (una sola vez)
1. Crea una hoja de cálculo nueva en Google Drive (ej. "Inspección Carros de Golf").
2. **Extensiones → Apps Script**. Borra lo que haya y pega todo `Code.gs`. Guarda (💾).
3. Arriba, en el selector de funciones, elige **autorizar** y dale **Ejecutar**. Acepta los permisos
   (si sale "Google no verificó esta app": *Configuración avanzada → Ir a (proyecto)*). Esto crea la hoja
   "Registros" y la carpeta "Inspección Golf - Fotos" en tu Drive.
4. **Implementar → Nueva implementación** → engranaje → **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Copia la **URL de la aplicación web** (termina en `/exec`) y pégala en `API_URL` de `index.html`.

El `TOKEN` ya viene igual en ambos archivos; si lo cambias, cámbialo en los dos.

## Instalar en cada celular
- **iPhone:** abrir el link en Safari → Compartir → *Agregar a pantalla de inicio*.
- **Android:** abrir en Chrome → menú ⋮ → *Instalar app* / *Agregar a pantalla principal*.

Cada camarero escribe su nombre la primera vez.

## Notas
- El indicador arriba a la derecha muestra si hay inspecciones o fotos pendientes por enviar. Tocarlo fuerza la sincronización.
- Las fotos quedan compartidas "cualquiera con el enlace" para que se vean desde todos los celulares.
- El PIN de admin es un candado de pantalla, no seguridad real.
- Si cambias `Code.gs`: *Implementar → Administrar implementaciones → Editar → Versión: nueva*, para conservar la misma URL.
- Si actualizas la app, sube el número de `CACHE` en `sw.js` (v2 → v3) para que los celulares tomen la versión nueva.
