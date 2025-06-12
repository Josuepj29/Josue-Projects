// Función para obtener los registros almacenados en localStorage
function getRegistrosMascotas() {
 try {
    const registros = JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
    return registros;
  } catch (e) {
    console.error('Error al leer:', e);
    return [];
  }
}

// Función para guardar registros en localStorage

function setRegistros(data) {
  try {
    localStorage.setItem('registrosMascotas', JSON.stringify(data));
  } catch (e) {
    console.error('Error al guardar:', e);
  }
}

// Obtener el próximo NHC
function getProximoNHC() {
  let num = parseInt(localStorage.getItem('proximoNHC') || '1');
  console.log('NHC actual:', num); // Verificando el NHC
  return String(num).padStart(5, '0'); // Aseguramos que siempre sea de 5 dígitos
}

// Incrementar el NHC para el siguiente registro
function aumentarNHC() {
  let num = parseInt(localStorage.getItem('proximoNHC') || '1');
  num++;
  console.log('Nuevo NHC:', num); // Verificando el incremento del NHC
  localStorage.setItem('proximoNHC', num.toString()); // Actualizamos el NHC en localStorage
}

// Función para mostrar los resultados filtrados por búsqueda
function buscar() {
  const nDueño = document.getElementById('buscarDueno').value.toLowerCase();
  const nMascota = document.getElementById('buscarMascota').value.toLowerCase();
  const telefono = document.getElementById('buscarTelefono').value.toLowerCase();
  const direccion = document.getElementById('buscarDireccion').value.toLowerCase();
  const nhc = document.getElementById('buscarNHC').value.toLowerCase();

  let sala = getRegistrosMascotas(); // Obtener los datos de localStorage

  console.log('Datos a filtrar:', {nDueño, nMascota, telefono, direccion, nhc}); // Verificando los valores a filtrar

  // Filtrar los resultados
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
  cont.innerHTML = ''; // Limpiar resultados anteriores

  console.log('Resultados de la búsqueda:', resultados); // Verificando los resultados filtrados

  // Si no hay resultados, mostrar mensaje
  if (resultados.length === 0) {
    cont.innerHTML = '<p>No se encontraron coincidencias.</p>';
    return;
  }

  // Mostrar los resultados filtrados
  resultados.forEach(dueño => {
    // Asegurarse de que 'mascotas' esté definido como un arreglo vacío si no existe
    if (!dueño.mascotas) {
      dueño.mascotas = []; // Inicializar como un arreglo vacío si no está presente
    }

    cont.innerHTML += `
      <div class="card">
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
              ${dueño.mascotas.length > 0 ? dueño.mascotas.map(mascota => 
                `<tr>
                  <td>${mascota.mascota}</td>
                  <td>${mascota.raza || 'No disponible'}</td>
                  <td>${mascota.peso || 'No disponible'} kg</td>
                  <td>${mascota.especie || 'No disponible'}</td>
                  <td>${mascota.esterilizada || 'No disponible'}</td>
                  <td>${mascota.sexo || 'No disponible'}</td>
                  <td>${mascota.fechaNac || 'No disponible'}</td>
                  <td>${mascota.codAlt || 'No disponible'}</td>
                </tr>`
              ).join('') : `<tr><td colspan="8">No tiene mascotas registradas.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
}

// Abrir modal para agregar mascota al dueño existente
function abrirModalAgregarMascota(dueñoId) {
  $('#modalAgregarMascota').modal('show');
  document.getElementById('dueñoId').value = dueñoId;
  document.getElementById('formAgregarMascota').reset();
}

// Guardar nueva mascota para dueño existente
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

  // Buscar dueño por dueñoId
const dueno = sala.find(p => p.dueñoId === dueñoId);
if (!dueno) {
  alert('Dueño no encontrado.');
  return;
}
const nombreExiste = dueno.mascotas.some(
    m => m.mascota.toLowerCase() === nombre.toLowerCase());
if (nombreExiste) {
  alert('Ya existe una mascota con ese nombre para este dueño.');
  return;
}

  // Verificar que no exista mascota con mismo nombre para este dueño
  if (dueñoItems.some(p => p.mascota.toLowerCase() === nombre.toLowerCase())) {
    alert('Ya existe una mascota con ese nombre para este dueño.');
    return;
  }

  const nhc = getProximoNHC();
  aumentarNHC();

  // Crear nuevo objeto para la mascota nueva con mismo dueño
  const nuevoRegistro = {
    dueño: dueñoItems[0].dueño,
    dueñoId,
    direccion: dueñoItems[0].direccion,
    telefono: dueñoItems[0].telefono,
    codAlt: nhc,
    mascota: nombre,
    raza,
    peso,
    especie,
    esterilizada,
    sexo,
    fechaNac
  };

  // Añadir la mascota al dueño en la salaEspera
  dueñoItems[0].mascotas.push(nuevoRegistro); // Añadir mascota a las mascotas del dueño
  setRegistrosMascotas(sala);

  alert('Mascota agregada correctamente.');
  $('#modalAgregarMascota').modal('hide');
  buscar(); // Actualizar los resultados después de agregar la mascota
});

// Función para abrir el modal de nuevo dueño + mascota
function abrirModalNuevo() {
  $('#modalNuevo').modal('show');
  document.getElementById('formNuevo').reset();
}

// Función para guardar un nuevo dueño + mascota
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

  let sala = getRegistrosMascotas(); // Obtener los registros actuales de localStorage

  // Verificar si el dueño ya existe (por nombre + teléfono)
  let dueñoExistente = sala.find(p =>
    p.dueño.toLowerCase() === nombreDueño.toLowerCase() &&
    p.telefono === telefono
  );

  if (dueñoExistente) {
    alert('El dueño ya está registrado. Por favor use la opción para agregar mascota.');
    return;
  }

  const nhc = getProximoNHC(); // Obtener el próximo NHC
  aumentarNHC(); // Incrementar el NHC para el siguiente registro

  // Crear un nuevo objeto para el dueño y la mascota
  const nuevoRegistro = {
    dueño: nombreDueño,
    dueñoId: 'dueno-' + btoa(nombreDueño + telefono).replace(/=/g, ''),
    dni,
    edad,
    direccion,
    telefono,
    correo,
    codAlt: nhc,
    mascota: nombreMascota, // Nombre de la mascota
    raza,
    peso,
    especie,
    esterilizada,
    sexo,
    fechaNac,
    mascotas: [{  // Asegurarnos de inicializar la propiedad "mascotas" con el primer registro
      mascota: nombreMascota,
      raza,
      peso,
      especie,
      esterilizada,
      sexo,
      fechaNac,
      codAlt: nhc
    }]
  };

  // Añadir el nuevo dueño y su primera mascota al array
  sala.push(nuevoRegistro);
  setRegistrosMascotas(sala); // Guardar los registros actualizados en localStorage

  alert('Nuevo dueño y mascota registrados correctamente.');
  $('#modalNuevo').modal('hide');
  buscar(); // Actualizar los resultados después de agregar el nuevo dueño y mascota
});
