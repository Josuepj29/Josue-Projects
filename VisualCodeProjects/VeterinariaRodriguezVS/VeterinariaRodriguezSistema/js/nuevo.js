function getProximoNHC() {
  try {
    let num = parseInt(localStorage.getItem('proximoNHC')) || 1;
    return String(num).padStart(5, '0');
  } catch (e) {
    console.error("Error leyendo proximoNHC:", e);
    return '00001';
  }
}

function aumentarNHC() {
  try {
    let num = parseInt(localStorage.getItem('proximoNHC')) || 1;
    localStorage.setItem('proximoNHC', (num + 1).toString());
  } catch (e) {
    console.error("Error incrementando NHC:", e);
  }
}



function safeInputValue(id) {
  const el = document.getElementById(id);
  return el && typeof el.value === 'string' ? el.value.trim().toLowerCase() : '';
}


function buscar() {
  const nDueño = safeInputValue('buscarDueno');
  const nMascota = safeInputValue('buscarMascota');
  const telefono = safeInputValue('buscarTelefono');
  const telefono2 = safeInputValue('buscarTelefono2');
  const direccion = safeInputValue('buscarDireccion');
  const nhc = safeInputValue('buscarNHC');

  let registros = getRegistrosMascotas();



  const resultados = registros.filter(d => {
    return (nDueño === '' || (d.dueño || '').toLowerCase().includes(nDueño)) &&
       (nMascota === '' || (d.mascotas || []).some(m => (m.nombre || '').toLowerCase().includes(nMascota))) &&
       (telefono === '' || (d.telefono || '').toLowerCase().includes(telefono) || (d.telefono2 || '').toLowerCase().includes(telefono)) &&
       (direccion === '' || (d.direccion || '').toLowerCase().includes(direccion)) &&
       (nhc === '' || (d.mascotas || []).some(m => (m.NHC || '').toLowerCase().includes(nhc)));
  });

  const cont = document.getElementById('resultadosBusqueda');
  cont.innerHTML = '';

  if (resultados.length === 0) {
    cont.innerHTML = '<p>No se encontraron coincidencias.</p>';
    return;
  }

  resultados.forEach(dueño => {
    if (!dueño.mascotas) dueño.mascotas = [];
    cont.innerHTML += `
      <div class="card-header d-flex justify-content-between align-items-center">
  <div><strong>Dueño:</strong> ${dueño.dueño}</div>
  <div class="d-flex">
    <button class="btn btn-sm btn-info mr-2" onclick="abrirModalAgregarMascota('${dueño.dueñoId}')">Agregar más mascotas</button>
    <button class="btn btn-sm btn-info" onclick="abrirModalEditarDueno('${dueño.dueñoId}')">Editar dueño</button>
  </div>
</div>


        <div class="card-body">
          <div class="row d-flex justify-content-between">
            <div class="col-md-5">
              <p><strong>Teléfono:</strong> ${dueño.telefono || 'No disponible'}</p>
              <p><strong>Teléfono 2:</strong> ${dueño.telefono2 || 'No disponible'}</p>
              <p><strong>Dirección:</strong> ${dueño.direccion || 'No disponible'}</p>
              <p><strong>DNI:</strong> ${dueño.dni || 'No disponible'}</p>
            </div>
            <div class="col-md-5">
              <p><strong>Edad:</strong> ${dueño.edad || 'No disponible'}</p>
              <p><strong>Correo:</strong> ${dueño.correo || 'No disponible'}</p>
            </div>
          </div>
          <table class="table-mascotas table table-bordered mt-3">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Raza</th>
                <th>Peso</th>
                <th>Especie</th>
                <th>Esterilizada</th>
                <th>Sexo</th>
                <th>Fecha Nac.</th>
                <th>NHC</th>
                <th>Opción</th>
              </tr>
            </thead>
            <tbody>
              ${dueño.mascotas.length > 0 
                ? dueño.mascotas.map(m => `
                <tr>
                  <td>${m.nombre || 'No disponible'}</td>
                  <td>${m.raza || 'No disponible'}</td>
                  <td>${m.peso || 'No disponible'} kg</td>
                  <td>${m.especie || 'No disponible'}</td>
                  <td>${m.esterilizada || 'No disponible'}</td>
                  <td>${m.sexo || 'No disponible'}</td>
                  <td>${m.fechaNac || 'No disponible'}</td>
                  <td>${m.NHC || 'No disponible'}</td>
                  <td>
                    <button class="btn btn-sm btn-warning"
                      data-duenoid="${encodeURIComponent(dueño.dueñoId)}"
                      data-nhc="${encodeURIComponent(m.NHC)}"
                      onclick="abrirModalEditarMascota(decodeURIComponent(this.dataset.duenoid), decodeURIComponent(this.dataset.nhc))">
                      Editar
                    </button>
                  </td>
                </tr>
              `).join('') : `<tr><td colspan="9">No tiene mascotas registradas.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
}


function abrirModalNuevo() {
  document.getElementById('formNuevo').reset();
  $('#modalNuevo').modal('show');
}

document.getElementById('formNuevo').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombreDueño = document.getElementById('nuevoNombreDueño').value.trim();
  const dni = document.getElementById('nuevoDni').value.trim();
  const edad = document.getElementById('nuevoEdad').value.trim();
  const direccion = document.getElementById('nuevoDireccion').value.trim();
  const telefono = document.getElementById('nuevoTelefono').value.trim();
  const telefono2 = document.getElementById('nuevoTelefono2').value.trim();
  const correo = document.getElementById('nuevoCorreo').value.trim();

  const nombreMascota = document.getElementById('nuevoNombreMascota').value.trim();
  const raza = document.getElementById('nuevoRaza').value.trim();
  const peso = document.getElementById('nuevoPeso').value.trim();
  const especie = document.getElementById('nuevoEspecie').value;
  const esterilizada = document.getElementById('nuevoEsterilizada').value;
  const sexo = document.getElementById('nuevoSexo').value;
  const fechaNac = document.getElementById('nuevoFechaNac').value;

  if (!nombreDueño || !nombreMascota) {
    alert('Debe completar el nombre del dueño y de la mascota.');
    return;
  }

  let registros = [];
  try {
    registros = JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  } catch (e) {
    console.error("Error leyendo registrosMascotas:", e);
  }

  const existe = registros.some(p =>
  p.dueño?.toLowerCase() === nombreDueño.toLowerCase() &&
  p.telefono === telefono &&
  p.telefono2 === telefono2
);

  if (existe) {
    alert('El dueño ya está registrado. Use "Agregar más mascotas".');
    return;
  }

  const nhc = getProximoNHC();
  aumentarNHC();

  const nuevaMascota = {
    nombre: nombreMascota,
    raza,
    peso,
    especie,
    esterilizada,
    sexo,
    fechaNac,
    NHC: nhc,
    historialClinico: {
      peluqueria: [],
      atencionMVet: [],
      recordatorios: [],
      fotos: [],
      videos: [],
      anotaciones: []
    }
  };

  const nuevoRegistro = {
    dueño: nombreDueño,
    dueñoId: 'dueno-' + btoa(unescape(encodeURIComponent(nombreDueño + telefono))).replace(/=/g, ''),
    dni,
    edad,
    direccion,
    telefono,
    telefono2,
    correo,
    mascotas: [nuevaMascota]
  };

  registros.push(nuevoRegistro);
  localStorage.setItem('registrosMascotas', JSON.stringify(registros));
  alert('Nuevo dueño y mascota registrados.');
  $('#modalNuevo').modal('hide');
  buscar();
});




