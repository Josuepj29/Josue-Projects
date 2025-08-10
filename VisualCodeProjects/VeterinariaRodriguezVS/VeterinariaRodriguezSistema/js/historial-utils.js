// Diccionario: días por cada value de recordatorio (MVet y Peluquería)
const DIAS_POR_RECORDATORIO = {
  // --- MVet ---
  'mv_cita_medica_1': 1,
  'mv_vacuna_puppy_14': 14,
  'mv_vacuna_puppy_21': 21,
  'mv_vacuna_cuadruple_14': 14,
  'mv_vacuna_cuadruple_21': 21,
  'mv_vacuna_quintuple_14': 14,
  'mv_vacuna_quintuple_21': 21,
  'mv_vacuna_quintuple_180': 180,
  'mv_vacuna_quintuple_corona_14': 14,
  'mv_vacuna_quintuple_corona_21': 21,
  'mv_vacuna_quintuple_corona_180': 180,
  'mv_vacuna_sextuple_rabia': 365,
  'mv_vacuna_kc': 365,
  'mv_vacuna_rabia_perro': 365,
  'mv_pipetas_14': 14,
  'mv_pipetas_30': 30,
  'mv_desparasitacion_externa_30': 30,
  'mv_desparasitacion_externa_90': 90,
  'mv_oxantel_1': 1,
  'mv_oxantel_10': 10,
  'mv_oxantel_30': 30,
  'mv_oxantel_60': 60,
  'mv_puppymec_1': 1,
  'mv_puppymec_10': 10,
  'mv_puppymec_14': 14,
  'mv_fripets_10': 10,
  'mv_fripets_30': 30,
  'mv_fripets_60': 60,
  'mv_vacuna_gato_triple_14': 14,
  'mv_vacuna_gato_triple_21': 21,
  'mv_vacuna_gato_triple_365': 365,
  'mv_vacuna_gato_leucemia': 30,
  'mv_vacuna_gato_rabia': 365,
  // --- Peluquería ---
  'pelu_siguiente_bano_7': 7,
  'pelu_siguiente_bano_21': 21,
  'pelu_pipetas_14': 14,
  'pelu_pipetas_30': 30,
  'pelu_desparasitacion_externa_30': 30,
  'pelu_desparasitacion_externa_90': 90,
  'pelu_oxantel_1': 1,
  'pelu_oxantel_10': 10,
  'pelu_oxantel_30': 30,
  'pelu_oxantel_60': 60,
  'pelu_puppymec_1': 1,
  'pelu_puppymec_10': 10,
  'pelu_puppymec_14': 14,
  'pelu_fripets_10': 10,
  'pelu_fripets_30': 30,
  'pelu_fripets_60': 60
  // Agrega aquí nuevos valores si aparecen más
};

/**
 * Calcula la fecha próxima para cualquier recordatorio
 * @param {string} fechaBase - Fecha base ('YYYY-MM-DD')
 * @param {string} tipoRecordatorio - El value del recordatorio (ej: 'mv_vacuna_puppy_14')
 * @returns {string} Fecha próxima en 'YYYY-MM-DD', o '—' si inválido
 */
function calcularFechaProxima(fechaBase, tipoRecordatorio) {
  if (!fechaBase || !tipoRecordatorio) return "—";
  // Intentar parsear fechaBase a objeto Date (local)
  let baseDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaBase)) {
    let [y, m, d] = fechaBase.split('-');
    baseDate = new Date(Number(y), Number(m) - 1, Number(d));
  } else {
    baseDate = new Date(fechaBase);
  }
  if (isNaN(baseDate)) return "—";
  // Buscar días a sumar
  const diasASumar = DIAS_POR_RECORDATORIO[tipoRecordatorio] || 0;
  baseDate.setDate(baseDate.getDate() + diasASumar);
  return baseDate.toISOString().slice(0, 10);
}














function formatearFechaHora(fechaISO) {
  try {
    if (!fechaISO || isNaN(new Date(fechaISO).getTime())) {
      return '—';
    }
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-PE', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return '—';
  }
}



