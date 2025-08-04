let archivosHistoriaActuales = [];
let filaHistoriaActual = null;
let filaRecordatorioActual = null;
const llamadasPorFila = new Map();



function getRegistrosMascotas() {
  try {
    return JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  } catch (e) {
    console.error("Error al obtener registros de mascotas:", e);
    return [];
  }
}

function setRegistrosMascotas(data) {
  try {
    localStorage.setItem('registrosMascotas', JSON.stringify(data));
  } catch (e) {
    console.error("Error al guardar registros de mascotas:", e);
  }
}

function getSalaPeluqueria() {
  try {
    return JSON.parse(localStorage.getItem('salaPeluqueria')) || [];
  } catch (e) {
    console.error("Error al obtener sala de peluquería:", e);
    return [];
  }
}


function setSalaPeluqueria(data) {
  try {
    localStorage.setItem('salaPeluqueria', JSON.stringify(data));
  } catch (e) {
    console.error("Error al guardar sala de peluquería:", e);
  }
}




//////////////////////////// 

function buscarTextoRecordatorio(value, grupos) {
  for (const grupo of grupos) {
    for (const item of grupo.items) {
      if (item.value === value) return item.text;
    }
  }
  return value || "";
}



function llenarResultadosBusqueda() {
  const tbody = document.querySelector('#tablaResultadosBusqueda tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const nombreDuenoFiltro = (document.getElementById('inputNombreDueno')?.value || '').toLowerCase();
  const telefonoFiltro = (document.getElementById('inputTelefono')?.value || '').toLowerCase();
  const nombreMascotaFiltro = (document.getElementById('inputNombreMascota')?.value || '').toLowerCase();
  const nhcFiltro = (document.getElementById('inputNHC')?.value || '').toLowerCase();
  const direccionFiltro = (document.getElementById('inputDireccion')?.value || '').toLowerCase();

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
      const nhcMascota = m.NHC || '-';
      const coincideMascota = (m.nombre || '').toLowerCase().includes(nombreMascotaFiltro) &&
        (nhcMascota || '').toLowerCase().includes(nhcFiltro);

      if (!coincideMascota) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.dueño || ''}</td>
        <td>${m.nombre || ''}</td>
        <td>${p.direccion || ''}</td>
        <td>${p.telefono || ''}</td>
        <td>${nhcMascota}</td>
        <td>
          <button class="btn btn-success btn-agregar"
            data-mascota="${m.nombre || ''}"
            data-dueno="${p.dueño || ''}"
            data-nhc="${nhcMascota}"
            type="button"
            ${nhcMascota === "-" ? "disabled" : ""}>+</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}



document.querySelector('#tablaResultadosBusqueda').addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('btn-agregar')) {
    const btn = e.target;
    const nombreMascota = btn.getAttribute('data-mascota');
    const nombreDueno = btn.getAttribute('data-dueno');
    const nhc = btn.getAttribute('data-nhc');
    agregarSalaPeluqueria(nombreMascota, nombreDueno, nhc);
    $('#resultadoBusqueda').modal('hide');
  }
});



function agregarSalaPeluqueria(nombreMascota, nombreDueno, nhc) {
  const tabla = document.getElementById("tablaSalaPeluqueria");
  if (tabla && tabla.querySelector(`tr[data-nhc="${nhc}"]`)) return;

  let sala = getSalaPeluqueria();
  if (!sala.some(m => m.nhc === nhc)) {
    sala.push({ nhc, nombreMascota, nombreDueno });
    setSalaPeluqueria(sala);
  }

  renderizarSalaPeluqueria();
}

