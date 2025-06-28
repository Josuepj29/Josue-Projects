// Datos fijos de ejemplo para búsquedas y para historial
const datosEjemplo = [
  { dueño: 'Josué Pérez Jaraaaaaaaaaaaaaaaa', mascota: 'Perla', direccion: 'Chaclacayo', telefono: '931098473', codAlt: '00001' }
];

// Historial clínico de ejemplo para pacientes con archivos por consulta
const historiales = {
  '00001': [
    {
      fecha: '10/04/2025',
      motivo: 'Vacunación',
      tratamiento: 'Vacuna',
      observacion: 'Cliente especial',
      cobros: 'Consulta: S/10<br>Tratamiento: S/40<br>Pastillas: S/10',
      anamnesis: 'Se revisó por control de vacunación anual. Mascota en buen estado, sin síntomas relevantes.',
      archivos: [
        { tipo: 'imagen', src: '../img/ejemplo_imagen1.jpg', descripcion: 'Vacuna - Foto' },
        { tipo: 'pdf', src: '../img/ejemplo_pdf1.pdf', descripcion: 'Informe Vacuna' }
      ]
    },
    {
      fecha: '20/03/2025',
      motivo: 'Consulta',
      tratamiento: 'Observación',
      observacion: 'Mascota nerviosa con pronóstico reservado y se le recomendó examenes, fluido..........',
      cobros: 'Consulta: S/10',
      anamnesis: 'Mascota con temblores. Se descartaron enfermedades virales, se recomendó observación.',
      archivos: []
    },
    {
      fecha: '05/02/2025',
      motivo: 'Baño Medicado',
      tratamiento: 'Desparasitación',
      observacion: 'Costo social',
      cobros: 'Baño: S/25<br>Desparasitación: S/20',
      anamnesis: 'Presentaba picazón e irritación en la piel. Se aplicó baño medicado y antiparasitarios.',
      archivos: [
        { tipo: 'imagen', src: '../img/ejemplo_imagen2.jpg', descripcion: 'Baño Medicado Foto' }
      ]
    }
  ]
};

// Función para llenar tabla resultados búsqueda
function llenarResultadosBusqueda() {
  const tbody = document.querySelector('#tablaResultadosBusqueda tbody');
  tbody.innerHTML = '';

  const nombreDuenoFiltro = document.getElementById('inputNombreDueno').value.toLowerCase();
  const telefonoFiltro = document.getElementById('inputTelefono').value.toLowerCase();
  const nombreMascotaFiltro = document.getElementById('inputNombreMascota').value.toLowerCase();
  const codAltFiltro = document.getElementById('inputNHC').value.toLowerCase();
  const direccionFiltro = document.getElementById('inputDireccion').value.toLowerCase();

  const resultados = datosEjemplo.filter(p => {
    const dueñoMatch = p.dueño.toLowerCase().includes(nombreDuenoFiltro);
    const telefonoMatch = p.telefono.toLowerCase().includes(telefonoFiltro);
    const mascotaMatch = p.mascota.toLowerCase().includes(nombreMascotaFiltro);
    const codAltMatch = p.codAlt.toLowerCase().includes(codAltFiltro);
    const direccionMatch = p.direccion.toLowerCase().includes(direccionFiltro);

    return dueñoMatch && telefonoMatch && mascotaMatch && codAltMatch && direccionMatch;
  });

  if (resultados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No se encontraron resultados.</td></tr>`;
    return;
  }

  resultados.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.dueño}</td>
      <td>${item.mascota}</td>
      <td>${item.direccion}</td>
      <td>${item.telefono}</td>
      <td>${item.codAlt}</td>
      <td><button class="btn btn-success" onclick="mostrarHistorial('${item.mascota}', '${item.dueño}', '${item.codAlt}')">+</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Función para mostrar historial y datos paciente
function mostrarHistorial(nombreMascota, nombreDueno, codAlt) {
  document.getElementById('nombreDueno').textContent = nombreDueno;
  document.getElementById('nombreMascota').textContent = nombreMascota;
  document.getElementById('codAlt').textContent = codAlt;

  // Cargar observación guardada
  const obs = cargarObservacion(codAlt);
  document.getElementById('observacion').value = obs;

  // Llenar tabla historial
  const historial = historiales[codAlt] || [];
  const tablaHistorial = document.getElementById('tablaHistorial');
  tablaHistorial.innerHTML = '';
  historial.forEach((item, index) => {
    const tieneArchivos = item.archivos && item.archivos.length > 0;
    const botonFotos = tieneArchivos ?
      `<button class="btn btn-sm btn-primary ml-2" onclick="verFotos('${codAlt}', ${index})">F</button>` : '';

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${item.fecha}</td>
      <td>${item.motivo}</td>
      <td><button class="btn btn-sm btn-warning" onclick="verAnamnesis('${codAlt}', ${index})">TTO</button></td>
      <td>
        <div class="observacion-text">${item.observacion}</div>
        <div class="botones-acciones">
          <button class="btn btn-sm btn-info ml-2" onclick="verCobros('${codAlt}', ${index})">C</button>
          ${botonFotos}
        </div>
      </td>
    `;
    tablaHistorial.appendChild(fila);
  });

  window.historialGlobal = historial;

  $('#resultadoBusqueda').modal('hide');
  document.getElementById('datosPaciente').style.display = 'block';
}