function abrirModalAgregarMascota(dueñoId) {
  document.getElementById('dueñoId').value = dueñoId;
  document.getElementById('formAgregarMascota').reset();
  $('#modalAgregarMascota').modal('show');
}

document.getElementById('formAgregarMascota').addEventListener('submit', function (e) {
  e.preventDefault();

  const dueñoId = document.getElementById('dueñoId').value;
  const nombre = document.getElementById('inputNombreMascota').value.trim();
  const raza = document.getElementById('inputRaza').value.trim();
  const peso = document.getElementById('inputPeso').value.trim();
  const especie = document.getElementById('inputEspecie').value;
  const esterilizada = document.getElementById('inputEsterilizada').value;
  const sexo = document.getElementById('inputSexo').value;
  const fechaNac = document.getElementById('inputFechaNac').value;

  if (!nombre) {
    alert('El nombre de la mascota es obligatorio.');
    return;
  }

  let registros = [];
  try {
    registros = JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  } catch (e) {
    console.error("Error leyendo registrosMascotas:", e);
  }

  const dueño = registros.find(p => p.dueñoId === dueñoId);
  if (!dueño) return alert('Dueño no encontrado.');
  if (!Array.isArray(dueño.mascotas)) dueño.mascotas = [];

  const existe = dueño.mascotas.some(m => m.nombre?.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    alert('Ya existe una mascota con ese nombre para este dueño.');
    return;
  }

  const nhc = getProximoNHC();
  aumentarNHC();

  dueño.mascotas.push({
    nombre, raza, peso, especie, esterilizada, sexo, fechaNac, NHC: nhc,
    historialClinico: {
      peluqueria: [], atencionMVet: [], recordatorios: [], fotos: [], videos: [], anotaciones: []
    }
  });

  localStorage.setItem('registrosMascotas', JSON.stringify(registros));
  alert('Mascota agregada correctamente.');
  $('#modalAgregarMascota').modal('hide');
  buscar();
});