function renderizarSalaPeluqueria() {
  const tbody = document.querySelector("#tablaSalaPeluqueria tbody");
  if (!tbody) return;
  tbody.innerHTML = ""; // Limpia solo las filas, no la cabecera

  const sala = getSalaPeluqueria();
  const registros = getRegistrosMascotas();

  sala.forEach((item) => {
    const propietario = registros.find(p => p.mascotas?.some(m => m.NHC === item.nhc));
    if (!propietario) return;
    const mascota = propietario.mascotas.find(m => m.NHC === item.nhc);
    if (!mascota) return;

    const tr = document.createElement("tr");
    const idFila = Date.now().toString() + Math.floor(Math.random() * 10000);
    tr.setAttribute("data-id", idFila);
    tr.setAttribute("data-nhc", item.nhc);

    tr.innerHTML = `
      <td>${propietario.dueño || ''}</td>
      <td>${mascota.nombre || ''}</td>
      <td>${propietario.direccion || ''}</td>
      <td>${propietario.telefono || ''}</td>
      <td>${item.nhc}</td>
      <td><button class="btn btn-warning btn-sm" onclick="cambiarEstado(this)">En curso</button></td>
      <td><button class="btn btn-outline-info btn-sm" onclick="llamarDueno(this)">--</button></td>
      <td><button class="btn btn-info btn-sm" onclick="mostrarHistorialLlamadas(this)">H. Llamada</button></td>
      <td><button class="btn btn-success btn-sm" onclick="cobrarMascota(this)">No cobrado</button></td>
      <td><button class="btn btn-info btn-sm" onclick="abrirModalHB(this)">HC</button></td>
      <td><button class="btn btn-primary btn-sm" onclick="abrirModalHistoria(this)">+</button></td>
      <td class="text-center"><button class="btn btn-warning btn-recordatorio" onclick="abrirModalRecordatorio(this)">⏰</button></td>
      <td class="text-center"><button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">X</button></td>
    `;
    tbody.appendChild(tr);

    llamadasPorFila.set(idFila, []);
  });
}

document.getElementById("archivosHistoria").addEventListener("change", function (event) {
  const archivos = Array.from(event.target.files);
  archivos.forEach(archivo => {
    const reader = new FileReader();
    reader.onload = e => {
      archivosHistoriaActuales.push(e.target.result);
      renderPreviewArchivos(
        archivosHistoriaActuales,
        document.getElementById('previewArchivosHistoria'),
        (index) => {
          archivosHistoriaActuales.splice(index, 1);
          renderPreviewArchivos(archivosHistoriaActuales, document.getElementById('previewArchivosHistoria'), arguments.callee);
        }
      );
    };
    reader.readAsDataURL(archivo);
  });
  event.target.value = '';
});

function abrirModalHistoria(btn) {
  const fila = btn.closest("tr");
  const nhc = fila?.getAttribute("data-nhc");
  if (!nhc) return;

  filaHistoriaActual = fila;

  let registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas?.some(m => m.NHC === nhc));
  const mascota = propietario?.mascotas.find(m => m.NHC === nhc);
  if (!mascota) return;

  const historia = mascota.historiaTemp || {};

  document.getElementById("historiaBaño").value = historia.servicio || "";
  document.getElementById("observacionesHistoria").value = historia.costo || "";
  archivosHistoriaActuales = [...(historia.archivos || [])];

  renderPreviewArchivos(
    archivosHistoriaActuales,
    document.getElementById('previewArchivosHistoria'),
    (index) => {
      archivosHistoriaActuales.splice(index, 1);
      renderPreviewArchivos(archivosHistoriaActuales, document.getElementById('previewArchivosHistoria'), arguments.callee);
    }
  );

  $("#modalHistoria").modal("show");
}



function cambiarEstado(btn) {
  if (confirm("¿Baño completado?")) {
    btn.textContent = "Finalizado";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-secondary");
  }
}

function llamarDueno(btn) {
  const fila = btn.closest("tr");
  const idFila = fila?.getAttribute("data-id");
  if (!idFila) return;

  const respuesta = prompt("¿Contestó la llamada? Responde Sí o No", "Sí");
  if (respuesta === null) return;

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const listaLlamadas = llamadasPorFila.get(idFila) || [];
  listaLlamadas.push({ hora, resultado: respuesta.toLowerCase() });
  llamadasPorFila.set(idFila, listaLlamadas);

  btn.textContent = hora;
  btn.classList.remove("btn-outline-info");
  btn.classList.add("btn-info");
}



