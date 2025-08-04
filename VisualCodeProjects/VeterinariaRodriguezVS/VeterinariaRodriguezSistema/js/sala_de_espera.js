function getRegistrosMascotas() {
  try {
    return JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  } catch (e) {
    console.warn("Error al leer registros de mascotas:", e);
    return [];
  }
}

function setSalaEspera(data) {
  try {
    localStorage.setItem('salaEspera', JSON.stringify(data));
  } catch (e) {
    console.warn("Error al guardar sala de espera:", e);
  }
}

function getSalaEspera() {
  try {
    return JSON.parse(localStorage.getItem('salaEspera')) || [];
  } catch (e) {
    console.warn("Error al leer sala de espera:", e);
    return [];
  }
}

function getMascotaPorNHC(nhc) {
  for (const dueño of getRegistrosMascotas()) {
    if (!Array.isArray(dueño.mascotas)) continue;
    const mascota = dueño.mascotas.find(m => m.NHC === nhc);
    if (mascota) {
      return {
        ...mascota,
        dueño: dueño.dueño,
        direccion: dueño.direccion,
        telefono: dueño.telefono,
        historialClinico: mascota.historialClinico || {}
      };
    }
  }
  return null;
}

function buscar() {
  const nDueño = (document.getElementById('buscarDueno')?.value || '').toLowerCase();
  const nMascota = (document.getElementById('buscarMascota')?.value || '').toLowerCase();
  const telefono = (document.getElementById('buscarTelefono')?.value || '').toLowerCase();
  const direccion = (document.getElementById('buscarDireccion')?.value || '').toLowerCase();
  const nhc = (document.getElementById('buscarNHC')?.value || '').toLowerCase();

  const resultados = [];

  getRegistrosMascotas().forEach(dueño => {
    (dueño.mascotas || []).forEach(mascota => {
      if (
        (!nDueño || (dueño.dueño || '').toLowerCase().includes(nDueño)) &&
        (!nMascota || (mascota.nombre || '').toLowerCase().includes(nMascota)) &&
        (!telefono || (dueño.telefono || '').toLowerCase().includes(telefono)) &&
        (!direccion || (dueño.direccion || '').toLowerCase().includes(direccion)) &&
        (!nhc || (mascota.NHC || '').toLowerCase().includes(nhc))
      ) {
        resultados.push({
          dueño: dueño.dueño || '',
          direccion: dueño.direccion || '',
          telefono: dueño.telefono || '',
          nombre: mascota.nombre || '',
          NHC: mascota.NHC || ''
        });
      }
    });
  });

  const cont = document.getElementById('tablaResultadosBusqueda')?.querySelector('tbody');
  if (!cont) return;

  cont.innerHTML = '';

  if (resultados.length === 0) {
    cont.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron coincidencias.</td></tr>';
    return;
  }

  resultados.forEach(r => {
    const escape = str => (str || '').replace(/'/g, "\\'");
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.dueño}</td>
      <td>${r.nombre}</td>
      <td>${r.direccion}</td>
      <td>${r.telefono}</td>
      <td>${r.NHC}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="abrirModalObservacion(
          '${escape(r.nombre)}',
          '${escape(r.dueño)}',
          '${escape(r.direccion)}',
          '${escape(r.telefono)}',
          '${escape(r.NHC)}'
        )">+</button>
      </td>
    `;
    cont.appendChild(tr);
  });

  $('#resultadoBusqueda').modal('show');
}

function abrirModalObservacion(nombre, duenio, direccion, telefono, nhc, observacion = "") {
  document.getElementById("obsNombreMascota").value = nombre;
  document.getElementById("obsNombreDueno").value = duenio;
  document.getElementById("obsDireccion").value = direccion;
  document.getElementById("obsTelefono").value = telefono;
  document.getElementById("obsNHC").value = nhc;
  document.getElementById("campoObservacion").value = observacion;
  $('#modalObservacion').modal('show');
}

function editarObservacion(nhc, textoActual = "") {
  const mascota = getMascotaPorNHC(nhc);
  if (!mascota) return alert("No se encontró la mascota.");

  document.getElementById("obsNombreMascota").value = mascota.nombre || "";
  document.getElementById("obsNombreDueno").value = mascota.dueño || "";
  document.getElementById("obsDireccion").value = mascota.direccion || "";
  document.getElementById("obsTelefono").value = mascota.telefono || "";
  document.getElementById("obsNHC").value = nhc;
  document.getElementById("campoObservacion").value = textoActual;

  $('#modalObservacion').modal('show');
}

document.getElementById("formObservacion").addEventListener("submit", function (e) {
  e.preventDefault();

  const nhc = document.getElementById("obsNHC").value;
  const observacion = document.getElementById("campoObservacion").value.trim();
  if (!nhc) return;

  const mascota = getMascotaPorNHC(nhc);
  if (!mascota) return alert("No se encontró la mascota.");

  let sala = getSalaEspera();
  const index = sala.findIndex(m => m.NHC === nhc);

  if (index !== -1) {
    sala[index].observacion = observacion;
  } else {
    sala.push({
      ...mascota,
      NHC: nhc,
      observacion,
      estado: "En espera"
    });
  }

  setSalaEspera(sala);
  $('#modalObservacion').modal('hide');
  $('#resultadoBusqueda').modal('hide');
  renderizarSala();
});

function renderizarSala() {
  const tabla = document.getElementById("tablaSalaEspera")?.querySelector("tbody");
  if (!tabla) return;

  tabla.innerHTML = "";
  const sala = getSalaEspera();

  sala.forEach(item => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-nhc", item.NHC);

    tr.innerHTML = `
      <td>${item.dueño || ''}</td>
      <td>${item.nombre || ''}</td>
      <td>${item.direccion || ''}</td>
      <td>${item.telefono || ''}</td>
      <td>${item.NHC || ''}</td>
      <td>
        <button class="btn btn-outline-secondary btn-sm" onclick="editarObservacion('${item.NHC}', '${(item.observacion || '').replace(/'/g, "\\'")}')">
          👁️ Editar
        </button>
      </td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="marcarAtendido(this)">En curso</button>
      </td>
      <td>
        <button class="btn btn-info btn-sm" onclick="verHistorial('${item.NHC}')">HC</button>
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="eliminarPaciente(this)">X</button>
      </td>
    `;
    tabla.appendChild(tr);
  });
}

function marcarAtendido(btn) {
  if (!btn) return;
  if (confirm("¿Desea marcar como atendido?")) {
    btn.textContent = "Finalizado";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-secondary");
  }
}

function eliminarPaciente(btn) {
  const fila = btn.closest("tr");
  const nhc = fila?.getAttribute("data-nhc");
  if (!nhc) return;

  if (!confirm("¿Estás seguro de que deseas eliminar a esta mascota de la sala de espera?")) return;

  let sala = getSalaEspera();
  sala = sala.filter(m => m.NHC !== nhc);
  setSalaEspera(sala);
  renderizarSala();
}


function inicializarRecordatorios() {
  window.textosRecordatoriosMVet = {};
  window.textosRecordatoriosPelu = {};

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


function verHistorial(nhc) {
  const mascota = getMascotaPorNHC(nhc);
  if (!mascota) return alert("No se encontró el historial clínico.");

  const historialMVet = (mascota.historialClinico?.atencionMVet || []).map(h => ({ ...h, _tipo: 'mvet' }));
  const historialPelu = (mascota.historialClinico?.peluqueria || []).map(h => ({ ...h, _tipo: 'peluqueria' }));

  const historial = [...historialMVet, ...historialPelu]
    .filter(h => h.fecha)
    .sort((a, b) => {
      const parse = str => {
        const fecha = Date.parse(str.replace(/\s[a|p]\.m\./, ""));
        return isNaN(fecha) ? 0 : fecha;
      };
      return parse(b.fecha) - parse(a.fecha);
    });

  try {
    localStorage.setItem("_historialCombinado_" + nhc, JSON.stringify(historial));
  } catch (e) {
    console.warn("No se pudo guardar historial combinado", e);
  }

  if (typeof renderHistorialClinico === "function") {
    inicializarRecordatorios?.();
    renderHistorialClinico(historial, document.getElementById("previewArchivosHistorial"));
    $("#historialModal").modal("show");
  } else {
    alert("No se pudo cargar el historial clínico.");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  renderizarSala();
  const btnBuscar = document.getElementById("btnBuscar");
  if (btnBuscar) btnBuscar.addEventListener("click", buscar);
});

window.addEventListener("storage", e => {
  if (e.key === "salaEspera") renderizarSala();
});
