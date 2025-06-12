// Variables para manejo global
let pacienteAConfirmar = null;
let pacienteRecordatorios = null;
let recordatorios = [];
let archivosActuales = []; // archivos cargados en el modal actual

// Textos recordatorios
const textosRecordatorios = {
  "cita_medica": "Cita médica - 1 día",
  "puppy_14": "Vac. Puppy - 14 días",
  "puppy_21": "Vac. Puppy - 21 días",
  "Cuadruple_14": "Vac. Cuádruple - 14 días",
  "Cuadruple_21": "Vac. Cuádruple - 21 días",
  "Quintuple_14": "Vac. Quíntuple - 14 días",
  "Quintuple_21": "Vac. Quíntuple - 21 días",
  "Quintuple_180": "Vac. Quíntuple - 180 días",
  "Quintuple_corona_14": "Vac. Quíntuple + Coronavirus - 14 días",
  "Quintuple_corona_21": "Vac. Quíntuple + Coronavirus - 21 días",
  "Quintuple_corona_180": "Vac. Quíntuple + Coronavirus - 180 días",
  "Sextuple_rabia": "Vac. Séxtuple + rabia - 365 días",
  "KC": "Vac. KC - 365 días",
  "Vac_rabia": "Vac. Rabia - 365 días",
  "pipetas_14": "Pipetas - 14 días",
  "pipetas_30": "Pipetas - 30 días",
  "desparasitacion_externa_30": "Desparasitación externa - 30 días",
  "desparasitacion_externa_90": "Desparasitación externa - 90 días",
  "oxantel_1": "Oxantel - 1 día",
  "oxantel_10": "Oxantel - 10 días",
  "oxantel_30": "Oxantel - 30 días",
  "oxantel_60": "Oxantel - 60 días",
  "puppymec_1": "Puppymec - 1 día",
  "puppymec_10": "Puppymec - 10 días",
  "puppymec_14": "Puppymec - 14 días",
  "fripets_10": "Fripets - 10 días",
  "fripets_30": "Fripets - 30 días",
  "fripets_60": "Fripets - 60 días",
  "Triple_felina": "Vac. Triple felina - 14 días",
  "Triple_felina_21": "Vac. Triple felina - 21 días",
  "Triple_felina_365": "Vac. Triple felina - 365 días",
  "Leucemia": "Vac. Leucemia - 30 días",
};

// --- PACIENTES ---
// Obtener pacientes
function obtenerPacientes() {
  return JSON.parse(localStorage.getItem('salaEspera') || '[]');
}


$(document).ready(function() {
  // Inicializa todos los tooltips cuando la página esté lista
  $('[data-toggle="tooltip"]').tooltip();
});

// Cargar pacientes en la tabla
function cargarPacientes() {
  const tbody = document.getElementById('tablaMVet');
  tbody.innerHTML = '';  // Limpiar la tabla antes de cargar los pacientes

  const pacientes = obtenerPacientes();  // Obtenemos los pacientes desde localStorage

  console.log("Pacientes cargados desde localStorage:", pacientes);  // Verificación de los pacientes cargados

  // Verifica si los pacientes existen en localStorage
  if (pacientes.length === 0) {
    console.log('No hay pacientes registrados en localStorage');
    return;
  }

  // Si hay pacientes, los agrega a la tabla
  pacientes.forEach(p => {
    const fila = document.createElement('tr');
    fila.id = `fila_${p.codAlt}`;
    fila.innerHTML = `
      <td>${p.dueño}</td>
      <td>${p.mascota}</td>
      <td>${p.telefono || '––'}</td>
      <td>${p.direccion || '––'}</td>
      <td>${p.codAlt}</td>
      <td>${p.estado || '––'}</td>  <!-- Asegúrate de mostrar el estado -->
      <td>
        <div class="btn-group">
          ${p.estado === "En espera" ? `
            <button class="btn btn-sm btn-info" onclick="abrirModalAtencion('${p.codAlt}')">Atender</button>
            <button class="btn btn-sm btn-warning" onclick="abrirModalRecordatorios('${p.codAlt}')">⏰</button>
            <button class="btn btn-sm btn-primary" onclick="mostrarObservacion('${p.codAlt}')">OBS.</button>
            <button class="btn btn-sm btn-info" onclick="abrirModalHistorialClinico('${p.codAlt}')">HC</button> 
          ` : `
            <button class="btn btn-sm btn-secondary" disabled>Atendido</button>
          `}
          <button class="btn btn-sm btn-danger" style="padding: 0 6px; font-weight: bold;" onclick="abrirConfirmacion('${p.codAlt}')">×</button>
        </div>
      </td>
    `;
    tbody.appendChild(fila);
  });

  $('[data-toggle="tooltip"]').tooltip();
}