function mostrarHistorialLlamadas(btn) {
  const fila = btn.closest("tr");
  const idFila = fila?.getAttribute("data-id");
  if (!idFila) return;

  const listaLlamadas = llamadasPorFila.get(idFila) || [];
  if (listaLlamadas.length === 0) {
    alert("No hay llamadas registradas para esta mascota.");
    return;
  }

  const mensaje = listaLlamadas.map((l, i) =>
    `${i + 1}. Hora: ${l.hora} - Resultado: ${l.resultado}`
  ).join("\n");

  alert("Historial de llamadas:\n" + mensaje);
}

function cobrarMascota(btn) {
  if (!btn) return;

  const estaCobrado = btn.classList.contains("btn-danger");
  const confirmacion = estaCobrado
    ? confirm("¿Desmarcar como cobrado?")
    : confirm("¿Confirmar que el dueño pagó el servicio?");

  if (!confirmacion) return;

  btn.classList.toggle("btn-success", estaCobrado);
  btn.classList.toggle("btn-danger", !estaCobrado);
  btn.textContent = estaCobrado ? "No cobrado" : "Cobrado";
}




document.getElementById("btnConfirmarHistoria").addEventListener("click", function () {
  if (!filaHistoriaActual) return;

  const nhc = filaHistoriaActual.getAttribute("data-nhc");
  if (!nhc) return;

  let registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas?.some(m => m.NHC === nhc));
  const mascota = propietario?.mascotas.find(m => m.NHC === nhc);
  if (!mascota) return;

  const recordatoriosTemp = mascota.recordatoriosTemp || [];

  if (recordatoriosTemp.length === 0) {
    if (!confirm("No has agregado ningún recordatorio. ¿Deseas guardar la historia de todas formas?")) {
      return;
    }
  } else {
    if (!confirm("¿Guardar temporalmente esta historia con los recordatorios actuales?")) {
      return;
    }
  }

  // CAMBIO: Definición correcta de fechas
 const ahora = new Date();
const hoyStr = ahora.getFullYear() + '-' +
  String(ahora.getMonth() + 1).padStart(2, '0') + '-' +
  String(ahora.getDate()).padStart(2, '0');
const fechaAplicado = ahora.toISOString();  // SIEMPRE ASÍ

  const recordatoriosConvertidos = recordatoriosTemp.map(r => ({
    texto: r.text || r.texto || textosRecordatoriosPelu[r.value] || r.value,
    value: r.value,
    fechaAplicado,
    fechaInicio: hoyStr,
    fechaProxima: calcularFechaProxima(hoyStr, r.value)
  }));

  mascota.historiaTemp = {
    fecha: fechaAplicado,
    servicio: document.getElementById("historiaBaño").value.trim(),
    anamnesis: document.getElementById("historiaBaño").value.trim(),
    costo: document.getElementById("observacionesHistoria").value.trim(),
    tratamiento: document.getElementById("observacionesHistoria").value.trim(),
    archivos: [...archivosHistoriaActuales],
    recordatorios: recordatoriosConvertidos
  };

  setRegistrosMascotas(registros);
  $("#modalHistoria").modal("hide");

  alert("Guardado temporalmente. Se añadirá al historial clínico cuando elimines la mascota de la sala.");
});


document.getElementById('btnConfirmarRecordatorio').addEventListener('click', () => {
  if (!filaRecordatorioActual) return;
  const nhc = filaRecordatorioActual.getAttribute('data-nhc');
  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas.some(m => m.NHC === nhc));
  const mascota = propietario.mascotas.find(m => m.NHC === nhc);

  mascota.recordatoriosTemp = [...window.recordatoriosTemp];
  if (mascota.historiaTemp) {
    const ahora = new Date();
    const fechaHistoria = ahora.getFullYear() + '-' +
      String(ahora.getMonth() + 1).padStart(2, '0') + '-' +
      String(ahora.getDate()).padStart(2, '0');

    mascota.historiaTemp.recordatorios = window.recordatoriosTemp.map(r => ({
      texto: r.text || r.texto || textosRecordatoriosPelu[r.value] || r.value,
      value: r.value,
      fechaInicio: fechaHistoria,
      fechaProxima: calcularFechaProxima(fechaHistoria, r.value)
    }));
  }

  setRegistrosMascotas(registros);

  $('#modalRecordatorio').modal('hide');
  alert(`Recordatorios guardados (temporalmente, se pasarán al historial al eliminar la mascota).`);
});

