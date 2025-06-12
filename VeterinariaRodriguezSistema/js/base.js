// base.js - funciones comunes

// Mostrar/ocultar elemento con clase .visible
function toggleVisibility(elementId, show) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (show) el.classList.add('visible');
  else el.classList.remove('visible');
}

// Guardar y cargar observaciones en localStorage para paciente
function guardarObservacion(codAlt, texto) {
  localStorage.setItem(`observacion_${codAlt}`, texto);
}

function cargarObservacion(codAlt) {
  return localStorage.getItem(`observacion_${codAlt}`) || '';
}

// Función para mostrar alertas con confirmación simple
function confirmarAccion(mensaje, callback) {
  if (confirm(mensaje)) {
    callback();
  }
}
