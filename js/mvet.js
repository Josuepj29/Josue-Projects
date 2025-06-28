// ========================= VARIABLES GLOBALES Y HELPERS =========================
let pacienteAConfirmar = null;
let pacienteRecordatorios = null;
let recordatorios = [];
let archivosActuales = [];

// Helper para buscar el texto de recordatorio (M.Vet)
function obtenerTextoRecordatorioMVet(value) {
  for (const grupo of recordatoriosMVet) {
    for (const item of grupo.items) {
      if (item.value === value) return item.text;
    }
  }
  return value;
}

// ========================= OBTENER Y GUARDAR PACIENTES (SALA DE ESPERA) =========================
function obtenerPacientes() {
  return JSON.parse(localStorage.getItem('salaEspera') || '[]');
}
function setPacientes(data) {
  localStorage.setItem('salaEspera', JSON.stringify(data));
}

// ========================= CARGA DE PACIENTES EN TABLA =========================
function cargarPacientes() {
  const tbody = document.getElementById('tablaMVet');
  tbody.innerHTML = '';

  const pacientes = obtenerPacientes();
  if (pacientes.length === 0) return;

  pacientes.forEach(p => {
    const fila = document.createElement('tr');
    fila.id = `fila_${p.NHC}`;
    fila.innerHTML = `
      <td>${p.dueño}</td>
      <td>${p.mascota}</td>
      <td>${p.telefono || '––'}</td>
      <td>${p.direccion || '––'}</td>
      <td>${p.NHC}</td>
      <td>${p.estado || '––'}</td>
      <td>
        <div class="btn-group">
          ${p.estado === "En espera" ?`
            <button class="btn btn-sm btn-info" onclick="abrirModalAtencion('${p.NHC}')">Atender</button>
            <button class="btn btn-sm btn-warning" onclick="abrirModalRecordatorios('${p.NHC}')">⏰</button>
            <button class="btn btn-sm btn-primary" onclick="mostrarObservacion('${p.NHC}')">OBS.</button>
            <button class="btn btn-sm btn-info" onclick="abrirModalHistorialClinico('${p.NHC}')">HC</button>
          ` : `
            <button class="btn btn-sm btn-secondary" disabled>Atendido</button>
          `}
          <button class="btn btn-sm btn-danger" style="padding: 0 6px; font-weight: bold;" onclick="abrirConfirmacion('${p.NHC}')">×</button>
        </div>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// =========== RECORDATORIOS: Llenar el <select> desde el agrupado ===========
function llenarSelectRecordatoriosMVet() {
  const select = document.getElementById('selectNuevoRecordatorio');
  select.innerHTML = '<option value="" selected disabled>Seleccione un recordatorio</option>';
  recordatoriosMVet.forEach(grupo => {
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
document.addEventListener('DOMContentLoaded', llenarSelectRecordatoriosMVet);

// ========================= OBSERVACIÓN Y FECHAS =========================
function mostrarObservacion(NHC) {
  const paciente = obtenerPacientes().find(p => p.NHC === NHC);
  alert(paciente?.observacion || 'No hay observaciones registradas.');
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

// ========================= MODAL ATENCIÓN MÉDICA =========================

function abrirModalAtencion(NHC) {
  pacienteRecordatorios = NHC;
  document.getElementById('codPacienteActual').value = NHC;

  const sala = obtenerPacientes();
  const paciente = sala.find(p => p.NHC === NHC);

  document.getElementById('inputAnamnesis').value = paciente?.anamnesisTmp || '';
  document.getElementById('inputTratamiento').value = paciente?.tratamientoTmp || '';
  archivosActuales = paciente?.archivosTmp || [];

  // Limpia input file y renderiza previsualización
  document.getElementById('inputArchivos').value = '';
  renderPreviewArchivos(
    archivosActuales,
    document.getElementById('previewArchivos'),
    function (i) {
      archivosActuales.splice(i, 1);
      // Actualiza temporalmente en salaEspera
      const sala = obtenerPacientes();
      sala.forEach(p => {
        if (p.NHC === NHC) p.archivosTmp = archivosActuales;
      });
      setPacientes(sala);
      renderPreviewArchivos(
        archivosActuales,
        document.getElementById('previewArchivos'),
        arguments.callee
      );
    }
  );

  $('#modalAtencion').modal('show');
}

// Escuchar selección de archivos
document.getElementById('inputArchivos').addEventListener('change', function (event) {
  const archivos = Array.from(event.target.files);
  const NHC = document.getElementById('codPacienteActual').value;
  const sala = obtenerPacientes();

  archivos.forEach(archivo => {
    const reader = new FileReader();
    reader.onload = e => {
      archivosActuales.push(e.target.result);
      sala.forEach(p => {
        if (p.NHC === NHC) p.archivosTmp = archivosActuales;
      });
      setPacientes(sala);
      renderPreviewArchivos(
        archivosActuales,
        document.getElementById('previewArchivos'),
        function (i) {
          archivosActuales.splice(i, 1);
          sala.forEach(p => {
            if (p.NHC === NHC) p.archivosTmp = archivosActuales;
          });
          setPacientes(sala);
          renderPreviewArchivos(
            archivosActuales,
            document.getElementById('previewArchivos'),
            arguments.callee
          );
        }
      );
    };
    reader.readAsDataURL(archivo);
  });
  event.target.value = '';
});

// Guardar atención temporalmente en salaEspera
document.getElementById('guardarAtencionBtn').addEventListener('click', function () {
  const NHC = document.getElementById('codPacienteActual').value;
  const anam = document.getElementById('inputAnamnesis').value.trim();
  const trat = document.getElementById('inputTratamiento').value.trim();

  const sala = obtenerPacientes();
  sala.forEach(p => {
    if (p.NHC === NHC) {
      p.anamnesisTmp = anam;
      p.tratamientoTmp = trat;
      p.archivosTmp = archivosActuales;
    }
  });
  setPacientes(sala);

  alert('Atención guardada TEMPORALMENTE. Se pasará a historial solo al ELIMINAR.');
  $('#modalAtencion').modal('hide');
});

// ========================= MODAL DE RECORDATORIOS =========================

function abrirModalRecordatorios(NHC) {
  pacienteRecordatorios = NHC;
  const sala = obtenerPacientes();
  const paciente = sala.find(p => p.NHC === NHC);

  recordatorios = paciente?.recordatoriosTmp || [];
  actualizarListaRecordatorios();
  document.getElementById('inputFechaCita').value = paciente?.fechaCitaTmp || '';

  $('#modalRecordatorios').modal({
    backdrop: 'static',
    keyboard: false
  });
}

// Actualizar lista de recordatorios en el modal (agrupado, usando helper)
function actualizarListaRecordatorios() {
  const lista = document.getElementById('listaRecordatorios');
  lista.innerHTML = '';

  if (recordatorios.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-muted">No hay recordatorios agregados.</li>';
    return;
  }

  recordatorios.forEach((valor, i) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.appendChild(document.createTextNode(obtenerTextoRecordatorioMVet(valor)));
    // Botón eliminar
    const btn = document.createElement('button');
    btn.className = 'btn btn-danger btn-sm ml-2';
    btn.textContent = '×';
    btn.onclick = () => {
      recordatorios.splice(i, 1);
      actualizarListaRecordatorios();
      // Guarda en salaEspera
      if (pacienteRecordatorios) {
        const sala = obtenerPacientes();
        sala.forEach(p => {
          if (p.NHC === pacienteRecordatorios) {
            p.recordatoriosTmp = [...recordatorios];
          }
        });
        setPacientes(sala);
      }
    };
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

// Agregar recordatorio desde select
document.getElementById('selectNuevoRecordatorio').addEventListener('change', function () {
  const valor = this.value;
  if (valor && !recordatorios.includes(valor)) {
    recordatorios.push(valor);
    actualizarListaRecordatorios();
    this.value = '';
    // Guardar inmediatamente en salaEspera
    if (pacienteRecordatorios) {
      const sala = obtenerPacientes();
      sala.forEach(p => {
        if (p.NHC === pacienteRecordatorios) {
          p.recordatoriosTmp = [...recordatorios];
        }
      });
      setPacientes(sala);
    }
  }
});

// Guardar cambios de fecha de cita médica temporalmente
document.getElementById('inputFechaCita').addEventListener('change', () => {
  if (pacienteRecordatorios) {
    const sala = obtenerPacientes();
    sala.forEach(p => {
      if (p.NHC === pacienteRecordatorios) {
        p.fechaCitaTmp = document.getElementById('inputFechaCita').value || null;
      }
    });
    setPacientes(sala);
  }
});
// ========================= CONFIRMAR Y GUARDAR ATENCIÓN DEFINITIVA =========================

function abrirConfirmacion(NHC) {
  pacienteAConfirmar = NHC;
  $('#modalConfirmarAtencion').modal('show');
}

function confirmarEnvio() {
  if (!pacienteAConfirmar) return;

  const sala = obtenerPacientes();
  const paciente = sala.find(p => p.NHC === pacienteAConfirmar);
  const hoy = new Date().toISOString().split('T')[0];
  const recordatoriosAplicados = [];

  // Procesar cada recordatorio clave seleccionado
  (paciente?.recordatoriosTmp || []).forEach(clave => {
    let dias = extraerDiasRecordatorioMVet(clave);
    let proxima = "—";
    if (dias > 0) {
      const d = new Date();
      d.setDate(d.getDate() + dias);
      proxima = d.toISOString().split('T')[0];
    }
    recordatoriosAplicados.push({
      texto: obtenerTextoRecordatorioMVet(clave),
      fechaInicio: hoy,
      fechaProxima: proxima
    });
  });

  // Si hay fecha manual, agregar como recordatorio extra
  if (paciente?.fechaCitaTmp) {
    recordatoriosAplicados.push({
      texto: "Cita médica (calendario)",
      fechaInicio: hoy,
      fechaProxima: paciente.fechaCitaTmp
    });
  }

  // 1️⃣ GUARDAR EN HISTORIAL UNIFICADO (en registrosMascotas)
  updateMascotaByNHC(pacienteAConfirmar, (mascota) => {
    if (!mascota.historialClinico.atencionMVet) mascota.historialClinico.atencionMVet = [];
    mascota.historialClinico.atencionMVet.push({
      fecha: new Date().toLocaleString(),
      anamnesis: paciente?.anamnesisTmp || '',
      tratamiento: paciente?.tratamientoTmp || '',
      archivos: paciente?.archivosTmp || [],
      recordatorios: recordatoriosAplicados
    });
    mascota.historialClinico.fechaCita = paciente?.fechaCitaTmp || null;
    return mascota;
  });

  // 2️⃣ LIMPIAR PACIENTE DE SALA DE ESPERA
  const nuevaSala = sala.filter(p => p.NHC !== pacienteAConfirmar);
  setPacientes(nuevaSala);
  cargarPacientes();

  $('#modalConfirmarAtencion').modal('hide');
  alert('Atención finalizada. Datos pasados a historial.');
  pacienteAConfirmar = null;
}

// ========================= HISTORIAL CLÍNICO (MODULAR) =========================

// Ver historial clínico de la mascota (usa el render universal)
function abrirModalHistorialClinico(NHC) {
  const { mascota } = getMascotaByNHC(NHC) || {};
  const modalBody = document.getElementById('modalHistorialClinicoBody');

  if (!mascota || !mascota.historialClinico) {
    modalBody.innerHTML = '<p class="text-muted">No hay historial clínico registrado para esta mascota.</p>';
    $('#modalHistorialClinico').modal('show');
    return;
  }

  let historial = [];
  if (mascota.historialClinico.atencionMVet)
    historial = historial.concat(mascota.historialClinico.atencionMVet.map(h => ({ ...h, origen: "Médico" })));
  if (mascota.historialClinico.peluqueria)
    historial = historial.concat(mascota.historialClinico.peluqueria.map(h => ({ ...h, origen: "Peluquería" })));
  historial = historial.filter(h => h.fecha)
    .sort((a, b) => convertirFechaISO(b.fecha) - convertirFechaISO(a.fecha));

  // Render universal
  renderHistorialClinico(historial, modalBody, function(index, historialArr) {
    const item = historialArr[index];
    if (item.archivos && item.archivos.length > 0) {
      mostrarCarruselArchivos(item.archivos, 0);
    } else {
      alert('No hay archivos para mostrar.');
    }
  });

  $('#modalHistorialClinico').modal({ backdrop: 'static' });
}

// ========================= LISTENERS INICIALES =========================

document.addEventListener('DOMContentLoaded', () => {
  cargarPacientes();
  llenarSelectRecordatoriosMVet(); // Llenar el select de recordatorios agrupados
});

// ========================= HELPERS PARA RECORDATORIOS =========================

// Obtener texto usando el agrupado de recordatoriosMVet
function obtenerTextoRecordatorioMVet(clave) {
  for (const grupo of recordatoriosMVet) {
    const found = grupo.items.find(item => item.value === clave);
    if (found) return found.text;
  }
  // Si no está en el agrupado, puede estar hardcodeado o venir del select manualmente
  return clave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Extraer días de la clave (ej: "puppy_14" → 14)
function extraerDiasRecordatorioMVet(clave) {
  const m = clave.match(/(\d+)$/);
  if (m) return parseInt(m[1]);
  if (clave === "cita_medica") return 1;
  return 0;
}

// ========================= FIN DE MVet.js =========================