document.getElementById("btnCancelarHistoria").addEventListener("click", function () {
  archivosHistoriaActuales = [];
  renderPreviewArchivos(archivosHistoriaActuales, document.getElementById('previewArchivosHistoria'));
  document.getElementById("archivosHistoria").value = "";
  $("#modalHistoria").modal("hide");
});



function eliminarFila(btn) {
  if (!confirm("¿Estás seguro de que deseas eliminar a esta mascota de la sala de peluquería? Esta acción también registrará la historia si existe.")) return;

  const fila = btn.closest("tr");
  const nhc = fila?.getAttribute("data-nhc");
  if (!nhc) return;

  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas?.some(m => m.NHC === nhc));
  const mascota = propietario?.mascotas.find(m => m.NHC === nhc);
  if (!mascota) return;



if (mascota.historiaTemp) {
  // Recalcula fechas ANTES de guardar en el historial definitivo
  const ahora = new Date();
  const hoyStr = ahora.getFullYear() + '-' +
    String(ahora.getMonth() + 1).padStart(2, '0') + '-' +
    String(ahora.getDate()).padStart(2, '0');
  const fechaAplicado = ahora.toISOString();

  // Recalcula todas las fechas de recordatorios antes de guardar
  if (Array.isArray(mascota.historiaTemp.recordatorios)) {
    mascota.historiaTemp.recordatorios = mascota.historiaTemp.recordatorios.map(r => ({
      ...r,
      fechaAplicado: fechaAplicado,
      fechaInicio: hoyStr,
      fechaProxima: calcularFechaProxima(hoyStr, r.value)
    }));
  }

  // Corrige también la fecha principal de la historia
  mascota.historiaTemp.fecha = fechaAplicado;

  console.log("Transfiriendo historiaTemp a historialClinico.peluqueria");
  mascota.historialClinico = mascota.historialClinico || {};
  mascota.historialClinico.peluqueria = mascota.historialClinico.peluqueria || [];
  mascota.historialClinico.peluqueria.push(mascota.historiaTemp);
  delete mascota.historiaTemp;
}

  mascota.recordatorios = mascota.recordatorios || [];
  if (Array.isArray(mascota.recordatoriosTemp)) {
    mascota.recordatorios.push(...mascota.recordatoriosTemp);
    delete mascota.recordatoriosTemp;
  }

  setRegistrosMascotas(registros);

  let sala = getSalaPeluqueria();
  sala = sala.filter(m => m.nhc !== nhc);
  setSalaPeluqueria(sala);

  renderizarSalaPeluqueria();
}



function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}



function abrirModalHB(btn) {
  const fila = btn.closest("tr");
  if (!fila) return;

  const nhc = fila.getAttribute("data-nhc");
  if (!nhc) return;

  const registros = getRegistrosMascotas();
  const propietario = registros.find(p =>
    Array.isArray(p.mascotas) && p.mascotas.some(m => m.NHC === nhc)
  );
  const mascota = propietario?.mascotas.find(m => m.NHC === nhc);
  if (!mascota) return;

  const historialMVet = (mascota.historialClinico?.atencionMVet || []).map(h => ({ ...h, _tipo: 'mvet' }));
  const historialPelu = (mascota.historialClinico?.peluqueria || []).map(h => ({ ...h, _tipo: 'peluqueria' }));

  const historial = [...historialMVet, ...historialPelu]
    .filter(h => h.fecha)
    .sort((a, b) => convertirFechaISO(b.fecha) - convertirFechaISO(a.fecha));

  try {
    localStorage.setItem("_historialCombinado_" + nhc, JSON.stringify(historial));
  } catch (e) {
    console.warn("No se pudo guardar historial combinado en localStorage", e);
  }

  // Inicializar textos de recordatorios
  if (typeof inicializarRecordatorios === "function") inicializarRecordatorios();

  // Usar el mismo render que en MVet y Sala
  const contenedor = document.getElementById("tablaHBBody");
  if (contenedor && typeof renderHistorialClinico === "function") {
    renderHistorialClinico(historial, contenedor, function (index, arr) {
      const h = arr[index];
      if (Array.isArray(h.archivos) && h.archivos.length) {
        mostrarCarruselArchivos(h.archivos, 0);
      } else {
        alert("No hay archivos para mostrar.");
      }
    });
  }

  $('#modalHB').modal({
    backdrop: 'static',
    keyboard: false
  });
}




