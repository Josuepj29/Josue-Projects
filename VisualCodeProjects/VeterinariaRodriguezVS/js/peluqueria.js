// ======= VARS GLOBALES =======
let archivosHistoriaActuales = []; // Archivos adjuntos para historia
let filaHistoriaActual = null;
let filaRecordatorioActual = null;
const llamadasPorFila = new Map(); // Solo memoria

// ==== STORAGE UTILS ====
function getRegistrosMascotas() {
  return JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
}
function setRegistrosMascotas(data) {
  localStorage.setItem('registrosMascotas', JSON.stringify(data));
}
function getSalaPeluqueria() {
  return JSON.parse(localStorage.getItem('salaPeluqueria') || '[]');
}
function setSalaPeluqueria(data) {
  localStorage.setItem('salaPeluqueria', JSON.stringify(data));
}

// ==== Útil para obtener texto de recordatorio por value ====
function buscarTextoRecordatorio(value, grupos) {
  for (const grupo of grupos) {
    for (const item of grupo.items) {
      if (item.value === value) return item.text;
    }
  }
  return value || "";
}

// ==== BÚSQUEDA Y AGREGADO A SALA ====
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
      const nhcMascota = (m.NHC || '').toLowerCase();
      const nhcMatch = nhcMascota.includes(nhcFiltro);
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
            ${nhcMascota === "-" ? "disabled" : ""}
          >+</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// Evento agregar a sala
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
  if (tabla.querySelector(`tr[data-nhc="${nhc}"]`)) return;

  let sala = getSalaPeluqueria();
  if (!sala.some(m => m.nhc === nhc)) {
    sala.push({ nhc, nombreMascota, nombreDueno });
    setSalaPeluqueria(sala);
  }
  renderizarSalaPeluqueria();
}


