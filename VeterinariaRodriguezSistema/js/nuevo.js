// === Funciones de LocalStorage ===

function getRegistrosMascotas() {
  const registros = JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
  console.log('Registros en localStorage:', registros);
  return registros;
}

function setRegistrosMascotas(data) {
  console.log('Guardando en localStorage:', data);
  localStorage.setItem('registrosMascotas', JSON.stringify(data));
}

function getProximoNHC() {
  let num = parseInt(localStorage.getItem('proximoNHC') || '1');
  console.log('NHC actual:', num);
  return String(num).padStart(5, '0');
}

function aumentarNHC() {
  let num = parseInt(localStorage.getItem('proximoNHC') || '1');
  num++;
  console.log('Nuevo NHC:', num);
  localStorage.setItem('proximoNHC', num.toString());
}

// === Buscar y Renderizar Resultados ===

function buscar() {
  const nDueño = document.getElementById('buscarDueno').value.toLowerCase();
  const nMascota = document.getElementById('buscarMascota').value.toLowerCase();
  const telefono = document.getElementById('buscarTelefono').value.toLowerCase();
  const direccion = document.getElementById('buscarDireccion').value.toLowerCase();
  const nhc = document.getElementById('buscarNHC').value.toLowerCase();

  let sala = getRegistrosMascotas();

  const resultados = sala.filter(d => {
    const nombreEnMascotas = d.mascotas &&
      d.mascotas.some(m => m.mascota.toLowerCase().includes(nMascota));
    return (nDueño === '' || d.dueño.toLowerCase().includes(nDueño)) &&
      (nMascota === '' || nombreEnMascotas) &&
      (telefono === '' || (d.telefono || '').toLowerCase().includes(telefono)) &&
      (direccion === '' || (d.direccion || '').toLowerCase().includes(direccion)) &&
      (nhc === '' || d.codAlt.toLowerCase().includes(nhc));
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
          <table class="table-mascotas">
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
              </tr>
            </thead>
            <tbody>
              ${dueño.mascotas.length > 0 ? dueño.mascotas.map(m => `
                <tr>
                  <td>${m.mascota}</td>
                  <td>${m.raza || 'No disponible'}</td>
                  <td>${m.peso || 'No disponible'} kg</td>
                  <td>${m.especie || 'No disponible'}</td>
                  <td>${m.esterilizada || 'No disponible'}</td>
                  <td>${m.sexo || 'No disponible'}</td>
                  <td>${m.fechaNac || 'No disponible'}</td>
                  <td>${m.codAlt || 'No disponible'}</td>
                </tr>
              `).join('') : `<tr><td colspan="8">No tiene mascotas registradas.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
}

// === Modal: Registrar nuevo dueño y mascota ===

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

  let sala = getRegistrosMascotas();
  const dueñoExistente = sala.find(p =>
    p.dueño.toLowerCase() === nombreDueño.toLowerCase() &&
    p.telefono === telefono
  );

  if (dueñoExistente) {
    alert('El dueño ya está registrado. Use "Agregar más mascotas".');
    return;
  }

  const nhc = getProximoNHC();
  aumentarNHC();

 // Al agregar un nuevo dueño y una mascota
const nuevoRegistro = {
  dueño: nombreDueño,
  dueñoId: 'dueno-' + btoa(nombreDueño + telefono).replace(/=/g, ''),
  dni,
  edad,
  direccion,
  telefono,
  correo,
  codAlt: nhc,  // NHC como identificador único
  mascota: nombreMascota,
  raza,
  peso,
  especie,
  esterilizada,
  sexo,
  fechaNac,
  mascotas: [{
    mascota: nombreMascota,
    raza,
    peso,
    especie,
    esterilizada,
    sexo,
    fechaNac,
    codAlt: nhc, // NHC como identificador único
    historialClinico: {  // Inicialización del historial clínico vacío
      peluqueria: [],  // Lista de baños y servicios
      atencionMVet: [], // Lista de atenciones médicas
      recordatorios: [], // Lista de recordatorios
      fotos: [],  // Lista de fotos
      videos: [], // Lista de videos
      anotaciones: [] // Lista de anotaciones médicas
    }
  }]
};


  sala.push(nuevoRegistro);
  setRegistrosMascotas(sala);
  alert('Nuevo dueño y mascota registrados.');
  $('#modalNuevo').modal('hide');
  buscar();
});





// === Modal: Agregar mascota a dueño existente ===

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

  let sala = getRegistrosMascotas();
  const dueno = sala.find(p => p.dueñoId === dueñoId);
  if (!dueno) {
    alert('Dueño no encontrado.');
    return;
  }

  if (!dueno.mascotas) dueno.mascotas = [];

  const nombreExiste = dueno.mascotas.some(
    m => m.mascota.toLowerCase() === nombre.toLowerCase()
  );
  if (nombreExiste) {
    alert('Ya existe una mascota con ese nombre para este dueño.');
    return;
  }

  const nhc = getProximoNHC();
  aumentarNHC();
  
dueno.mascotas.push({
  mascota: nombre,
  raza,
  peso,
  especie,
  esterilizada,
  sexo,
  fechaNac,
   codAlt: nhc, // NHC como identificador único
  historialClinico: {  // Inicialización del historial clínico vacío
    peluqueria: [],  // Lista de baños y servicios
    atencionMVet: [], // Lista de atenciones médicas
    recordatorios: [], // Lista de recordatorios
    fotos: [],  // Lista de fotos
    videos: [], // Lista de videos
    anotaciones: [] // Lista de anotaciones médicas 
    }
})

  setRegistrosMascotas(sala);
  alert('Mascota agregada correctamente.');
  $('#modalAgregarMascota').modal('hide');
  buscar();
});

