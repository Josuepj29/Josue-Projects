function getRegistrosMascotas() {
  return JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
}
function setRegistrosMascotas(data) {
  localStorage.setItem('registrosMascotas', JSON.stringify(data));
}
function getSalaEspera() {
  return JSON.parse(localStorage.getItem('salaEspera') || '[]');
}
function setSalaEspera(data) {
  localStorage.setItem('salaEspera', JSON.stringify(data));
}
function getMascotaPorNHC(nhc) {
  for (const dueño of getRegistrosMascotas()) {
    if (!dueño.mascotas) continue;
    const mascota = dueño.mascotas.find(m => m.NHC === nhc);
    if (mascota) return { ...mascota, dueño: dueño.dueño, direccion: dueño.direccion, telefono: dueño.telefono };
  }
  return null;
}

function buscar() {
  const nDueño = document.getElementById('buscarDueno').value.toLowerCase();
  const nMascota = document.getElementById('buscarMascota').value.toLowerCase();
  const telefono = document.getElementById('buscarTelefono').value.toLowerCase();
  const direccion = document.getElementById('buscarDireccion').value.toLowerCase();
  const nhc = document.getElementById('buscarNHC').value.toLowerCase();

  let resultados = [];
  getRegistrosMascotas().forEach(dueño => {
    (dueño.mascotas || []).forEach(mascota => {
      if (
        (nDueño === '' || dueño.dueño.toLowerCase().includes(nDueño)) &&
        (nMascota === '' || (mascota.nombre || '').toLowerCase().includes(nMascota)) &&
        (telefono === '' || (dueño.telefono || '').toLowerCase().includes(telefono)) &&
        (direccion === '' || (dueño.direccion || '').toLowerCase().includes(direccion)) &&
        (nhc === '' || (mascota.NHC || '').toLowerCase().includes(nhc))
      ) {
        resultados.push({
          dueño: dueño.dueño,
          direccion: dueño.direccion,
          telefono: dueño.telefono,
          nombre: mascota.nombre,
          NHC: mascota.NHC
        });
      }
    });
  });
  const cont = document.getElementById('tablaResultadosBusqueda').getElementsByTagName('tbody')[0];
  cont.innerHTML = '';

  if (resultados.length === 0) {
    cont.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron coincidencias.</td></tr>';
    return;
  }

  resultados.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.dueño}</td>
      <td>${r.nombre}</td>
      <td>${r.direccion}</td>
      <td>${r.telefono}</td>
      <td>${r.NHC}</td>
      <td>
        <button class="btn btn-success" onclick="abrirModalObservacion(
          '${r.nombre.replace(/'/g, "\\'")}',
          '${r.dueño.replace(/'/g, "\\'")}',
          '${r.NHC}',
          '${r.direccion.replace(/'/g, "\\'")}',
          '${r.telefono.replace(/'/g, "\\'")}'
        )">+</button>
      </td>
    `;
    cont.appendChild(tr);
  });

  $('#resultadoBusqueda').modal('show');
}

function abrirModalObservacion(nombreMascota, nombreDueno, NHC, direccion, telefono) {
  document.getElementById('obsNombreMascota').value = nombreMascota;
  document.getElementById('obsNombreDueno').value = nombreDueno;
  document.getElementById('obsNHC').value = NHC;
  document.getElementById('obsDireccion').value = direccion;
  document.getElementById('obsTelefono').value = telefono;
  document.getElementById('campoObservacion').value = '';
  $('#modalObservacion').modal('show');
}
document.getElementById('formObservacion').addEventListener('submit', function (e) {
  e.preventDefault();
  const nombreMascota = document.getElementById('obsNombreMascota').value;
  const nombreDueno = document.getElementById('obsNombreDueno').value;
  const NHC = document.getElementById('obsNHC').value;
  const direccion = document.getElementById('obsDireccion').value;
  const telefono = document.getElementById('obsTelefono').value;
  const observacion = document.getElementById('campoObservacion').value.trim();

  let sala = getSalaEspera();

  if (sala.some(p => p.NHC === NHC)) {
    alert('Esta mascota ya está en la sala de espera.');
    $('#modalObservacion').modal('hide');
    return;
  }

  sala.push({
    dueño: nombreDueno,
    mascota: nombreMascota,
    NHC,
    direccion,
    telefono,
    observacion,
    estado: "En espera"
  });

  setSalaEspera(sala);
  renderizarSala();
  $('#modalObservacion').modal('hide');
$('#resultadoBusqueda').modal('hide');
});

function renderizarSala() {
  const tabla = document.querySelector('#tablaSalaEspera tbody');
  tabla.innerHTML = "";
  const sala = getSalaEspera();

  sala.slice().reverse().forEach((p, idx) => {
    const realIndex = sala.length - 1 - idx;
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${p.dueño}</td>
      <td>${p.mascota}</td>
      <td>${p.direccion || ''}</td>
      <td>${p.telefono || ''}</td>
      <td>${p.NHC || ''}</td>
      <td>${p.observacion || ''}</td>
      <td>${p.estado}</td>
      <td>
        ${p.estado === "En espera"
          ? `<button class="btn btn-sm btn-danger" onclick="marcarAtendido(${realIndex})">Atendido</button>`
          : `<button class="btn btn-sm btn-secondary" onclick="eliminarPaciente(${realIndex})">Eliminar</button>`
        }
      </td>
      <td>
        <button class="btn btn-sm btn-info" onclick="verHistorial('${p.NHC}')">Ver Historial</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function verHistorial(NHC) {
  const mascota = getMascotaPorNHC(NHC);
  const modalBody = document.getElementById('historialModal').querySelector('.modal-body');
  modalBody.innerHTML = `
    <div id="tablaHistorial"></div>
    <div id="previewArchivosHistorial" class="mt-3"></div>
  `;
  const tablaCont = document.getElementById('tablaHistorial');
  const previewContainer = document.getElementById('previewArchivosHistorial');

  if (!mascota || !mascota.historialClinico) {
    tablaCont.innerHTML = `<p>No hay historial clínico registrado para esta mascota.</p>`;
    $('#historialModal').modal('show');
    return;
  }

  let historial = [];
  if (mascota.historialClinico.atencionMVet)
    historial = historial.concat(mascota.historialClinico.atencionMVet.map(h => ({ ...h, origen: "Médico" })));
  if (mascota.historialClinico.peluqueria)
    historial = historial.concat(mascota.historialClinico.peluqueria.map(h => ({ ...h, origen: "Peluquería" })));
  historial = historial.filter(h => h.fecha)
  .sort((a, b) => convertirFechaISO(b.fecha) - convertirFechaISO(a.fecha))


renderHistorialClinico(historial, tablaCont, function(index, historialArr) {
  const item = historialArr[index];
  if (item.archivos && item.archivos.length > 0) {
    mostrarCarruselArchivos(item.archivos, 0); 
  } else {
    alert('No hay archivos para mostrar.');
  }
});


  $('#historialModal').modal('show');
}

function marcarAtendido(index) {
  if (!confirm("¿Estás seguro de marcar este paciente como atendido?")) return;
  let sala = getSalaEspera();
  sala.splice(index, 1); 
  setSalaEspera(sala);
  renderizarSala();
  alert("Paciente eliminado de la sala de espera.");
}

function eliminarPaciente(index) {
  if (!confirm("¿Eliminar definitivamente este paciente de la sala de espera?")) return;
  let sala = getSalaEspera();
  sala.splice(index, 1);
  setSalaEspera(sala);
  renderizarSala();
}

window.onload = renderizarSala;
document.getElementById('btnBuscar').addEventListener('click', buscar);

window.addEventListener("storage", function (e) {
  if (e.key === "salaEspera") {
    renderizarSala();
  }
});

window.mostrarImagenGrande = mostrarImagenGrande;