// ========= RENDER DE SALA =========
function renderizarSalaPeluqueria() {
  const tabla = document.getElementById("tablaSalaPeluqueria");
  tabla.innerHTML = "";
  const sala = getSalaPeluqueria();
  const registros = getRegistrosMascotas();

  sala.forEach((item) => {
    const propietario = registros.find(p => p.mascotas.some(m => m.NHC === item.nhc));
    if (!propietario) return;
    const mascota = propietario.mascotas.find(m => m.NHC === item.nhc);
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
      <td><button class="btn btn-info btn-sm" onclick="abrirModalHC(this)">HC</button></td>
      <td><button class="btn btn-primary btn-sm" onclick="abrirModalHistoria(this)">+</button></td>
      <td class="text-center"><button class="btn btn-warning btn-recordatorio" onclick="abrirModalRecordatorio(this)">⏰</button></td>
      <td class="text-center"><button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">X</button></td>
    `;
    tabla.appendChild(tr);
    llamadasPorFila.set(idFila, []); // Inicializa llamadas en memoria
  });
}

// ======= MODALES: historia, archivos =======
document.getElementById("archivosHistoria").addEventListener("change", function(event) {
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
  event.target.value = ''; // Permitir elegir el mismo archivo después
});

function abrirModalHistoria(btn) {
  filaHistoriaActual = btn.closest("tr");
  const nhc = filaHistoriaActual.getAttribute("data-nhc");
  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas.some(m => m.NHC === nhc));
  const mascota = propietario.mascotas.find(m => m.NHC === nhc);

  if (mascota.historiaTemp) {
    document.getElementById("historiaBaño").value = mascota.historiaTemp.servicio || "";
    document.getElementById("observacionesHistoria").value = mascota.historiaTemp.costo || "";
    archivosHistoriaActuales = [...(mascota.historiaTemp.archivos || [])];
  } else {
    document.getElementById("historiaBaño").value = "";
    document.getElementById("observacionesHistoria").value = "";
    archivosHistoriaActuales = [];
  }
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

// ======= LLAMADAS, ESTADO, COBRO =======
function cambiarEstado(btn) {
  if (confirm("¿Baño completado?")) {
    btn.textContent = "Finalizado";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-secondary");
  }
}

function llamarDueno(btn) {
  const fila = btn.closest("tr");
  const idFila = fila.getAttribute("data-id");
  if (!idFila) return;

  const respuesta = prompt("¿Contestó la llamada? Responde Sí o No", "Sí");
  if (respuesta === null) return;

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let listaLlamadas = llamadasPorFila.get(idFila) || [];
  listaLlamadas.push({ hora, resultado: respuesta.toLowerCase() });
  llamadasPorFila.set(idFila, listaLlamadas);

  btn.textContent = hora;
  btn.classList.remove("btn-outline-info");
  btn.classList.add("btn-info");
}

function mostrarHistorialLlamadas(btn) {
  const fila = btn.closest("tr");
  const idFila = fila.getAttribute("data-id");
  if (!idFila) return;

  const listaLlamadas = llamadasPorFila.get(idFila) || [];
  if (listaLlamadas.length === 0) {
    alert("No hay llamadas registradas para esta mascota.");
    return;
  }

  let mensaje = "Historial de llamadas:\n";
  listaLlamadas.forEach((llamada, index) => {
    mensaje += `${index + 1}. Hora: ${llamada.hora} - Resultado: ${llamada.resultado}\n`;
  });

  alert(mensaje);
}

function cobrarMascota(btn) {
  const estadoActual = btn.classList.contains("btn-success") ? "No cobrado" : "Cobrado";
  const pregunta = estadoActual === "No cobrado"
    ? "¿Confirmar que el dueño pagó el servicio?"
    : "¿Desmarcar como cobrado?";

  if (!confirm(pregunta)) return;

  if (estadoActual === "No cobrado") {
    btn.classList.remove("btn-success");
    btn.classList.add("btn-danger");
    btn.textContent = "Cobrado";
  } else {
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-success");
    btn.textContent = "No cobrado";
  }
}
// ====== GUARDAR HISTORIA (TEMPORAL) ======
document.getElementById("btnConfirmarHistoria").addEventListener("click", function () {
  if (!filaHistoriaActual) return;

  const nhc = filaHistoriaActual.getAttribute("data-nhc");
  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas.some(m => m.NHC === nhc));
  const mascota = propietario.mascotas.find(m => m.NHC === nhc);

  // Recordatorios temporales antes de guardar
  const recordatoriosTemp = mascota.recordatoriosTemp || [];

  // ADVERTENCIA si no hay recordatorios, pero deja continuar
  if (recordatoriosTemp.length === 0) {
    if (!confirm("No has agregado ningún recordatorio. ¿Deseas guardar la historia de todas formas?")) {
      return;
    }
  } else {
    if (!confirm("¿Guardar temporalmente esta historia con los recordatorios actuales?")) {
      return;
    }
  }

  // Fecha con hora
  const fechaAhora = new Date();
  const fechaCompleta = `${fechaAhora.toLocaleDateString()}, ${fechaAhora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Recordatorios a guardar en la historia temporal
  const recordatoriosConvertidos = recordatoriosTemp.map(r => ({
    texto: r.text || r.texto || textosRecordatoriosPelu[r.value] || r.value,
    value: r.value,
    fechaInicio: fechaCompleta,
    fechaProxima: calcularFechaProxima(fechaCompleta, r.value)
  }));

  mascota.historiaTemp = {
    fecha: fechaCompleta,
    servicio: document.getElementById("historiaBaño").value.trim(),
    costo: document.getElementById("observacionesHistoria").value.trim(),
    archivos: [...archivosHistoriaActuales],
    recordatorios: recordatoriosConvertidos
  };

  setRegistrosMascotas(registros);
  $("#modalHistoria").modal("hide");
  alert("Guardado temporalmente. Se añadirá al historial clínico cuando elimines la mascota de la sala.");
});

// ====== CONFIRMAR Y GUARDAR RECORDATORIO TEMPORAL ======
document.getElementById('btnConfirmarRecordatorio').addEventListener('click', () => {
  if (!filaRecordatorioActual) return;
  const nhc = filaRecordatorioActual.getAttribute('data-nhc');
  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas.some(m => m.NHC === nhc));
  const mascota = propietario.mascotas.find(m => m.NHC === nhc);

  mascota.recordatoriosTemp = [...window.recordatoriosTemp];

  // Si ya existe historia temporal, actualiza sus recordatorios
  if (mascota.historiaTemp) {
    const fechaHistoria = mascota.historiaTemp.fecha || new Date().toLocaleDateString();
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

// ====== ELIMINAR FILA (PASAR A HISTORIAL) ======
function eliminarFila(btn) {
  if (!confirm('¿Eliminar esta mascota y guardar atención en historial?')) return;

  const fila = btn.closest('tr');
  const nhc = fila.getAttribute('data-nhc');
  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas.some(m => m.NHC === nhc));
  const mascota = propietario.mascotas.find(m => m.NHC === nhc);

  // Construye la nueva atención a guardar en el historial
  const historiaTemp = mascota.historiaTemp || {};

  const fecha = historiaTemp.fecha || new Date().toLocaleDateString();
  const recordatorios = historiaTemp.recordatorios || [];

  const nuevaAtencion = {
    fecha: fecha,
    servicio: historiaTemp.servicio || "Baño",
    costo: historiaTemp.costo || "—",
    tipo: "peluqueria",
    archivos: historiaTemp.archivos || [],
    recordatorios: recordatorios
  };

  // Guardar en historial clínico (estructura global)
  mascota.historialClinico = mascota.historialClinico || {};
  mascota.historialClinico.peluqueria = mascota.historialClinico.peluqueria || [];
  mascota.historialClinico.peluqueria.push(nuevaAtencion);

  // Limpiar campos temporales
  mascota.historiaTemp = null;
  mascota.recordatoriosTemp = [];

  setRegistrosMascotas(registros);

  // Limpiar sala y eliminar la fila
  let sala = getSalaPeluqueria();
  sala = sala.filter(m => m.nhc !== nhc);
  setSalaPeluqueria(sala);

  fila.remove();

  alert("Mascota eliminada y atención guardada en historial clínico.");
}

// ====== MODAL DE HISTORIAL CLÍNICO ======
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function abrirModalHC(btn) {
  const fila = btn.closest("tr");
  const nhc = fila.getAttribute("data-nhc");

  // Lee ambos orígenes
  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas.some(m => m.NHC === nhc));
  const mascota = propietario?.mascotas.find(m => m.NHC === nhc);

  const historialMVet = mascota?.historialClinico?.atencionMVet || [];
  const historialPelu = mascota?.historialClinico?.peluqueria || [];
  const historial = [...historialMVet, ...historialPelu]
    .filter(h => h.fecha)
    .sort((a, b) => convertirFechaISO(b.fecha) - convertirFechaISO(a.fecha));

  // Guarda fusión para visor de archivos
  localStorage.setItem("_historialCombinado_" + nhc, JSON.stringify(historial));

  // Render tabla
  const tbody = document.getElementById("tablaHBBody");
  const sinHistorialP = document.getElementById("sinHistorialHB");
  tbody.innerHTML = "";

  if (historial.length === 0) {
    sinHistorialP.style.display = "block";
  } else {
    sinHistorialP.style.display = "none";
    historial.forEach((h, index) => {
      let recordatoriosHTML = "—";
      if (h.recordatorios?.length) {
        recordatoriosHTML = h.recordatorios.map(r => {
          let texto = r.texto || r.text || (r.value ? textosRecordatoriosPelu[r.value] : "") || r.value || "";
          let valueForCalc = r.value || "";
          if (!valueForCalc && texto) {
            valueForCalc = Object.keys(textosRecordatoriosPelu).find(
              k => textosRecordatoriosPelu[k] === texto
            ) || texto;
          }
          let fechaAplicado = r.fechaInicio || h.fecha || "—";
          let fechaProxima = (r.fechaProxima && r.fechaProxima !== "—")
            ? r.fechaProxima
            : calcularFechaProxima(fechaAplicado, valueForCalc);
          return `<div>
            <strong>${texto}</strong><br>
            Aplicado: ${fechaAplicado} | Próxima: ${fechaProxima}
          </div>`;
        }).join('<hr style="margin:5px 0;">');
      }
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${h.fecha || "Sin fecha"}</td>
        <td>${capitalizeFirst(h.tipo) || "—"}</td>
        <td>${h.servicio || h.anamnesis || "Sin detalle"}</td>
        <td>${h.costo || h.tratamiento || "––"}</td>
        <td>
          ${h.archivos?.length ? `<button class="btn btn-info btn-sm" onclick='mostrarCarruselArchivos(${JSON.stringify(h.archivos).replace(/"/g, '&quot;')})'>Ver (${h.archivos.length})</button>` : "0 archivo(s)"}
        </td>
        <td>${recordatoriosHTML}</td>
      `;
      tbody.appendChild(tr);
    });
  }
  $('#modalHB').modal({
    backdrop: 'static',
    keyboard: false
  });
}

// ========== RECORDATORIO MODAL Y LLENADO SELECT ==========
function abrirModalRecordatorio(btn) {
  filaRecordatorioActual = btn.closest('tr');
  const nhc = filaRecordatorioActual.getAttribute('data-nhc');
  const registros = getRegistrosMascotas();
  const propietario = registros.find(p => p.mascotas.some(m => m.NHC === nhc));
  const mascota = propietario.mascotas.find(m => m.NHC === nhc);

  // Iniciar recordatorios temp o cargar si ya existen
  window.recordatoriosTemp = mascota?.recordatoriosTemp || [];
  actualizarListaRecordatoriosModal();
  $('#modalRecordatorio').modal('show');
}

// LLENAR SELECT (usando recordatoriosGruposPelu de recordatorios.js)
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

// Inicializar select al cargar
document.addEventListener('DOMContentLoaded', () => {
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

  // Evita duplicados
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