function abrirModalEditarMascota(dueñoId, NHC) {
  const registros = JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  const dueño = registros.find(p => p.dueñoId === dueñoId);
  if (!dueño) return alert('Dueño no encontrado.');

  const mascota = dueño.mascotas.find(m => m.NHC === NHC);
  if (!mascota) return alert('Mascota no encontrada.');

  document.getElementById('editarDuenoId').value = dueñoId;
  document.getElementById('editarNHC').value = mascota.NHC || '';
  document.getElementById('editarNombreMascota').value = mascota.nombre || '';
  document.getElementById('editarRaza').value = mascota.raza || '';
  document.getElementById('editarPeso').value = mascota.peso || '';
  document.getElementById('editarEspecie').value = mascota.especie || '';
  document.getElementById('editarEsterilizada').value = mascota.esterilizada || '';
  document.getElementById('editarSexo').value = mascota.sexo || '';
  document.getElementById('editarFechaNac').value = mascota.fechaNac || '';

  $('#modalEditarMascota').modal('show');
}

document.getElementById('formEditarMascota').addEventListener('submit', function (e) {
  e.preventDefault();

  const dueñoId = document.getElementById('editarDuenoId').value;
  const NHC = document.getElementById('editarNHC').value;
  const nombre = document.getElementById('editarNombreMascota').value.trim();
  const raza = document.getElementById('editarRaza').value.trim();
  const peso = document.getElementById('editarPeso').value.trim();
  const especie = document.getElementById('editarEspecie').value;
  const esterilizada = document.getElementById('editarEsterilizada').value;
  const sexo = document.getElementById('editarSexo').value;
  const fechaNac = document.getElementById('editarFechaNac').value;

  if (!nombre) {
    alert('El nombre de la mascota es obligatorio.');
    return;
  }

  const registros = JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  const dueño = registros.find(p => p.dueñoId === dueñoId);
  if (!dueño) return alert('Dueño no encontrado.');

  const idx = dueño.mascotas.findIndex(m => m.NHC === NHC);
  if (idx === -1) return alert('Mascota no encontrada.');

  dueño.mascotas[idx] = {
    ...dueño.mascotas[idx],
    nombre, raza, peso, especie, esterilizada, sexo, fechaNac
  };

  localStorage.setItem('registrosMascotas', JSON.stringify(registros));
  alert('Mascota actualizada correctamente.');
  $('#modalEditarMascota').modal('hide');
  buscar();
});

function abrirModalEditarDueno(dueñoId) {
  const registros = JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  const dueño = registros.find(p => p.dueñoId === dueñoId);
  if (!dueño) return alert('Dueño no encontrado.');

  document.getElementById('editarDuenoIdDueno').value = dueñoId;
  document.getElementById('editarNombreDueño').value = dueño.dueño || '';
  document.getElementById('editarDniDueño').value = dueño.dni || '';
  document.getElementById('editarEdadDueño').value = dueño.edad || '';
  document.getElementById('editarDireccionDueño').value = dueño.direccion || '';
  document.getElementById('editarTelefonoDueño').value = dueño.telefono || '';
  document.getElementById('editarTelefonoDueño2').value = dueño.telefono2 || '';
  document.getElementById('editarCorreoDueño').value = dueño.correo || '';

  $('#modalEditarDueno').modal('show');
}

document.getElementById('formEditarDueno').addEventListener('submit', function (e) {
  e.preventDefault();

  const dueñoId = document.getElementById('editarDuenoIdDueno').value;
  const registros = JSON.parse(localStorage.getItem('registrosMascotas')) || [];
  const dueño = registros.find(p => p.dueñoId === dueñoId);
  if (!dueño) return alert('Dueño no encontrado.');

  dueño.dueño = document.getElementById('editarNombreDueño').value.trim();
  dueño.dni = document.getElementById('editarDniDueño').value.trim();
  dueño.edad = document.getElementById('editarEdadDueño').value.trim();
  dueño.direccion = document.getElementById('editarDireccionDueño').value.trim();
  dueño.telefono = document.getElementById('editarTelefonoDueño').value.trim();
  dueño.telefono2 = document.getElementById('editarTelefonoDueño2').value.trim();
  dueño.correo = document.getElementById('editarCorreoDueño').value.trim();

  localStorage.setItem('registrosMascotas', JSON.stringify(registros));
  alert('Datos del dueño actualizados.');
  $('#modalEditarDueno').modal('hide');
  buscar();
});



function toggleVisibility(elementId, show) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (show) el.classList.add('visible');
  else el.classList.remove('visible');
}

function guardarObservacion(NHC, texto) {
  try {
    localStorage.setItem(`observacion_${NHC}`, texto);
  } catch (e) {
    console.error("Error guardando observación:", e);
  }
}

function cargarObservacion(NHC) {
  try {
    return localStorage.getItem(`observacion_${NHC}`) || '';
  } catch (e) {
    console.error("Error cargando observación:", e);
    return '';
  }
}

function confirmarAccion(mensaje, callback) {
  if (confirm(mensaje)) {
    callback();
  }
}

function limpiarTodo() {
  if (confirm('¿Estás seguro que deseas borrar todos los registros? Esta acción no se puede deshacer.')) {
    localStorage.removeItem('registrosMascotas');
    localStorage.removeItem('proximoNHC');
    buscar();
  }
}
