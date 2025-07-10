window.recordatoriosGruposPelu = window.recordatoriosGruposPelu || [];
window.recordatoriosMVet = window.recordatoriosMVet || [];
window.textosRecordatoriosPelu = window.textosRecordatoriosPelu || {};
window.textosRecordatoriosMVet = window.textosRecordatoriosMVet || {};
let archivosHistoriaActuales = [];
let archivosEdicionActuales = [];
let recordatoriosEdicionActuales = [];
let filaHistoriaActual = null;
window.textosRecordatoriosMVet = window.textosRecordatoriosMVet || {};
window.textosRecordatoriosPelu = window.textosRecordatoriosPelu || {};
if (window.recordatoriosMVet) {
  window.recordatoriosMVet.forEach(grupo =>
    grupo.items.forEach(item => window.textosRecordatoriosMVet[item.value] = item.text)
  );
}
if (window.recordatoriosGruposPelu) {
  window.recordatoriosGruposPelu.forEach(grupo =>
    grupo.items.forEach(item => window.textosRecordatoriosPelu[item.value] = item.text)
  );
}
function llenarResultadosBusqueda() {
  const tbody = document.querySelector('#tablaResultadosBusqueda tbody');
  tbody.innerHTML = '';

  const nombreDuenoFiltro = (document.getElementById('inputNombreDueno').value || '').toLowerCase();
  const telefonoFiltro = (document.getElementById('inputTelefono').value || '').toLowerCase();
  const nombreMascotaFiltro = (document.getElementById('inputNombreMascota').value || '').toLowerCase();
  const nhcFiltro = (document.getElementById('inputNHC').value || '').toLowerCase();
  const direccionFiltro = (document.getElementById('inputDireccion').value || '').toLowerCase();

  const registros = getRegistrosMascotas();

  const resultados = registros.filter(p => {
    const dueñoMatch = (p.dueño || '').toLowerCase().includes(nombreDuenoFiltro);
    const telefonoMatch = (p.telefono || '').toLowerCase().includes(telefonoFiltro);
    const direccionMatch = (p.direccion || '').toLowerCase().includes(direccionFiltro);

    const tieneMascotas = Array.isArray(p.mascotas) && p.mascotas.some(m => {
      const nombreMascotaMatch = (m.nombre || '').toLowerCase().includes(nombreMascotaFiltro);
      const nhcMatch = (m.NHC || '').toLowerCase().includes(nhcFiltro);
      return nombreMascotaMatch && nhcMatch;
    });
    return dueñoMatch && telefonoMatch && direccionMatch && tieneMascotas;
  });

  if (resultados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No se encontraron resultados.</td></tr>`;
    return;
  }

  resultados.forEach(p => {
    p.mascotas.forEach(m => {
      const coincideMascota = (m.nombre || '').toLowerCase().includes(nombreMascotaFiltro) &&
        (m.NHC || '').toLowerCase().includes(nhcFiltro);
      if (!coincideMascota) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.dueño}</td>
        <td>${m.nombre}</td>
        <td>${p.direccion || ''}</td>
        <td>${p.telefono || ''}</td>
        <td>${m.NHC || '-'}</td>
        <td>
          <button class="btn btn-success btn-ver" data-nhc="${m.NHC || '-'}" type="button">+</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });

  document.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', function () {
      const nhc = this.dataset.nhc;
      mostrarHistorial(nhc);
    });
  });
}
document.getElementById('btnBuscar').addEventListener('click', function() {
  llenarResultadosBusqueda();
  $('#resultadoBusqueda').modal('show');
});
function mostrarHistorial(nhc) {
  const obj = getMascotaByNHC(nhc);
  const mascota = obj?.mascota;
  const dueño = obj?.dueño;

  if (!mascota || !dueño) {
    alert('No se encontró al propietario o la mascota.');
    return;
  }
  document.getElementById('nombreDueno').textContent = dueño.dueño || '';
  document.getElementById('nombreMascota').textContent = mascota.nombre || '';
  document.getElementById('NHC').textContent = mascota.NHC || '';
  document.getElementById('direccionPaciente').textContent = dueño.direccion || '';
  document.getElementById('telefonoPaciente').textContent = dueño.telefono || '';
  document.getElementById('correoPaciente').textContent = dueño.correo || '';
  const historialMVet = mascota.historialClinico?.atencionMVet || [];
  const historialPelu = mascota.historialClinico?.peluqueria || [];
  const historialFusionado = []
    .concat(
      historialMVet.map((h, idx) => ({...h, _tipo: "mvet", _idx: idx})),
      historialPelu.map((h, idx) => ({...h, _tipo: "peluqueria", _idx: idx}))
    )
    .filter(h => h && h.fecha)
    .sort((a, b) => convertirFechaISO(b.fecha) - convertirFechaISO(a.fecha));

  const tablaHistorial = document.getElementById('tablaHistorial');
  tablaHistorial.innerHTML = '';

  if (historialFusionado.length === 0) {
    tablaHistorial.innerHTML = `<tr><td colspan="6" class="text-center">No hay historial disponible.</td></tr>`;
  } else {
    historialFusionado.forEach((item) => {
      let recordatoriosHTML = 'Sin recordatorios';
      if (item.recordatorios?.length) {
        recordatoriosHTML = item.recordatorios.map(r =>
          `<div><strong>${r.texto}</strong><br>Aplicado: ${r.fechaInicio || '—'} | Próxima: ${r.fechaProxima || '—'}</div>`
        ).join('<hr style="margin:5px 0;">');
      }
      let archivosHTML = 'Sin fotos ni videos';
      if (item.archivos?.length) {
        archivosHTML = `
          <button class="btn btn-sm btn-info" onclick="mostrarCarruselArchivos(${JSON.stringify(item.archivos).replace(/"/g, '&quot;')})">
            ${item.archivos.length} archivo(s)
          </button>
        `;
      }
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td style="vertical-align:middle;text-align:center;">${item.fecha || 'Sin fecha'}</td>
        <td style="vertical-align:middle;text-align:center;">${item.servicio || item.anamnesis || 'Sin motivo'}</td>
        <td style="vertical-align:middle;text-align:center;">${item.costo || item.tratamiento || 'Sin tratamiento'}</td>
        <td style="vertical-align:middle;text-align:center;">${recordatoriosHTML}</td>
        <td style="vertical-align:middle;text-align:center;">${archivosHTML}</td>
        <td style="vertical-align:middle;text-align:center;">
          <button class="btn btn-warning btn-sm"
            onclick="abrirModalEditarHistorial('${nhc}','${item._tipo}',${item._idx})">
            Editar
          </button>
        </td>
      `;
      tablaHistorial.appendChild(fila);
    });
  }
  document.getElementById('datosPaciente').style.display = 'block';
  $('#resultadoBusqueda').modal('hide');
}
window.abrirModalEditarHistorial = function(nhc, tipo, idx) {
  const { mascota } = getMascotaByNHC(nhc);
  if (!mascota.historialClinico) mascota.historialClinico = {};
  if (!Array.isArray(mascota.historialClinico.atencionMVet)) mascota.historialClinico.atencionMVet = [];
  if (!Array.isArray(mascota.historialClinico.peluqueria)) mascota.historialClinico.peluqueria = [];
  let historialArr = (tipo === 'peluqueria')
    ? mascota.historialClinico.peluqueria
    : mascota.historialClinico.atencionMVet;
  if (typeof idx !== "number" || idx < 0 || idx >= historialArr.length) {
    alert("No existe la atención/historial solicitado. Verifique los datos.");
    return;
  }

  let atencion = historialArr[idx];
  document.getElementById('editarNHC').value = nhc;
  document.getElementById('editarTipo').value = tipo;
  document.getElementById('editarIdx').value = idx;
  document.getElementById('editarFecha').value = convertirAFechaLocalInput(atencion.fecha);
  document.getElementById('editarMotivo').value = atencion.servicio || atencion.anamnesis || '';
  document.getElementById('editarTratamiento').value = atencion.costo || atencion.tratamiento || '';
  archivosEdicionActuales = [...(atencion.archivos || [])];
  renderPreviewArchivos(
    archivosEdicionActuales,
    document.getElementById('editarPreviewArchivos'),
    (index) => {
      archivosEdicionActuales.splice(index, 1);
      renderPreviewArchivos(archivosEdicionActuales, document.getElementById('editarPreviewArchivos'), arguments.callee);
    }
  );
  recordatoriosEdicionActuales = (atencion.recordatorios || []).map(r => ({
    value: r.value || r.texto || r.text,
    texto: r.texto || r.text || window.textosRecordatoriosMVet[r.value] || window.textosRecordatoriosPelu[r.value] || r.value
  }));
  renderEditarListaRecordatorios();
  let sel = document.getElementById('editarSelectRecordatorio');
  sel.innerHTML = `<option value="">Agregar recordatorio...</option>`;
  const grupos = tipo === 'peluqueria' ? window.recordatoriosGruposPelu : window.recordatoriosMVet;

console.log('TIPO:', tipo);
console.log('GRUPOS:', grupos);
console.log('Pelu:', window.recordatoriosGruposPelu);
console.log('MVet:', window.recordatoriosMVet);
 

  if (grupos && grupos.forEach) {
    grupos.forEach(grupo => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = grupo.grupo;
      grupo.items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.text;
        optgroup.appendChild(option);
      });
      sel.appendChild(optgroup);
    });
  }

  $('#modalEditarHistorial').modal('show');
}
function convertirAFechaLocalInput(fecha) {
  let d = new Date(fecha);
  if (isNaN(d)) {
    let match = fecha && fecha.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2})/);
    if (match) {
      let [_, dia, mes, anio, hora, minuto] = match;
      return `${anio}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}T${hora.padStart(2,'0')}:${minuto}`;
    }
    return "";
  }
  return d.toISOString().slice(0,16);
}
document.getElementById('editarSelectRecordatorio').addEventListener('change', function() {
  const value = this.value;
  if (!value) return;
  if (!recordatoriosEdicionActuales.some(r => r.value === value)) {
    let texto = window.textosRecordatoriosPelu[value] || window.textosRecordatoriosMVet[value] || value;
    recordatoriosEdicionActuales.push({
      value,
      texto,
      fechaInicio: "", fechaProxima: ""
    });
    renderEditarListaRecordatorios();
  }
  this.selectedIndex = 0;
});