// Mostrar observación
function mostrarObservacion(codAlt) {
  const paciente = obtenerPacientes().find(p => p.codAlt === codAlt);
  if (paciente && paciente.observacion) {
    alert(`Observación: ${paciente.observacion}`);
  } else {
    alert('No hay observaciones registradas para este paciente.');
  }
}

// MODAL ATENCION
function abrirModalAtencion(codAlt) {
  pacienteRecordatorios = codAlt;
  document.getElementById('codPacienteActual').value = codAlt;

  // Obtener la atención guardada desde localStorage (si existe)
  const atencionGuardada = JSON.parse(localStorage.getItem(`atencion_${codAlt}`) || '{}');

  // Si ya hay atención guardada, mostrar los datos, de lo contrario mantener los campos vacíos
  document.getElementById('inputAnamnesis').value = atencionGuardada.anamnesis || ''; // Si existe, mostrar
  document.getElementById('inputTratamiento').value = atencionGuardada.tratamiento || ''; // Si existe, mostrar

  // Limpiar archivos actuales (si existen)
  archivosActuales = []; // Limpiar archivos cargados

  // Mostrar el modal para la atención
  $('#modalAtencion').modal('show');
}



// Función para manejar los archivos cuando se seleccionen
function manejarArchivos(event) {
  const archivos = event.target.files; // Archivos seleccionados
  const previewContainer = document.getElementById('previewArchivos'); // Contenedor para las previsualizaciones
  previewContainer.innerHTML = ''; // Limpiar contenedor antes de agregar nuevas previsualizaciones

  // Iteramos sobre los archivos seleccionados
  Array.from(archivos).forEach((archivo) => {
    const reader = new FileReader(); // Crear un lector de archivos

    // Si es una imagen
    if (archivo.type.startsWith('image/')) {
      reader.onload = function (e) {
        const imgElement = document.createElement('img');
        imgElement.src = e.target.result; // Resultado del lector de archivo
        imgElement.classList.add('img-thumbnail'); // Estilo de imagen
        imgElement.style.maxWidth = '150px';
        imgElement.style.marginRight = '10px';
        imgElement.style.cursor = 'pointer'; // Cambiar el cursor para indicar que es clickeable
        
        // Añadir un evento de clic para agrandar la imagen
        imgElement.addEventListener('click', function () {
          mostrarImagenGrande(e.target.result);
        });

        previewContainer.appendChild(imgElement); // Añadir imagen al contenedor
      };
      reader.readAsDataURL(archivo); // Leer el archivo como una URL de datos
    } 
    // Si es un archivo de video
    else if (archivo.type.startsWith('video/')) {
      reader.onload = function (e) {
        const videoElement = document.createElement('video');
        videoElement.src = e.target.result;
        videoElement.controls = true; // Habilitar controles de video
        videoElement.style.maxWidth = '200px';
        
        previewContainer.appendChild(videoElement); // Añadir video al contenedor
      };
      reader.readAsDataURL(archivo); // Leer archivo de video
    } 
    // Si es un archivo PDF
    else if (archivo.type === 'application/pdf') {
      reader.onload = function (e) {
        const pdfDiv = document.createElement('div');
        pdfDiv.innerHTML = `<embed src="${e.target.result}" type="application/pdf" width="100%" height="200px">`;
        
        previewContainer.appendChild(pdfDiv); // Añadir PDF al contenedor
      };
      reader.readAsDataURL(archivo); // Leer archivo PDF
    } 
    else {
      // Si el archivo es otro tipo, mostrar un mensaje
      const textElement = document.createElement('p');
      textElement.textContent = `Archivo no soportado: ${archivo.name}`;
      previewContainer.appendChild(textElement);
    }
  });
}

