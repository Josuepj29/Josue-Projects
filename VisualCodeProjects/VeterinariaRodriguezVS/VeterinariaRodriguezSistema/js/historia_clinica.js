
let archivosHistoriaActuales = [];
let archivosEdicionActuales = [];
let recordatoriosEdicionActuales = [];
let filaHistoriaActual = null;


/* INICIALIZAR REC */




function inicializarRecordatorios() {
  window.recordatoriosGruposPelu = window.recordatoriosGruposPelu || [];
  window.recordatoriosMVet = window.recordatoriosMVet || [];
  window.textosRecordatoriosPelu = {};
  window.textosRecordatoriosMVet = {};

  (window.recordatoriosMVet || []).forEach(grupo => {
    (grupo.items || []).forEach(item => {
      if (item?.value && item?.text) {
        window.textosRecordatoriosMVet[item.value] = item.text;
      }
    });
  });

  (window.recordatoriosGruposPelu || []).forEach(grupo => {
    (grupo.items || []).forEach(item => {
      if (item?.value && item?.text) {
        window.textosRecordatoriosPelu[item.value] = item.text;
      }
    });
  });
}
inicializarRecordatorios();




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
    const telefonoMatch = (p.telefono || '').toLowerCase().includes(telefonoFiltro) ||(p.telefono2 || '').toLowerCase().includes(telefonoFiltro);
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
        <td>${combinarTelefonos(p.telefono, p.telefono2)}</td>
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
      $('#resultadoBusqueda').modal('hide');
    });
  });
}
document.getElementById('btnBuscar').addEventListener('click', function () {
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
  document.getElementById('telefonoPaciente').textContent = combinarTelefonos(dueño.telefono, dueño.telefono2);
  document.getElementById('correoPaciente').textContent = dueño.correo || '';

  const historialMVet = mascota.historialClinico?.atencionMVet || [];
  const historialPelu = mascota.historialClinico?.peluqueria || [];

  const historialFusionado = []
    .concat(
      historialMVet.map((h, idx) => ({ ...h, _tipo: 'mvet', _idx: idx, NHC: mascota.NHC })),
      historialPelu.map((h, idx) => ({ ...h, _tipo: 'peluqueria', _idx: idx, NHC: mascota.NHC }))
    )
    .filter(h => h && h.fecha)
    .sort((a, b) => parsearFechaSeguro(b.fecha) - parsearFechaSeguro(a.fecha));

  if (typeof inicializarRecordatorios === "function") {
    inicializarRecordatorios();
  }

  // AHORA SÍ: render en el tbody
  renderHistorialClinico(historialFusionado, document.getElementById("tablaHistorial"));

  document.getElementById('datosPaciente').style.display = 'block';
}


function renderHistorialClinico(historial, contenedor) {
  contenedor.innerHTML = '';

  if (!historial || historial.length === 0) {
    contenedor.innerHTML = '<p>No hay historial clínico registrado para esta mascota.</p>';
    return;
  }

  // Creamos la tabla con encabezados
  const tabla = document.createElement('table');
  tabla.className = 'table table-striped table-bordered';

  tabla.innerHTML = `
  <thead>
    <tr>
      <th style="width:170px;">Fecha</th>
      <th style="width:50px;">Tipo</th>
      <th>Detalle</th>
      <th>Tratamiento / Costo</th>
      <th>Archivos</th>
      <th>Recordatorios</th>
      <th>Editar</th>
    </tr>
  </thead>
  <tbody></tbody>
`;
  const tbody = tabla.querySelector('tbody');

  historial.forEach((h, idx) => {
    const tr = document.createElement('tr');

    // Fecha formateada
 const fechaBonita = formatearFechaBonita(h.fecha);


 
function formatearFechaBonita(fecha) {
  if (!fecha) return '—';
  // Si es ISO con Z
  let d = new Date(fecha);
  if (!isNaN(d)) {
    // Siempre muestra en local pero sin segundos
    let y = d.getFullYear();
    let m = String(d.getMonth() + 1).padStart(2, '0');
    let day = String(d.getDate()).padStart(2, '0');
    let h = String(d.getHours()).padStart(2, '0');
    let min = String(d.getMinutes()).padStart(2, '0');
    // AQUÍ CAMBIAS EL SEPARADOR por guion largo (Alt+0151, o copia este: —)
    return `${y}-${m}-${day} — ${h}:${min}`;
  }
  // Si es tipo input local
  let match = fecha.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/);
  if (match) return match[1] + ' — ' + match[2] + ':' + match[3];
  // Si es dd/mm/yyyy, hh:mm
  let match2 = fecha.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2})/);
  if (match2) {
    let [_, dia, mes, anio, hora, minuto] = match2;
    return `${anio}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')} — ${hora.padStart(2,'0')}:${minuto}`;
  }
  return fecha;
}






    // Tipo
    const tipo = h._tipo === 'mvet' ? 'Atención médica'
      : h._tipo === 'peluqueria' ? 'Peluquería'
        : '—';

    // Archivos
    let archivosHTML = '—';
    if (Array.isArray(h.archivos) && h.archivos.length > 0) {
      archivosHTML = `<button class="btn btn-info btn-sm" onclick="mostrarCarruselArchivos(${JSON.stringify(h.archivos).replace(/"/g, '&quot;')})">
        Ver (${h.archivos.length})
      </button>`;
    }

    // Recordatorios (varios en columna, como badges verticales)
    let recordatoriosHTML = '—';
    if (Array.isArray(h.recordatorios) && h.recordatorios.length > 0) {
      recordatoriosHTML = h.recordatorios.map(r => {
        // Usa texto bonito del diccionario
        const valor = r.value || r.texto || r.text;
        const texto = window.textosRecordatoriosMVet?.[valor]
          || window.textosRecordatoriosPelu?.[valor]
          || r.texto || r.text || valor || '—';
        const aplicado = formatearFechaBonita(r.fechaInicio || r.fechaAplicado || '—');
        const proxima = r.fechaProxima || r.proxima || '—';
        return `
          <span class="badge badge-info d-block mb-1" style="white-space:normal;">
            <strong>${texto}</strong><br>
            <span style="font-size:12px;">
              Aplicado: ${aplicado}<br>
              Próxima: ${proxima}
            </span>
          </span>
        `;
      }).join('');
    }

    // Agregar fila
    tr.innerHTML = `
      <td style="vertical-align:middle;">${fechaBonita}</td>
      <td style="vertical-align:middle;">${tipo}</td>
      <td style="vertical-align:middle;">${h.anamnesis || h.servicio || '—'}</td>
      <td style="vertical-align:middle;">${h.tratamiento || h.costo || '—'}</td>
      <td style="vertical-align:middle;">${archivosHTML}</td>
      <td style="vertical-align:middle;">${recordatoriosHTML}</td>
      <td style="vertical-align:middle;">
        <button class="btn btn-warning btn-sm" onclick="abrirModalEditarHistorial('${h.NHC || ''}','${h._tipo}',${h._idx})">
          Editar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  contenedor.innerHTML = '';
  contenedor.appendChild(tabla);
}


function convertirAFechaLocalInput(fecha) {
  if (!fecha) return "";

  // Si ya es formato input local puro (YYYY-MM-DDTHH:mm)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fecha)) return fecha;

  // Si es ISO con segundos y Z
  let match = fecha.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (match) return match[1] + 'T' + match[2] + ':' + match[3];

  // Si es dd/mm/yyyy, hh:mm
  let match2 = fecha.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2})/);
  if (match2) {
    let [_, dia, mes, anio, hora, minuto] = match2;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora.padStart(2, '0')}:${minuto}`;
  }

  // Por si acaso algún formato raro, intenta con Date pero en local
  try {
    let d = new Date(fecha);
    if (!isNaN(d)) {
      // OJO: aquí sacamos la fecha y hora local, no UTC
      return (
        d.getFullYear() +
        '-' + String(d.getMonth() + 1).padStart(2, '0') +
        '-' + String(d.getDate()).padStart(2, '0') +
        'T' + String(d.getHours()).padStart(2, '0') +
        ':' + String(d.getMinutes()).padStart(2, '0')
      );
    }
  } catch (e) {}
  return "";
}




document.getElementById('datosPaciente').style.display = 'block';
$('#resultadoBusqueda').modal('hide');

window.abrirModalEditarHistorial = function (nhc, tipo, idx) {
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

   console.log('Valor fecha en objeto:', atencion.fecha);

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

document.getElementById('editarSelectRecordatorio').addEventListener('change', function () {
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
document.getElementById("editarArchivos").addEventListener("change", function (event) {
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




document.getElementById('formEditarHistorial').addEventListener('submit', function (e) {
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
  let fechaStr = fechaInput ? fechaInput : atencion.fecha; // <-- ¡Bien

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
  document.getElementById('btnBuscar').addEventListener('click', function () {
    llenarResultadosBusqueda();
    $('#resultadoBusqueda').modal('show');
  });
});