// Mostrar modal cobros
function verCobros(codAlt, index) {
  const detalle = window.historialGlobal[index].cobros;
  document.getElementById('contenidoCobros').innerHTML = `<p>${detalle}</p>`;
  $('#modalCobros').modal('show');
}

// Mostrar modal anamnesis
function verAnamnesis(codAlt, index) {
  const anamnesis = window.historialGlobal[index].anamnesis;
  document.getElementById('contenidoAnamnesis').innerHTML = `<p>${anamnesis}</p>`;
  $('#modalAnamnesis').modal('show');
}

// Mostrar modal fotos/documentos con archivos específicos
function verFotos(codAlt, index) {
  const archivos = window.historialGlobal[index].archivos || [];
  const modal = document.getElementById('modalFotosDocs');
  const previewList = modal.querySelector('.preview-list');

  previewList.innerHTML = '';

  if (archivos.length === 0) {
    previewList.innerHTML = '<p>No hay fotos ni documentos para esta consulta.</p>';
  } else {
    archivos.forEach(archivo => {
      let html = '';
      if (archivo.tipo === 'imagen') {
        html = `<div class="preview-item">
                  <img src="${archivo.src}" alt="${archivo.descripcion}" />
                  <p>${archivo.descripcion}</p>
                </div>`;
      } else if (archivo.tipo === 'pdf') {
        html = `<div class="preview-item">
                  <iframe src="${archivo.src}" frameborder="0"></iframe>
                  <p>${archivo.descripcion}</p>
                </div>`;
      }
      previewList.innerHTML += html;
    });
  }

  modal.style.display = 'block';
}

// Guardar observación
document.getElementById('btnConfirmarObservacion').addEventListener('click', () => {
  const codAlt = document.getElementById('codAlt').textContent;
  const textoObs = document.getElementById('observacion').value.trim();

  if (!codAlt) {
    alert('No se ha cargado ningún paciente para guardar observaciones.');
    return;
  }

  guardarObservacion(codAlt, textoObs);
  alert('Observación guardada.');
});

// Guardar y cargar observaciones en localStorage
function guardarObservacion(codAlt, texto) {
  localStorage.setItem(`observacion_${codAlt}`, texto);
}

function cargarObservacion(codAlt) {
  return localStorage.getItem(`observacion_${codAlt}`) || '';
}

// Cerrar modal fotos
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalFotosDocs');
  const closeBtn = modal.querySelector('.close');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// Cuando se abre modal resultados se llenan resultados
$('#resultadoBusqueda').on('show.bs.modal', function () {
  llenarResultadosBusqueda();
});