// Función para mostrar la imagen en tamaño completo
function mostrarImagenGrande(src) {
  const modal = document.createElement('div');
  modal.id = 'modalImagenGrande';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.cursor = 'pointer';
  modal.style.zIndex = '9999'; // Asegurar que el modal esté por encima de otros elementos

  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.border = '2px solid white';

  modal.appendChild(img);
  document.body.appendChild(modal);

  // Cerrar el modal al hacer clic en la imagen o en el fondo oscuro
  modal.addEventListener('click', function () {
    modal.remove(); // Eliminar el modal
  });
}




function guardarAtencion() {
  const cod = document.getElementById('codPacienteActual').value;
  const anam = document.getElementById('inputAnamnesis').value.trim();
  const trat = document.getElementById('inputTratamiento').value.trim();

  // Si no hay datos (Anamnesis, Tratamiento o Archivos), no permitir guardar
  if (!anam && !trat && archivosActuales.length === 0) {
    alert('Por favor, ingresa anamnesis, tratamiento o sube al menos un archivo.');
    return;
  }

  // Confirmar la acción de guardar la atención (temporalmente en el modal)
  if (!confirm("¿Estás seguro que quieres guardar la atención temporalmente?")) return;

  // Crear el objeto de registro de atención
  const registro = {
    fecha: new Date().toLocaleString(),
    anamnesis: anam,
    tratamiento: trat,
    archivos: archivosActuales,  // Archivos subidos durante la atención
  };

  // Guardar en localStorage bajo una clave única para ese paciente
  localStorage.setItem(`atencion_${cod}`, JSON.stringify(registro));

  // Limpiar los campos del formulario después de guardar temporalmente
  document.getElementById('inputAnamnesis').value = '';  // Limpiar campo Anamnesis
  document.getElementById('inputTratamiento').value = '';  // Limpiar campo Tratamiento
  archivosActuales = [];  // Limpiar archivos actuales

  // Cerrar el modal de atención después de guardar
  $('#modalAtencion').modal('hide');
  
  // Notificar que la atención se ha guardado temporalmente en el modal
  alert('Atención guardada temporalmente en el modal. Se guardará definitivamente cuando elimines al paciente.');
}


// Función para agregar un recordatorio
function agregarRecordatorio() {
  const select = document.getElementById('selectNuevoRecordatorio');
  const valor = select.value;

  // Asegúrate de que el valor seleccionado no esté vacío y que no se repita
  if (valor && !recordatorios.includes(valor)) {
    // Agregar el nuevo recordatorio a la lista de recordatorios
    recordatorios.push(valor);

    // Actualizar la lista de recordatorios en el modal
    actualizarListaRecordatorios();

    // Limpiar el campo de selección después de agregar
    select.value = '';
  }
}


// Función para actualizar la lista de recordatorios dentro del modal
function actualizarListaRecordatorios() {
  const lista = document.getElementById('listaRecordatorios');
  lista.innerHTML = '';  // Limpiar la lista de recordatorios antes de volver a llenarla

  // Si no hay recordatorios, mostrar un mensaje indicando que no hay recordatorios agregados
  if (recordatorios.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-muted">No hay recordatorios agregados.</li>';
    return;
  }

  // Mostrar todos los recordatorios actuales
  recordatorios.forEach((rec, i) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = textosRecordatorios[rec] || rec;  // Usar el texto asociado al recordatorio

    // Crear un botón para eliminar el recordatorio
    const btn = document.createElement('button');
    btn.className = 'btn btn-danger btn-sm';
    btn.textContent = '×';
    btn.title = 'Eliminar recordatorio';
    btn.style.minWidth = '24px';
    btn.style.height = '24px';
    btn.style.padding = '0 6px';
    btn.style.borderRadius = '4px';
    btn.style.fontWeight = '700';
    btn.style.fontSize = '1rem';

    // Eliminar el recordatorio al hacer clic en el botón
    btn.onclick = () => {
      recordatorios.splice(i, 1);
      actualizarListaRecordatorios(); // Volver a actualizar la lista
    };

    li.appendChild(btn);
    lista.appendChild(li);
  });
}