function renderHistorialClinico(historial, contenedor, onVerArchivos) {
  contenedor.innerHTML = '';

  if (!historial || historial.length === 0) {
    contenedor.innerHTML = '<p>No hay historial clínico registrado para esta mascota.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.className = 'table table-striped';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Fecha</th>
      <th>Tipo</th>
      <th>Detalle</th>
      <th>Tratamiento / Costo</th>
      <th>Archivos</th>
      <th>Recordatorios</th>
    </tr>
  `;

  const tbody = document.createElement('tbody');

  historial.forEach((h, index) => {
    const tr = document.createElement('tr');

    const tdFecha = document.createElement('td');
    tdFecha.textContent = h.fecha ? formatearFechaHora(h.fecha) : '—';

    const tdTipo = document.createElement('td');
    tdTipo.textContent = h._tipo === 'mvet' ? 'Atención médica' :
                         h._tipo === 'peluqueria' ? 'Peluquería' : '—';

    const tdDetalle = document.createElement('td');
    tdDetalle.textContent = h.anamnesis || '—';

    const tdTratamiento = document.createElement('td');
    tdTratamiento.textContent = h.tratamiento || h.costo || '—';

    const tdArchivos = document.createElement('td');
    if (Array.isArray(h.archivos) && h.archivos.length > 0) {
      const btnVer = document.createElement('button');
      btnVer.textContent = 'Ver archivos';
      btnVer.className = 'btn btn-primary btn-sm';
      btnVer.onclick = () => mostrarCarruselArchivos(h.archivos, 0);
      tdArchivos.appendChild(btnVer);
    } else {
      tdArchivos.textContent = '—';
    }

    const tdRecordatorios = document.createElement('td');
if (Array.isArray(h.recordatorios) && h.recordatorios.length > 0) {
  tdRecordatorios.innerHTML = h.recordatorios.map(r => {

   const valor = r.value || Object.keys(window.textosRecordatoriosMVet || {}).find(k => window.textosRecordatoriosMVet[k] === r.texto || r.text) || r.texto || '';
const texto = (
  (window.textosRecordatoriosMVet && window.textosRecordatoriosMVet[valor]) ||
  (window.textosRecordatoriosPelu && window.textosRecordatoriosPelu[valor]) ||
  valor || '—'
);
const fechaAplicado = formatearFechaHora(r.fechaAplicado || r.fechaInicio);
const baseProxima = (r.fechaInicio || fechaAplicado || '').slice(0, 10);
const proxima = r.proxima || r.fechaProxima || calcularFechaProxima(baseProxima, valor) || '—';


    return `<strong>${texto}</strong><br><span style="font-size: 12px;">Aplicado: ${fechaAplicado}<br>Próxima: ${proxima}</span>`;

  }).join("<hr>");
} else {
  tdRecordatorios.textContent = '—';
}

    tr.appendChild(tdFecha);
    tr.appendChild(tdTipo);
    tr.appendChild(tdDetalle);
    tr.appendChild(tdTratamiento);
    tr.appendChild(tdArchivos);
    tr.appendChild(tdRecordatorios);

    tbody.appendChild(tr);
  });

  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  contenedor.appendChild(tabla);
}

function convertirFechaISO(fecha) {
  if (!fecha) return new Date('1970-01-01');
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(fecha)) return new Date(fecha);

  const parts = fecha.split(", ");
  if (parts.length < 2) return new Date('1970-01-01');
  const [day, month, year] = parts[0].split("/").map(x => parseInt(x));
  let [time, meridian] = parts[1].split(" ");
  if (!time || !meridian) return new Date('1970-01-01');
  if (time.split(":").length === 2) time += ":00";
  let [hour, minute, second] = time.split(":").map(num => parseInt(num));
  if (meridian === 'p.m.' && hour < 12) hour += 12;
  else if (meridian === 'a.m.' && hour === 12) hour = 0;
  return new Date(year, month - 1, day, hour, minute, second);
}


function obtenerFechaHoraLocal() {
    const ahora = new Date();
    const fecha = ahora.getFullYear() + '-' +
        String(ahora.getMonth() + 1).padStart(2, '0') + '-' +
        String(ahora.getDate()).padStart(2, '0');
    const hora = String(ahora.getHours()).padStart(2, '0') + ':' +
        String(ahora.getMinutes()).padStart(2, '0') + ':' +
        String(ahora.getSeconds()).padStart(2, '0');
    return `${fecha} ${hora}`;
}


function parsearFechaSeguro(f) {
  if (f instanceof Date && !isNaN(f)) return f.getTime();
  if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}/.test(f)) {
    let d = new Date(f);
    if (!isNaN(d)) return d.getTime();
  }
  // dd/mm/yyyy, hh:mm (ejemplo: 7/8/2025, 4:02:49 a. m.)
  if (typeof f === 'string' && /\d{1,2}\/\d{1,2}\/\d{4}/.test(f)) {
    let partes = f.split(/[\s,]+/);
    let fecha = partes[0].split('/');
    let hora = (partes[1] || '00:00').split(':');
    let d = new Date(
      parseInt(fecha[2]), parseInt(fecha[1]) - 1, parseInt(fecha[0]),
      parseInt(hora[0] || '0'), parseInt(hora[1] || '0')
    );
    if (!isNaN(d)) return d.getTime();
  }
  return -Infinity;
}


