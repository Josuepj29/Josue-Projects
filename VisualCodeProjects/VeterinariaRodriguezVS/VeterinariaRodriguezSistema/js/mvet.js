let pacienteAConfirmar = null;
let pacienteRecordatorios = null;
let recordatorios = [];
let archivosActuales = [];

function safeText(value, fallback = '––') {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}


//Get Texto paciente - recordatorios
function obtenerTextoRecordatorioMVet(value) {
  for (const grupo of (recordatoriosMVet || [])) {
    if (!Array.isArray(grupo.items)) continue;
    for (const item of grupo.items) {
      if (item.value === value) return item.text;
    }
  }
  return value;
}

// Pacientes 

function obtenerPacientes() {
  try {
    return JSON.parse(localStorage.getItem('salaEspera')) || [];
  } catch (e) {
    console.error("Error leyendo pacientes de salaEspera:", e);
    return [];
  }
}


function setPacientes(data) {
  try {
    localStorage.setItem('salaEspera', JSON.stringify(data));
  } catch (e) {
    console.error("Error guardando pacientes:", e);
  }
}


// Cargar paciente

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
      <td>${p.nombre || '––'}</td>
      <td>${combinarTelefonos(p.telefono, p.telefono2)}</td>
      <td>${p.direccion || '––'}</td>
      <td>${p.NHC}</td>
      <td>${p.estado || '––'}</td>
      <td>
       <div class="botonera-mvet">
          ${p.estado === "En espera" ? `
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
function mostrarObservacion(NHC) {
  const paciente = obtenerPacientes().find(p => p.NHC === NHC);
  alert(paciente?.observacion || 'No hay observaciones registradas.');
}



function abrirModalAtencion(NHC) {
  pacienteRecordatorios = NHC;
  document.getElementById('codPacienteActual').value = NHC;

  const sala = obtenerPacientes();
  const paciente = sala.find(p => p.NHC === NHC);

  document.getElementById('inputAnamnesis').value = paciente?.anamnesisTmp || '';
  document.getElementById('inputTratamiento').value = paciente?.tratamientoTmp || '';
  archivosActuales = paciente?.archivosTmp || [];
  document.getElementById('inputArchivos').value = '';
  renderPreviewArchivos(
    archivosActuales,
    document.getElementById('previewArchivos'),
    function (i) {
      archivosActuales.splice(i, 1);
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
document.getElementById('inputArchivos').addEventListener('change', function (event) {
  const archivos = Array.from(event.target.files);
  const NHC = document.getElementById('codPacienteActual').value;
  const sala = obtenerPacientes();





  archivos.forEach(archivo => {
    // Validar tamaño si es video
    if (archivo.type.startsWith('video') && archivo.size > 4 * 1024 * 1024) {
      alert('Este video es muy grande para ser guardado. Por favor, intenta con uno más liviano (menos de 4MB).');
      return;
    }
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
    const btn = document.createElement('button');
    btn.className = 'btn btn-danger btn-sm ml-2';
    btn.textContent = '×';
    btn.onclick = () => {
      recordatorios.splice(i, 1);
      actualizarListaRecordatorios();
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
document.getElementById('selectNuevoRecordatorio').addEventListener('change', function () {
  const valor = this.value;
  if (valor && !recordatorios.includes(valor)) {
    recordatorios.push(valor);
    actualizarListaRecordatorios();
    this.value = '';
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

function abrirConfirmacion(NHC) {
  pacienteAConfirmar = NHC;
  $('#modalConfirmarAtencion').modal('show');
}

function confirmarEnvio() {
  if (!pacienteAConfirmar) return;

  const sala = obtenerPacientes();
  const paciente = sala.find(p => p.NHC === pacienteAConfirmar);

  const hoy = new Date();
  const hoyStr = hoy.getFullYear() + '-' +
                 String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
                 String(hoy.getDate()).padStart(2, '0');
  const fechaAplicado = obtenerFechaHoraLocal();

  const recordatoriosAplicados = [];

  (paciente?.recordatoriosTmp || []).forEach(clave => {
    const proxima = calcularFechaProxima(hoyStr, clave);
    recordatoriosAplicados.push({
      texto: obtenerTextoRecordatorioMVet(clave),
      value: clave,
      fechaAplicado: fechaAplicado,
      fechaInicio: hoyStr,
      fechaProxima: proxima
    });
  });

  if (paciente?.fechaCitaTmp) {
    recordatoriosAplicados.push({
      texto: "Cita médica (calendario)",
      fechaInicio: hoyStr,
      fechaProxima: paciente.fechaCitaTmp
    });
  }

  updateMascotaByNHC(pacienteAConfirmar, (mascota) => {
  if (!mascota.historialClinico.atencionMVet) mascota.historialClinico.atencionMVet = [];
  mascota.historialClinico.atencionMVet.push({
     fecha: fechaAplicado,
    anamnesis: paciente?.anamnesisTmp || '',
    tratamiento: paciente?.tratamientoTmp || '',
    archivos: paciente?.archivosTmp || [],
    recordatorios: recordatoriosAplicados
  });
  mascota.historialClinico.fechaCita = paciente?.fechaCitaTmp || null;
  return mascota;
});

  const nuevaSala = sala.filter(p => p.NHC !== pacienteAConfirmar);
  setPacientes(nuevaSala);
  localStorage.setItem('salaEspera', JSON.stringify(nuevaSala));
  window.dispatchEvent(new StorageEvent("storage", { key: "salaEspera" }));

  cargarPacientes();

  $('#modalConfirmarAtencion').modal('hide');
  alert('Atención finalizada. Datos pasados a historial.');
  pacienteAConfirmar = null;
}




function abrirModalHistorialClinico(NHC) {
  const { mascota } = getMascotaByNHC(NHC) || {};
  const modalBody = document.getElementById('modalHistorialClinicoBody');

  if (!mascota || !mascota.historialClinico) {
    modalBody.innerHTML = '<p class="text-muted">No hay historial clínico registrado para esta mascota.</p>';
    $('#modalHistorialClinico').modal('show');
    return;
  }

  const historialMVet = (mascota.historialClinico.atencionMVet || []).map(h => ({ ...h, _tipo: 'mvet' }));
  const historialPelu = (mascota.historialClinico.peluqueria || []).map(h => ({ ...h, _tipo: 'peluqueria' }));

  const historial = [...historialMVet, ...historialPelu]
  .filter(h => h.fecha)
  .sort((a, b) => parsearFechaSeguro(b.fecha) - parsearFechaSeguro(a.fecha));

  try {
    localStorage.setItem("_historialCombinado_" + NHC, JSON.stringify(historial));
  } catch (e) {
    console.warn("No se pudo guardar historial combinado", e);
  }

  if (typeof renderHistorialClinico === "function") {
    if (typeof inicializarRecordatorios === "function") inicializarRecordatorios();
    renderHistorialClinico(historial, modalBody);
    $('#modalHistorialClinico').modal({ backdrop: 'static' });
  } else {
    alert("No se pudo cargar el historial clínico.");
  }
}


document.addEventListener('DOMContentLoaded', () => {
  cargarPacientes();
  llenarSelectRecordatoriosMVet();
});
function obtenerTextoRecordatorioMVet(clave) {
  for (const grupo of recordatoriosMVet) {
    const found = grupo.items.find(item => item.value === clave);
    if (found) return found.text;
  }
  return clave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}


function extraerDiasRecordatorioMVet(clave) {
  const partes = clave.split('_');
  const valor = partes.find(p => /^\d+$/.test(p));
  return valor ? parseInt(valor) : (clave === "cita_medica" ? 1 : 0);
}


function extraerDiasRecordatorioMVet(clave) {
  const m = clave.match(/(\d+)$/);
  if (m) return parseInt(m[1]);
  if (clave === "cita_medica") return 1;
  return 0;
}

