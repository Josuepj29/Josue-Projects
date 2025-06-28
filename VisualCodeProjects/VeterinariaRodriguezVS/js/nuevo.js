// === UTILIDADES PARA NHC Y REGISTROS ===

function getProximoNHC() {
  let num = parseInt(localStorage.getItem('proximoNHC') || '1');
  return String(num).padStart(5, '0');
}
function aumentarNHC() {
  let num = parseInt(localStorage.getItem('proximoNHC') || '1');
  num++;
  localStorage.setItem('proximoNHC', num.toString());
}

// === BUSCAR Y RENDERIZAR DUEÑOS Y MASCOTAS ===

function buscar() {
  const nDueño = document.getElementById('buscarDueno').value.toLowerCase();
  const nMascota = document.getElementById('buscarMascota').value.toLowerCase();
  const telefono = document.getElementById('buscarTelefono').value.toLowerCase();
  const direccion = document.getElementById('buscarDireccion').value.toLowerCase();
  const nhc = document.getElementById('buscarNHC').value.toLowerCase();

  let registros = getRegistrosMascotas();

  const resultados = registros.filter(d => {
    const nombreEnMascotas = d.mascotas && d.mascotas.some(m => m.nombre.toLowerCase().includes(nMascota));
    return (nDueño === '' || d.dueño.toLowerCase().includes(nDueño)) &&
      (nMascota === '' || nombreEnMascotas) &&
      (telefono === '' || (d.telefono || '').toLowerCase().includes(telefono)) &&
      (direccion === '' || (d.direccion || '').toLowerCase().includes(direccion)) &&
      (nhc === '' || d.mascotas.some(m => m.NHC && m.NHC.toLowerCase().includes(nhc)));
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
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div><strong>Dueño:</strong> ${dueño.dueño}</div>
          <button class="btn btn-sm btn-info" onclick="abrirModalAgregarMascota('${dueño.dueñoId}')">Agregar más mascotas</button>
        </div>
        <div class="card-body">
          <div class="row d-flex justify-content-between">
            <div class="col-md-5">
              <p><strong>Teléfono:</strong> ${dueño.telefono || 'No disponible'}</p>
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
              ${dueño.mascotas.length > 0 ? dueño.mascotas.map(m => `
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
// === MODAL: REGISTRAR NUEVO DUEÑO Y MASCOTA ===

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

  let registros = getRegistrosMascotas();
  const dueñoExistente = registros.find(p =>
    p.dueño.toLowerCase() === nombreDueño.toLowerCase() &&
    p.telefono === telefono
  );
  if (dueñoExistente) {
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
    dueñoId: 'dueno-' + btoa(nombreDueño + telefono).replace(/=/g, ''),
    dni,
    edad,
    direccion,
    telefono,
    correo,
    mascotas: [nuevaMascota]
  };

  registros.push(nuevoRegistro);
  setRegistrosMascotas(registros);

  alert('Nuevo dueño y mascota registrados.');
  $('#modalNuevo').modal('hide');
  buscar();
});

// === MODAL: AGREGAR MASCOTA A DUEÑO EXISTENTE ===

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

  let registros = getRegistrosMascotas();
  const dueño = registros.find(p => p.dueñoId === dueñoId);
  if (!dueño) {
    alert('Dueño no encontrado.');
    return;
  }
  if (!dueño.mascotas) dueño.mascotas = [];
  const nombreExiste = dueño.mascotas.some(
    m => m.nombre.toLowerCase() === nombre.toLowerCase()
  );
  if (nombreExiste) {
    alert('Ya existe una mascota con ese nombre para este dueño.');
    return;
  }
  const nhc = getProximoNHC();
  aumentarNHC();

  const nuevaMascota = {
    nombre,
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

  dueño.mascotas.push(nuevaMascota);
  setRegistrosMascotas(registros);

  alert('Mascota agregada correctamente.');
  $('#modalAgregarMascota').modal('hide');
  buscar();
});

// === MODAL: EDITAR MASCOTA ===

function abrirModalEditarMascota(dueñoId, NHC) {
  const registros = getRegistrosMascotas();
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

  let registros = getRegistrosMascotas();
  const dueño = registros.find(p => p.dueñoId === dueñoId);
  if (!dueño) return alert('Dueño no encontrado.');

  const idxMascota = dueño.mascotas.findIndex(m => m.NHC === NHC);
  if (idxMascota === -1) return alert('Mascota no encontrada.');

  dueño.mascotas[idxMascota] = {
    ...dueño.mascotas[idxMascota],
    nombre,
    raza,
    peso,
    especie,
    esterilizada,
    sexo,
    fechaNac
    // historialClinico SE CONSERVA tal como está
  };

  setRegistrosMascotas(registros);

  alert('Mascota actualizada correctamente.');
  $('#modalEditarMascota').modal('hide');
  buscar();
});

// === UTILIDADES VARIAS (pueden ser opcionales según tu flujo) ===

// Mostrar/ocultar elemento con clase .visible
function toggleVisibility(elementId, show) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (show) el.classList.add('visible');
  else el.classList.remove('visible');
}

// Guardar y cargar observaciones en localStorage para paciente
function guardarObservacion(NHC, texto) {
  localStorage.setItem(`observacion_${NHC}`, texto);
}

function cargarObservacion(NHC) {
  return localStorage.getItem(`observacion_${NHC}`) || '';
}

// Función para mostrar alertas con confirmación simple
function confirmarAccion(mensaje, callback) {
  if (confirm(mensaje)) {
    callback();
  }
}

// Limpiar todo (para pruebas, si lo necesitas)
function limpiarTodo() {
  if (confirm('¿Estás seguro que deseas borrar todos los registros?')) {
    localStorage.removeItem('registrosMascotas');
    localStorage.removeItem('proximoNHC');
    buscar();
  }
}
