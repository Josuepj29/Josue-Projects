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




function calcularFechaProxima(fechaBase, texto) {
  let dias = 0;

  if (texto === 'cita_medica') {
    dias = 1;
  } else {
    const matchValue = typeof texto === 'string' && texto.match(/_(\d+)$/);
    if (matchValue) dias = parseInt(matchValue[1], 10);

    if (!dias && typeof texto === 'string') {
      const matchText = texto.match(/(\d+)\s*d[ií]as?/i);
      if (matchText) dias = parseInt(matchText[1], 10);
    }
  }

  if (!dias) return "—";

  let fecha = new Date();


if (typeof fechaBase === 'string') {
  const matchISO = fechaBase.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchISO) {
    const [_, y, m, d] = matchISO;
    fecha = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)); // LOCAL, NO UTC
  }
}
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}