function renderEditarListaRecordatorios() {
  let div = document.getElementById('editarListaRecordatorios');
  div.innerHTML = '';
  recordatoriosEdicionActuales.forEach((r, i) => {
    const badge = document.createElement('span');
    badge.className = 'badge badge-pill badge-secondary mr-2 mb-2 d-inline-flex align-items-center';
    badge.style.fontSize = '0.95rem';
    badge.style.padding = '7px 20px';
    badge.style.borderRadius = '15px';
    badge.style.padding = '7px 7px';
badge.style.minWidth = '55px';
badge.style.justifyContent = 'center';
    const text = document.createElement('span');
    text.textContent = r.texto || r.text || (window.textosRecordatoriosMVet?.[r.value] || window.textosRecordatoriosPelu?.[r.value]) || r.value;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'close ml-1';
    btn.style.fontSize = '1rem';
    btn.innerHTML = '&times;';
    btn.onclick = () => {
      recordatoriosEdicionActuales.splice(i, 1);
      renderEditarListaRecordatorios();
    };

    badge.appendChild(text);
    badge.appendChild(btn);

    div.appendChild(badge);
  });
}
document.getElementById("editarArchivos").addEventListener("change", function(event) {
  const archivos = Array.from(event.target.files);
  archivos.forEach(archivo => {
    const reader = new FileReader();
    reader.onload = e => {
      archivosEdicionActuales.push(e.target.result);
      renderPreviewArchivos(archivosEdicionActuales, document.getElementById('editarPreviewArchivos'), (index) => {
        archivosEdicionActuales.splice(index, 1);
        renderPreviewArchivos(archivosEdicionActuales, document.getElementById('editarPreviewArchivos'), arguments.callee);
      });
    };
    reader.readAsDataURL(archivo);
  });
  event.target.value = '';
});
document.getElementById('formEditarHistorial').addEventListener('submit', function(e) {
  e.preventDefault();

  const nhc = document.getElementById('editarNHC').value;
  const tipo = document.getElementById('editarTipo').value;
  const idx = parseInt(document.getElementById('editarIdx').value);
  let registros = getRegistrosMascotas();
  let propietario = registros.find(p => (p.mascotas || []).some(m => m.NHC === nhc));
  if (!propietario) {
    alert("No se encontró el propietario para guardar los cambios.");
    return;
  }
  let mascota = propietario.mascotas.find(m => m.NHC === nhc);
  if (!mascota.historialClinico) mascota.historialClinico = {};
  if (!Array.isArray(mascota.historialClinico.atencionMVet)) mascota.historialClinico.atencionMVet = [];
  if (!Array.isArray(mascota.historialClinico.peluqueria)) mascota.historialClinico.peluqueria = [];
  let historialArr = (tipo === 'peluqueria')
    ? mascota.historialClinico.peluqueria
    : mascota.historialClinico.atencionMVet;
  if (typeof idx !== "number" || idx < 0 || idx >= historialArr.length) {
    alert("No se encontró la atención a editar.");
    return;
  }

  let atencion = historialArr[idx];
  let fechaInput = document.getElementById('editarFecha').value;
  let fechaStr = fechaInput
    ? new Date(fechaInput).toLocaleString('es-PE', { hour12: true })
    : atencion.fecha;

  atencion.fecha = fechaStr;
  atencion.servicio = document.getElementById('editarMotivo').value;
  atencion.costo = document.getElementById('editarTratamiento').value;
  atencion.archivos = [...archivosEdicionActuales];
  atencion.tipo = tipo;
  atencion.recordatorios = recordatoriosEdicionActuales.map(r => {
    let fechaInicio = fechaStr;
    let proxima = calcularFechaProxima(fechaInicio, r.value || r.texto);
    return {
      texto: r.texto,
      value: r.value,
      fechaInicio,
      fechaProxima: proxima
    };
  });
  setRegistrosMascotas(registros);

  $('#modalEditarHistorial').modal('hide');
  alert("Historial actualizado.");
  mostrarHistorial(nhc);
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnBuscar').addEventListener('click', function() {
    llenarResultadosBusqueda();
    $('#resultadoBusqueda').modal('show');
  });
});
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
  if (meridian.toLowerCase().includes('p.m.') && hour < 12) hour += 12;
  else if (meridian.toLowerCase().includes('a.m.') && hour === 12) hour = 0;
  return new Date(year, month - 1, day, hour, minute, second);
}
function calcularFechaProxima(fechaInicio, value) {
  let dias = 0;
  let match = value && value.match(/\d+$/);
  if (match) dias = parseInt(match[0]);
  else if (/365/.test(value)) dias = 365;
  else if (/30/.test(value)) dias = 30;
  else if (/21/.test(value)) dias = 21;
  else if (/14/.test(value)) dias = 14;
  else if (/10/.test(value)) dias = 10;
  else if (/7/.test(value)) dias = 7;
  else if (/1/.test(value)) dias = 1;

  let d = new Date(fechaInicio);
  if (isNaN(d)) d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}