function abrirModalRecordatorio(btn) {
  const fila = btn.closest("tr");
  const nhc = fila?.getAttribute("data-nhc");
  if (!nhc) return;

  let registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas?.some(m => m.NHC === nhc));
  const mascota = propietario?.mascotas.find(m => m.NHC === nhc);
  if (!mascota) return;

  filaRecordatorioActual = fila;
  window.recordatoriosTemp = mascota.recordatoriosTemp || [];
  mascota.recordatoriosTemp = window.recordatoriosTemp;

  llenarSelectRecordatoriosPelu();
  actualizarListaRecordatoriosModal();

  $("#modalRecordatorio").modal("show");
}





function llenarSelectRecordatoriosPelu() {
  const select = document.getElementById('selectRecordatorio');
  if (!select) return;
  select.innerHTML = '<option value="" selected disabled>Seleccione un recordatorio</option>';

  recordatoriosGruposPelu.forEach(grupo => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = grupo.grupo;
    grupo.items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.text;
      optgroup.appendChild(option);
    });
    select.appendChild(optgroup);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  if (typeof inicializarRecordatorios === "function") inicializarRecordatorios();
  renderizarSalaPeluqueria();
  llenarSelectRecordatoriosPelu();
  document.getElementById('btnBuscar').addEventListener('click', () => {
    llenarResultadosBusqueda();
    $('#resultadoBusqueda').modal('show');
  });
  document.querySelector('#tablaResultadosBusqueda').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-agregar')) {
      const btn = e.target;
      const nombreMascota = btn.getAttribute('data-mascota');
      const nombreDueno = btn.getAttribute('data-dueno');
      const nhc = btn.getAttribute('data-nhc');
      agregarSalaPeluqueria(nombreMascota, nombreDueno, nhc);
      $('#resultadoBusqueda').modal('hide');
    }
  });
});

document.getElementById('selectRecordatorio').addEventListener('change', () => {
  const select = document.getElementById('selectRecordatorio');
  const value = select.value;
  if (!value) return;
  if (!window.recordatoriosTemp.some(r => r.value === value)) {
    window.recordatoriosTemp.push({
      value,
      text: textosRecordatoriosPelu[value] || value
    });
    actualizarListaRecordatoriosModal();
  }
});


function actualizarListaRecordatoriosModal() {
  let listaDiv = document.getElementById('listaRecordatorios');
  listaDiv.innerHTML = '';

  if (window.recordatoriosTemp.length === 0) {
    listaDiv.innerHTML = '<p class="text-muted">No hay recordatorios agregados.</p>';
    return;
  }
  window.recordatoriosTemp.forEach((rec, idx) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '2px 5px';
    item.style.borderBottom = '1px solid #eee';

    const textSpan = document.createElement('span');
    textSpan.textContent = rec.text;

    const btnDel = document.createElement('button');
    btnDel.className = 'btn btn-sm btn-danger';
    btnDel.style.padding = '0 6px';
    btnDel.textContent = 'X';
    btnDel.onclick = () => {
      window.recordatoriosTemp.splice(idx, 1);
      actualizarListaRecordatoriosModal();
    };

    item.appendChild(textSpan);
    item.appendChild(btnDel);
    listaDiv.appendChild(item);
  });
}
