function renderHistorialClinico(historial, contenedor, onVerArchivos) {
  contenedor.innerHTML = '';
  if (!historial || !Array.isArray(historial) || historial.length === 0) {
    contenedor.innerHTML = '<p>No hay historial clínico registrado para esta mascota.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.className = 'table table-bordered table-sm';
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Detalle</th>
        <th>Tratamiento / Costo</th>
        <th>Archivos</th>
        <th>Recordatorios</th>
      </tr>
    </thead>
    <tbody>
      ${
        historial.map((h, i) => {
          let recordatoriosHTML = '—';
          if (h.recordatorios?.length) {
            recordatoriosHTML = h.recordatorios.map(r =>
              `<div><strong>${r.texto}</strong><br>Aplicado: ${r.fechaInicio || '—'} | Próxima: ${r.fechaProxima || '—'}</div>`
            ).join('<hr style="margin:5px 0;">');
          }
          return `
            <tr>
              <td>${h.fecha || '—'}</td>
              <td>${h.origen || '—'}</td>
              <td>${h.anamnesis || h.servicio || h.detalle || '—'}</td>
              <td>${h.tratamiento || h.costo || '—'}</td>
              <td style="text-align:center;">
                ${
                  h.archivos?.length
                  ? `<button class="btn btn-sm btn-info" onclick="window._verArchivosHistorialUniversal && window._verArchivosHistorialUniversal(${i})">${h.archivos.length} archivo(s)</button>`
                  : '0 archivo(s)'
                }
              </td>
              <td>${recordatoriosHTML}</td>
            </tr>
          `;
        }).join('')
      }
    </tbody>
  `;
  contenedor.appendChild(tabla);
  if (typeof onVerArchivos === "function") {
    window._verArchivosHistorialUniversal = (index) => onVerArchivos(index, historial);
  }
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
  const matchValue = typeof texto === 'string' && texto.match(/_(\d+)$/);
  if (matchValue) dias = parseInt(matchValue[1], 10);
  if (!dias && typeof texto === 'string') {
    const matchText = texto.match(/(\d+)\s*d[ií]as?/i);
    if (matchText) dias = parseInt(matchText[1], 10);
  }
  if (!dias) return "—";
  let fecha = new Date();
  if (typeof fechaBase === 'string') {
    const partes = fechaBase.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (partes) {
      const [_, d, m, y] = partes;
      fecha = new Date(`${y}-${m}-${d}`);
    } else {
      const matchISO = fechaBase.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (matchISO) {
        fecha = new Date(fechaBase);
      }
    }
  }
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}