// --- RECORDATORIOS ---
function abrirModalRecordatorios(codAlt) {
  pacienteRecordatorios = codAlt;

  // Actualizar la lista de recordatorios en el modal
  actualizarListaRecordatorios();

  // Limpiar el campo para agregar un nuevo recordatorio
  document.getElementById('selectNuevoRecordatorio').value = '';
  document.getElementById('inputFechaCita').value = localStorage.getItem(`fechaCita_${codAlt}`) || '';

  // Mostrar el modal de recordatorios
  $('#modalRecordatorios').modal('show');
}




function guardarRecordatorios() {
  // Solo se guardan los recordatorios en localStorage cuando el paciente es eliminado
  if (pacienteRecordatorios) {
    localStorage.setItem(`recordatorios_${pacienteRecordatorios}`, JSON.stringify(recordatorios));
  }
}

// Asignar el evento "click" al botón de agregar recordatorio
document.getElementById('btnAgregarRecordatorio').addEventListener('click', agregarRecordatorio);


document.addEventListener('DOMContentLoaded', () => {
  // Cargar pacientes y agregar tooltips
  cargarPacientes();

  //Evento para manejar los archivos cuando se seleccionen
document.getElementById('inputArchivos').addEventListener('change', manejarArchivos);

  // Agregar el nuevo recordatorio al seleccionar uno del select
  document.getElementById('selectNuevoRecordatorio').addEventListener('change', agregarRecordatorio);

  // Guardar la fecha de la cita médica
  document.getElementById('inputFechaCita').addEventListener('change', () => {
    if (pacienteRecordatorios) {
      const fecha = document.getElementById('inputFechaCita').value;
      localStorage.setItem(`fechaCita_${pacienteRecordatorios}`, fecha);
    }
  });

  // Evento para abrir el modal de fotos
  const btnFotos = document.getElementById('btnFotosDocs');
  const modal = document.getElementById('modalFotosDocs');
  const closeBtn = modal.querySelector('.close');
  
  // Mostrar el modal de fotos al hacer clic en el botón
  btnFotos.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Cerrar el modal de fotos al hacer clic en el botón de cerrar
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Cerrar el modal de fotos al hacer clic fuera del modal
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Asignar el evento "click" al botón de agregar recordatorio
  const btnAgregarRecordatorio = document.getElementById('btnAgregarRecordatorio');
  if (btnAgregarRecordatorio) {
    btnAgregarRecordatorio.addEventListener('click', agregarRecordatorio);
  }
});


function eliminarPaciente(codAlt) {
  // Obtener los pacientes almacenados en localStorage
  let sala = obtenerPacientes();

  // Buscar el paciente a eliminar
  const pacienteAEliminar = sala.find(p => p.codAlt === codAlt);

  // Si el paciente existe, proceder con el registro antes de eliminarlo
  if (pacienteAEliminar) {
    // Confirmar la eliminación antes de proceder
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar a este paciente y guardar su historial?");
    if (!confirmacion) {
      return; // Si no confirma, no se elimina el paciente
    }

    // Obtener los datos de la atención temporal desde el modal
    const anam = document.getElementById('inputAnamnesis').value.trim();
    const trat = document.getElementById('inputTratamiento').value.trim();
    const archivos = archivosActuales;

    // Crear el objeto de registro de atención para el historial
    const registro = {
      fecha: new Date().toLocaleString(),
      anamnesis: anam,
      tratamiento: trat,
      archivos: archivos,  // Los archivos que hayan sido subidos
    };

    // Obtener el historial de atenciones del paciente
    let historial = JSON.parse(localStorage.getItem(`historial_${codAlt}`) || '[]');

    // Si no hay historial, inicializar como un array vacío
    if (!Array.isArray(historial)) {
      historial = [];
    }

    // Agregar el nuevo registro de atención al historial
    historial.push(registro);

    // Guardar el historial actualizado en localStorage
    localStorage.setItem(`historial_${codAlt}`, JSON.stringify(historial));

    
    // Guardar los recordatorios en localStorage solo cuando se elimina el paciente
    guardarRecordatorios();

    // Eliminar atención temporal para ese paciente
    localStorage.removeItem(`atencion_${codAlt}`);
// Filtrar el paciente para eliminarlo de la lista
    sala = sala.filter(p => p.codAlt !== codAlt);

    // Volver a guardar la lista de pacientes en localStorage
    localStorage.setItem('salaEspera', JSON.stringify(sala));

    // Recargar la tabla después de la eliminación
    cargarPacientes();
  }
}


