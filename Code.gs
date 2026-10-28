/**
 * Inspección Carros de Golf — base de datos conjunta en Google Sheets.
 * Pega este código en Extensiones > Apps Script de tu hoja de cálculo.
 * El TOKEN debe ser IGUAL al de CONFIG.TOKEN en index.html.
 */
const TOKEN = 'ig-dc789ccdbbd3b9db2d24';
const CARPETA_FOTOS = 'Inspección Golf - Fotos';
const HOJA = 'Registros';

const ITEMS = [
  ['motor', 'Estado del motor'],
  ['lat_frente', 'Latonería y pintura frente'],
  ['lat_der', 'Latonería y pintura lado derecho'],
  ['lat_izq', 'Latonería y pintura lado izquierdo'],
  ['lat_tras', 'Latonería y pintura parte trasera'],
  ['lat_techo', 'Latonería y pintura techo'],
  ['llantas', 'Llantas'],
  ['llanta_rep', 'Llantas de repuesto'],
  ['direccion', 'Dirección'],
  ['suspension', 'Suspensión'],
  ['retrovisores', 'Retrovisores'],
  ['gasolina', 'Nivel del tanque de gasolina'],
  ['cojineria', 'Cojinería'],
  ['pisos', 'Pisos'],
  ['techo', 'Techo'],
  ['aceite', 'Aceite'],
  ['bateria', 'Batería'],
  ['pito', 'Pito'],
  ['luces', 'Luces'],
  ['encendido', 'Encendido'],
  ['pito_rev', 'Pito de reversa'],
  ['aseo', 'Condiciones de aseo'],
  ['desinfeccion', 'Desinfección am - pm'],
  ['conoc_desinf', 'Conocimiento de desinfectar el carro'],
  ['extintor', 'Extintor']
];
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HEAD = ['ID', 'Semana (lunes)', 'Fecha', 'Hora', 'Día', 'Día de la semana', 'Carro', 'Camarero']
  .concat(ITEMS.map(function (i) { return i[1]; }))
  .concat(['Desinfección AM', 'Desinfección PM', 'Novedades (ítems en M)', 'Observación general', 'Fotos',
           'Gestor alojamiento', 'Conductor', 'Eliminado', 'Actualizado', 'Dispositivo', 'JSON']);
const LABEL = {}; ITEMS.forEach(function (i) { LABEL[i[0]] = i[1]; });

function doGet(e) { return responder((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (err) {}
  return responder(p);
}

function responder(p) {
  var r;
  try {
    if (p.token !== TOKEN) r = { ok: false, error: 'Token inválido' };
    else if (p.action === 'upsert') r = upsert(p.records || []);
    else if (p.action === 'list') r = listar(p.desde);
    else if (p.action === 'foto') r = guardarFoto(p);
    else if (p.action === 'ping') r = { ok: true };
    else r = { ok: false, error: 'Acción desconocida' };
  } catch (err) {
    r = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
}

// Funciona pegado dentro de una hoja (Extensiones → Apps Script) o como proyecto suelto
// (script.new): en ese caso crea la hoja "Inspección Golf - Registros" en tu Drive.
function libro() {
  var ss = null;
  try { ss = SpreadsheetApp.getActive(); } catch (e) {}
  if (ss) return ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('LIBRO_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  ss = SpreadsheetApp.create('Inspección Golf - Registros');
  props.setProperty('LIBRO_ID', ss.getId());
  return ss;
}

function hoja() {
  var ss = libro();
  var sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#1f6f54').setFontColor('#ffffff');
    sh.hideColumns(1);            // ID interno
    sh.hideColumns(HEAD.length);  // JSON interno
  }
  return sh;
}

function fila(r) {
  var items = r.items || {}, obs = r.obsItems || {};
  var nov = ITEMS.filter(function (i) { return items[i[0]] === 'M'; })
    .map(function (i) { return i[1] + (obs[i[0]] ? ': ' + obs[i[0]] : ''); }).join(' | ');
  var fotos = [];
  Object.keys(r.fotos || {}).forEach(function (k) {
    (r.fotos[k] || []).forEach(function (f) {
      if (f.drive) fotos.push((LABEL[k] || k) + ': https://drive.google.com/file/d/' + f.drive + '/view');
    });
  });
  return [r.id, "'" + r.semana, "'" + r.fecha, "'" + (r.hora || ''), r.dia, DIAS[(r.dia || 1) - 1], r.carro, r.camarero]
    .concat(ITEMS.map(function (i) { return items[i[0]] || ''; }))
    .concat([r.desinfAM ? 'Sí' : 'No', r.desinfPM ? 'Sí' : 'No', nov, r.obs || '', fotos.join('\n'),
             r.gestor || '', r.conductor || '', r.eliminado ? 'Sí' : '', r.actualizado || '', r.dispositivo || '', JSON.stringify(r)]);
}

function upsert(recs) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = hoja();
    var n = sh.getLastRow();
    var ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(function (v) { return String(v[0]); }) : [];
    var guardados = [];
    recs.forEach(function (r) {
      if (!r || !r.id) return;
      var idx = ids.indexOf(r.id);
      if (idx >= 0) {
        var row = idx + 2, prev = {};
        try { prev = JSON.parse(sh.getRange(row, HEAD.length).getValue()); } catch (e) {}
        if (!(prev.actualizado && prev.actualizado > r.actualizado)) {
          sh.getRange(row, 1, 1, HEAD.length).setValues([fila(r)]);
        }
      } else {
        sh.appendRow(fila(r));
        ids.push(r.id);
      }
      guardados.push(r.id);
    });
    return { ok: true, guardados: guardados };
  } finally {
    lock.releaseLock();
  }
}

function listar(desde) {
  var sh = hoja();
  var n = sh.getLastRow();
  if (n < 2) return { ok: true, records: [] };
  var vals = sh.getRange(2, HEAD.length, n - 1, 1).getValues();
  var out = [];
  vals.forEach(function (v) {
    try {
      var r = JSON.parse(v[0]);
      if (!desde || r.semana >= desde) out.push(r);
    } catch (e) {}
  });
  return { ok: true, records: out };
}

function carpeta() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('CARPETA_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var it = DriveApp.getFoldersByName(CARPETA_FOTOS);
  var f = it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_FOTOS);
  props.setProperty('CARPETA_ID', f.getId());
  return f;
}

function guardarFoto(p) {
  if (!p.id || !p.data) return { ok: false, error: 'Foto vacía' };
  var dir = carpeta();
  var nombre = String(p.nombre || (p.id + '.jpg')).replace(/[\\/:*?"<>|]/g, '_');
  // si ya se subió (reintento), devuelve la misma
  var prev = dir.getFilesByName(nombre);
  if (prev.hasNext()) return { ok: true, driveId: prev.next().getId() };
  var blob = Utilities.newBlob(Utilities.base64Decode(p.data), 'image/jpeg', nombre);
  var file = dir.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return { ok: true, driveId: file.getId() };
}

/** Ejecuta esta función una vez desde el editor para autorizar Sheets y Drive. */
function autorizar() {
  hoja();
  carpeta();
  Logger.log('Listo. Hoja de registros: ' + libro().getUrl());
}
