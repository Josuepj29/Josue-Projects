// Función para obtener los registros almacenados en localStorage
function getRegistrosMascotas() {
  const registros = JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
  console.log('Registros en localStorage:', registros); // Verificando los registros guardados
  return registros;
}

// Función para guardar registros en localStorage
function setRegistrosMascotas(data) {
  console.log('Guardando en localStorage:', data);  // Verificando qué datos se están guardando
  localStorage.setItem('registrosMascotas', JSON.stringify(data));
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
  const resultados = sala.filter(p => {
    // Filtrar en función de todos los criterios
    const tieneMascotas = p.mascotas.some(mascota =>
      (nMascota === '' || mascota.mascota.toLowerCase().includes(nMascota))
    );

    return (nDueño === '' || p.dueño.toLowerCase().includes(nDueño)) &&
           (telefono === '' || p.telefono.toLowerCase().includes(telefono)) &&
           (direccion === '' || p.direccion.toLowerCase().includes(direccion)) &&
           (nhc === '' || p.codAlt.toLowerCase().includes(nhc)) &&
           tieneMascotas;
  });

  // Obtener la tabla donde se mostrarán los resultados
  const cont = document.getElementById('tablaResultadosBusqueda').getElementsByTagName('tbody')[0];
  cont.innerHTML = ''; // Limpiar resultados anteriores

  console.log('Resultados de la búsqueda:', resultados); // Verificando los resultados filtrados

  // Si no hay resultados, mostrar mensaje
  if (resultados.length === 0) {
    cont.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron coincidencias.</td></tr>';
    return;
  }

  // Mostrar los resultados filtrados
  resultados.forEach(dueño => {
    // Asegurarse de que 'mascotas' esté definido como un arreglo vacío si no existe
    if (!dueño.mascotas) {
      dueño.mascotas = []; // Inicializar como un arreglo vacío si no está presente
    }

  dueño.mascotas.forEach(mascota => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dueño.dueño}</td>
        <td>${mascota.mascota}</td>
        <td>${dueño.direccion}</td>
        <td>${dueño.telefono}</td>
        <td>${mascota.codAlt}</td>  <!-- Mostrar NHC individual de cada mascota -->
        <td>
          <button class="btn btn-success" onclick="agregarSalaEspera(
            '${mascota.mascota}', 
            '${dueño.dueño}', 
            '${mascota.codAlt}',
            '${dueño.direccion}', 
            '${dueño.telefono}'
          )">+</button>
        </td>
      `;
      cont.appendChild(tr);
    });
  });

  // Mostrar el modal con los resultados
  $('#resultadoBusqueda').modal('show');
}

function agregarSalaEspera(mascota, dueño, codAlt, direccion, telefono) {
  // Verificar si el paciente ya está en la sala de espera
  let sala = JSON.parse(localStorage.getItem('salaEspera') || '[]');
  
  console.log('Sala actual:', sala);  // Verificar el contenido actual de la sala
  
  // Comprobar si el paciente ya está en la sala de espera por el codAlt
  if (sala.some(p => p.codAlt === codAlt)) {
    alert('Este paciente ya está en la sala de espera');
    console.log('Paciente ya en la sala:', codAlt);  // Verifica si la mascota ya existe en la sala
    return;  // No agregar si ya existe
  }

  // Pedir observación al agregar mascota (opcional)
  const observacion = prompt("Observación para el médico (opcional):") || "";

  // Crear un nuevo objeto de paciente para agregarlo a la sala
  const paciente = {
    dueño: dueño,
    mascota: mascota,
    codAlt: codAlt, 
    direccion: direccion,
    telefono: telefono,
    observacion: observacion,
    estado: "En espera"
  };

  // Añadir la mascota a la sala de espera
  sala.push(paciente);
  console.log('Sala actualizada:', sala);  // Verifica que la mascota se haya añadido correctamente

  // Guardar los registros actualizados en localStorage
  localStorage.setItem('salaEspera', JSON.stringify(sala));

  // Renderizar la tabla nuevamente con la mascota agregada
  renderizarSala();
  $('#resultadoBusqueda').modal('hide'); // Cerrar el modal después de agregar
}


// Función para renderizar la tabla de sala de espera
function renderizarSala() {
 const tabla = document.querySelector('#tablaSalaEspera tbody');
  tabla.innerHTML = "";

  const sala = JSON.parse(localStorage.getItem('salaEspera') || '[]');
  sala.forEach((p, index) => {
    const fila = document.createElement('tr');

// Verificar si el historial clínico está definido
    const historialClinico = p.historialClinico || {  // Si no existe historialClinico, crear un objeto vacío
      peluqueria: [],
      atencionMVet: [],
      recordatorios: [],
      fotos: [],
      videos: [],
      anotaciones: []
    };

    // Obtener la última atención de peluquería (o cualquier otro dato del historial clínico)
    const ultimaPeluqueria = historialClinico.peluqueria.length > 0 
      ? historialClinico.peluqueria[historialClinico.peluqueria.length - 1] 
      : { servicio: 'No disponible' };

    const ultimaAtencionMVet = historialClinico.atencionMVet.length > 0 
      ? historialClinico.atencionMVet[historialClinico.atencionMVet.length - 1] 
      : { tratamiento: 'No disponible' };

    fila.innerHTML = `
      <td>${p.dueño}</td>
      <td>${p.mascota}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono}</td>
      <td>${p.codAlt}</td>
      <td>${p.observacion}</td>
      <td>${p.estado}</td>
      <td>
        ${p.estado === "En espera" 
          ? `<button class="btn btn-sm btn-danger" onclick="marcarAtendido(${index})">Atendido</button>` 
          : `<button class="btn btn-sm btn-secondary" onclick="eliminarPaciente(${index})">Eliminar</button>`}
      </td>
      <td>
        <button class="btn btn-sm btn-info" onclick="verHistorial('${p.codAlt}')">Ver Historial</button> <!-- Botón para ver historial -->
      </td>
    `;
    tabla.appendChild(fila);
  });
}






function verHistorial(codAlt) {
  // Obtener los registros completos de las mascotas
  const registros = getRegistrosMascotas();

  // Buscar la mascota usando su NHC (codAlt)
  const mascota = registros.flatMap(dueño => dueño.mascotas).find(m => m.codAlt === codAlt);

  if (!mascota) {
    alert('Mascota no encontrada');
    return;
  }

// Mostrar el historial clínico en un modal o en una sección específica
  const historialModal = document.getElementById('historialModal'); // Modal donde se mostrará el historial
  const contenido = historialModal.querySelector('.modal-body'); // Donde se insertará la información

  contenido.innerHTML = `
    <div class="row">
      <!-- Columna 1: Historial de Baños -->
      <div class="col-md-3">
        <h6><strong>Historial de Peluquería:</strong></h6>
        ${mascota.historialClinico.peluqueria.length > 0 ? mascota.historialClinico.peluqueria.map(bano => `
          <div class="card mb-3">
            <div class="card-body">
              <p><strong>Fecha:</strong> ${bano.fecha}</p>
              <p><strong>Servicio:</strong> ${bano.servicio}</p>
              <p><strong>Observaciones:</strong> ${bano.observaciones || 'No disponibles'}</p>
              <p><strong>Fotos:</strong> ${bano.fotos.length > 0 ? bano.fotos.join(', ') : 'No disponibles'}</p>
              <p><strong>Videos:</strong> ${bano.videos.length > 0 ? bano.videos.join(', ') : 'No disponibles'}</p>
            </div>
          </div>
        `).join('') : '<p>No hay historial de peluquería.</p>'}
      </div>

      <!-- Columna 2: Historial de Atenciones Médicas -->
      <div class="col-md-3">
        <h6><strong>Historial de Atención Médica:</strong></h6>
        ${mascota.historialClinico.atencionMVet.length > 0 ? mascota.historialClinico.atencionMVet.map(atencion => `
          <div class="card mb-3">
            <div class="card-body">
              <p><strong>Fecha:</strong> ${atencion.fecha}</p>
              <p><strong>Tratamiento:</strong> ${atencion.tratamiento}</p>
              <p><strong>Observaciones:</strong> ${atencion.observaciones || 'No disponibles'}</p>
              <p><strong>Fotos:</strong> ${atencion.fotos.length > 0 ? atencion.fotos.join(', ') : 'No disponibles'}</p>
              <p><strong>Videos:</strong> ${atencion.videos.length > 0 ? atencion.videos.join(', ') : 'No disponibles'}</p>
            </div>
          </div>
        `).join('') : '<p>No hay historial de atención médica.</p>'}
      </div>

      <!-- Columna 3: Recordatorios -->
      <div class="col-md-3">
        <h6><strong>Recordatorios:</strong></h6>
        ${mascota.historialClinico.recordatorios.length > 0 ? mascota.historialClinico.recordatorios.map(recordatorio => `
          <div class="card mb-3">
            <div class="card-body">
              <p><strong>Fecha:</strong> ${recordatorio.fecha}</p>
              <p><strong>Recordatorio:</strong> ${recordatorio.texto}</p>
              <p><strong>Última Fecha:</strong> ${recordatorio.ultimaFecha || 'No disponible'}</p>
              <p><strong>Próxima Fecha:</strong> ${recordatorio.proximaFecha || 'No disponible'}</p>
            </div>
          </div>
        `).join('') : '<p>No hay recordatorios registrados.</p>'}
      </div>

      <!-- Columna 4: Fotos y Videos -->
      <div class="col-md-3">
        <h6><strong>Fotos y Videos:</strong></h6>
        <p><strong></strong> ${mascota.historialClinico.fotos.length > 0 ? mascota.historialClinico.fotos.join(', ') : 'No disponibles'}</p>

      </div>
    </div>
  `;

  // Mostrar el modal con el historial
  $('#historialModal').modal('show');
}




// Función para marcar como atendido
function marcarAtendido(index) {
  const sala = JSON.parse(localStorage.getItem('salaEspera') || '[]');
  sala[index].estado = "Atendido";
  localStorage.setItem('salaEspera', JSON.stringify(sala));
  renderizarSala();
}

// Función para eliminar paciente
function eliminarPaciente(index) {
  if (confirm("¿Estás seguro de que deseas eliminar este paciente atendido de la sala de espera?")) {
    let sala = JSON.parse(localStorage.getItem('salaEspera') || '[]');
    sala.splice(index, 1);
    localStorage.setItem('salaEspera', JSON.stringify(sala));
    renderizarSala();
  }
}


// Detectar cambios en localStorage (por si otras pestañas modifican)
window.addEventListener("storage", function (e) {
  if (e.key === "salaEspera") {
    renderizarSala();
  }
});

// Al cargar la página renderiza la tabla
window.onload = renderizarSala;

// Manejo del botón Buscar para mostrar modal con resultados
document.getElementById('btnBuscar').addEventListener('click', function () {
  buscar();
});