// --- CONFIRMAR ELIMINAR PACIENTE ---
function abrirConfirmacion(codAlt) {
  pacienteAConfirmar = codAlt;
  $('#modalConfirmar').modal('show');
}



function confirmarEnvio() {
  // Verifica si ya hay un paciente para confirmar
  if (!pacienteAConfirmar) return;

  // Llamar a la función para eliminar el paciente
  eliminarPaciente(pacienteAConfirmar);

  // Limpiar la variable global
  pacienteAConfirmar = null;

  // Cerrar el modal después de la confirmación
  $('#modalConfirmar').modal('hide');
}






function abrirModalHistorialClinico(codAlt) {
  console.log("Abriendo historial clínico para el paciente:", codAlt); // Depuración

  // Asegurarse de que el modal existe antes de intentar manipularlo
  const modal = document.getElementById('modalHistorialClinico');
  if (modal) {
    // Obtener el historial del paciente desde localStorage
    const historial = JSON.parse(localStorage.getItem(`historial_${codAlt}`) || '[]');
  
    if (historial.length === 0) {
      alert('No hay historial clínico disponible para esta mascota.');
      return; // Cierre de la función si no hay historial
    }
  
    // Limpiar el contenido previo en el modal
    const modalBody = document.getElementById('modalHistorialClinicoBody');
    modalBody.innerHTML = ''; // Limpiar el contenido previo del modal
  
    // Crear la tabla para mostrar el historial clínico
    const tabla = document.createElement('table');
    tabla.classList.add('table', 'table-bordered', 'table-striped');
    
    // Crear la cabecera de la tabla
    const thead = document.createElement('thead');
    const encabezado = document.createElement('tr');
    encabezado.innerHTML = `
      <th>Fecha</th>
      <th>Anamnesis</th>
      <th>Tratamiento</th>
      <th>Archivos</th>
    `;
    thead.appendChild(encabezado);
    tabla.appendChild(thead);
  
    // Crear el cuerpo de la tabla con los datos del historial
    const tbody = document.createElement('tbody');
    
    historial.forEach((registro) => {
      const fila = document.createElement('tr');
      
      // Crear celdas para cada registro
      const celdaFecha = document.createElement('td');
      celdaFecha.textContent = registro.fecha;
      fila.appendChild(celdaFecha);
  
      const celdaAnamnesis = document.createElement('td');
      celdaAnamnesis.textContent = registro.anamnesis || 'No disponible';
      fila.appendChild(celdaAnamnesis);
  
      const celdaTratamiento = document.createElement('td');
      celdaTratamiento.textContent = registro.tratamiento || 'No disponible';
      fila.appendChild(celdaTratamiento);
  
      const celdaArchivos = document.createElement('td');
      if (registro.archivos && registro.archivos.length > 0) {
        celdaArchivos.innerHTML = registro.archivos.map(archivo => {
          if (archivo.type.startsWith('image/')) {
            return `
              <img src="${archivo.dataUrl}" alt="${archivo.name}" class="img-fluid small-img" style="max-width: 100px; margin-right: 5px; cursor: pointer;" onclick="abrirImagenGrande('${archivo.dataUrl}')">
            `;
          } else if (archivo.type === 'application/pdf') {
            return `<div>PDF: ${archivo.name}</div>`;
          } else {
            return `<div>${archivo.name}</div>`;
          }
        }).join('');
      } else {
        celdaArchivos.textContent = 'No hay archivos';
      }
      fila.appendChild(celdaArchivos);
  
      tbody.appendChild(fila);
    });
  
    tabla.appendChild(tbody);
    modalBody.appendChild(tabla);
  
    // Mostrar el modal con el historial clínico
    $('#modalHistorialClinico').modal('show');
  } else {
    console.log('Modal Historial Clínico no encontrado');
  }
}