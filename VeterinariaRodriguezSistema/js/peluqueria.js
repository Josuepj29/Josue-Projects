// Datos de ejemplo para búsqueda (puedes ampliar o conectar a base real)
const datosEjemplo = [
  {
    dueño: 'Josué Pérez Jaraaaaaaaaaaaaaaaa',
    mascota: 'Perla',
    direccion: 'Chaclacayo',
    telefono: '931098473',
    codAlt: '00001'
  },
  // Puedes añadir más datos aquí
];

// Mapa para almacenar datos por fila
const llamadasPorFila = new Map();
const observacionesPorFila = new Map();
const historiaBañoPorFila = new Map();
const recordatoriosPorFila = new Map();

let filaObservacionesActual = null;
let filaHistoriaActual = null;
let botonHistoriaActual = null;
let filaRecordatorioActual = null;

// Función para filtrar y mostrar resultados según inputs
function llenarResultadosBusqueda() {
  const tbody = document.querySelector('#tablaResultadosBusqueda tbody');
  tbody.innerHTML = '';

  const nombreDuenoFiltro = document.getElementById('inputNombreDueno').value.toLowerCase();
  const telefonoFiltro = document.getElementById('inputTelefono').value.toLowerCase();
  const nombreMascotaFiltro = document.getElementById('inputNombreMascota').value.toLowerCase();
  const codAltFiltro = document.getElementById('inputNHC').value.toLowerCase();
  const direccionFiltro = document.getElementById('inputDireccion').value.toLowerCase();  // <- Asegúrate de tener este input en el HTML

  const resultados = datosEjemplo.filter(p => {
    const dueñoMatch = p.dueño.toLowerCase().includes(nombreDuenoFiltro);
    const telefonoMatch = p.telefono.toLowerCase().includes(telefonoFiltro);
    const mascotaMatch = p.mascota.toLowerCase().includes(nombreMascotaFiltro);
    const codAltMatch = p.codAlt.toLowerCase().includes(codAltFiltro);
    const direccionMatch = p.direccion.toLowerCase().includes(direccionFiltro);  // <-- Nueva condición

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
      <td>
        <button class="btn btn-success btn-agregar"
          data-nombre="${item.mascota}"
          data-dueno="${item.dueño}"
          data-nhc="${item.codAlt}"
          type="button"
        >+</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Función para agregar paciente a la tabla peluquería
function agregarSalaPeluqueria(nombreMascota, nombreDueno, codAlt) {
  const tabla = document.getElementById("tablaSalaPeluqueria");
  const fila = document.createElement("tr");
  const idFila = Date.now().toString();
  fila.setAttribute("data-id", idFila);

  fila.innerHTML = `
<td title="${nombreDueno}" style="max-width:150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nombreDueno}</td>
<td title="${nombreMascota}">${nombreMascota}</td>
<td>${datosEjemplo.find(d => d.codAlt === codAlt)?.direccion || ''}</td>
<td>${datosEjemplo.find(d => d.codAlt === codAlt)?.telefono || ''}</td>
    <td>${codAlt}</td>
    <td><button class="btn btn-warning btn-sm" onclick="cambiarEstado(this)" type="button">En curso</button></td>
    <td><button class="btn btn-outline-info btn-sm btn-llamada" onclick="llamarDueno(this)" type="button">--</button></td>
    <td><button class="btn btn-info btn-sm" onclick="mostrarHistorialLlamadas(this)" type="button">Ver historial</button></td>
    <td><button class="btn btn-success btn-sm" onclick="cobrarMascota(this)" type="button">No cobrado</button></td>
    <td><button class="btn btn-secondary btn-sm" onclick="abrirModalObservaciones(this)" type="button">Agregar</button></td>
    <td>
      <button class="btn btn-info btn-sm" onclick="abrirModalHB(this)" type="button">HB</button>
      <button class="btn btn-primary btn-sm ml-1" onclick="abrirModalHistoria(this)" type="button">+</button>
    </td>
    <td class="text-center">
      <div class="btn-group btn-group-sm" role="group" aria-label="Recordatorios">
        <button class="btn btn-warning btn-recordatorio" onclick="abrirModalRecordatorio(this)" title="Agregar Recordatorio" type="button">⏰</button>
      </div>
    </td>
    <td class="text-center">
      <button class="btn btn-danger btn-sm" onclick="eliminarFila(this)" title="Eliminar Mascota" type="button">X</button>
    </td>
  `;

  tabla.appendChild(fila);
  llamadasPorFila.set(idFila, []);
  observacionesPorFila.set(idFila, "");
  historiaBañoPorFila.set(idFila, { historia: "", observaciones: "" });
  recordatoriosPorFila.set(idFila, []);

  $("#resultadoBusqueda").modal("hide");
}

// Cambiar estado de baño
function cambiarEstado(btn) {
  if (confirm("¿Baño completado?")) {
    btn.textContent = "Finalizado";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-secondary");
  }
}

// Llamar dueño
function llamarDueno(btn) {
  const fila = btn.closest("tr");
  const idFila = fila.getAttribute("data-id");
  if (!idFila) return;

  const respuesta = prompt("¿Contestó la llamada? Responde Sí o No", "Sí");
  if (respuesta === null) return;

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let listaLlamadas = llamadasPorFila.get(idFila) || [];

  listaLlamadas.push({ hora, resultado: respuesta.toLowerCase() });

  llamadasPorFila.set(idFila, listaLlamadas);

  btn.textContent = hora;

  btn.classList.remove("btn-outline-info");
  btn.classList.add("btn-info");
}

// Mostrar historial de llamadas
function mostrarHistorialLlamadas(btn) {
  const fila = btn.closest("tr");
  const idFila = fila.getAttribute("data-id");
  if (!idFila) return;

  const listaLlamadas = llamadasPorFila.get(idFila) || [];
  if (listaLlamadas.length === 0) {
    alert("No hay llamadas registradas para esta mascota.");
    return;
  }

  let mensaje = "Historial de llamadas:\n";
  listaLlamadas.forEach((llamada, index) => {
    mensaje += `${index + 1}. Hora: ${llamada.hora} - Resultado: ${llamada.resultado}\n`;
  });

  alert(mensaje);
}

// Confirmar cobro
function cobrarMascota(btn) {
  if (confirm("¿Confirmar que el dueño pagó el servicio?")) {
    btn.textContent = "Cobrado";
    btn.classList.remove("btn-success");
    btn.classList.add("btn-danger");
  }
}

// Abrir modal observaciones
function abrirModalObservaciones(btn) {
  filaObservacionesActual = btn.closest("tr");
  const idFila = filaObservacionesActual.getAttribute("data-id");
  if (!idFila) return;

  const textoGuardado = observacionesPorFila.get(idFila) || "";
  document.getElementById("textareaObservaciones").value = textoGuardado;
  $("#modalObservaciones").modal("show");
}

// Cancelar observaciones
document.getElementById("btnCancelarObservaciones").addEventListener("click", () => {
  if (confirm("¿Estás seguro que quieres cancelar?")) {
    $("#modalObservaciones").modal("hide");
  }
});

// Guardar observaciones
document.getElementById("btnGuardarObservaciones").addEventListener("click", () => {
  if (!filaObservacionesActual) return;
  if (!confirm("¿Estás seguro que quieres guardar las observaciones?")) return;

  const idFila = filaObservacionesActual.getAttribute("data-id");
  const texto = document.getElementById("textareaObservaciones").value.trim();

  observacionesPorFila.set(idFila, texto);

  $("#modalObservaciones").modal("hide");
  alert("Observaciones guardadas con éxito");
});

// Abrir modal historia
function abrirModalHistoria(btn) {
  botonHistoriaActual = btn;
  filaHistoriaActual = btn.closest("tr");
  const idFila = filaHistoriaActual.getAttribute("data-id");
  const data = historiaBañoPorFila.get(idFila) || { historia: "", observaciones: "" };

  document.getElementById("historiaBaño").value = data.historia;
  document.getElementById("observacionesHistoria").value = data.observaciones;
  $("#modalHistoria").modal("show");
}

// Cancelar historia
document.getElementById("btnCancelarHistoria").addEventListener("click", function () {
  if (confirm("¿Estás seguro que quieres cancelar?")) {
    $("#modalHistoria").modal("hide");
  }
});

// Confirmar historia
document.getElementById("btnConfirmarHistoria").addEventListener("click", function () {
  if (!filaHistoriaActual) return;
  if (!confirm("¿Estás seguro que quieres guardar la historia?")) return;

  const idFila = filaHistoriaActual.getAttribute("data-id");
  const historia = document.getElementById("historiaBaño").value.trim();
  const observaciones = document.getElementById("observacionesHistoria").value.trim();

  historiaBañoPorFila.set(idFila, { historia, observaciones });

  $("#modalHistoria").modal("hide");
  alert("Historia guardada con éxito");

  if (botonHistoriaActual) {
    botonHistoriaActual.disabled = false;
    botonHistoriaActual.classList.remove("btn-secondary");
    botonHistoriaActual.classList.add("btn-primary");
  }
});

// Abrir modal HB
function abrirModalHB(btn) {
  const fila = btn.closest("tr");
  const idFila = fila.getAttribute("data-id");
  if (!idFila) return;

  const data = historiaBañoPorFila.get(idFila);

  const tbody = document.getElementById("tablaHBBody");
  const sinHistorialP = document.getElementById("sinHistorialHB");

  tbody.innerHTML = "";

  if (!data || (!data.historia && !data.observaciones)) {
    sinHistorialP.style.display = "block";
  } else {
    sinHistorialP.style.display = "none";
    const tr = document.createElement("tr");
    const tdFecha = document.createElement("td");
    tdFecha.textContent = new Date().toLocaleDateString();
    const tdServicio = document.createElement("td");
    tdServicio.textContent = data.historia || "No especificado";
    const tdObs = document.createElement("td");
    tdObs.textContent = data.observaciones || "";
    tr.appendChild(tdFecha);
    tr.appendChild(tdServicio);
    tr.appendChild(tdObs);
    tbody.appendChild(tr);
  }

  $("#modalHB").modal("show");
}

// Abrir modal recordatorio
function abrirModalRecordatorio(btn) {
  filaRecordatorioActual = btn.closest('tr');
  const idFila = filaRecordatorioActual.getAttribute('data-id');
  if (!idFila) return;

  // Carga el array guardado o vacio
  const recordatoriosGuardados = recordatoriosPorFila.get(idFila) || [];
  const select = document.getElementById('selectRecordatorio');

  select.selectedIndex = 0;

  window.recordatoriosTemp = [...recordatoriosGuardados];

  actualizarListaRecordatoriosModal();

  $('#modalRecordatorio').modal('show');
}

// Actualiza lista de recordatorios en modal
function actualizarListaRecordatoriosModal() {
  let listaDiv = document.getElementById('listaRecordatorios');
  if (!listaDiv) {
    listaDiv = document.createElement('div');
    listaDiv.id = 'listaRecordatorios';
    listaDiv.style.maxHeight = '150px';
    listaDiv.style.overflowY = 'auto';
    listaDiv.style.marginTop = '10px';
    listaDiv.style.border = '1px solid #ddd';
    listaDiv.style.padding = '5px';
    listaDiv.style.borderRadius = '4px';

    document.getElementById('selectRecordatorio').parentNode.appendChild(listaDiv);
  }
  listaDiv.innerHTML = '';

  if (window.recordatoriosTemp.length === 0) {
    listaDiv.innerHTML = '<p class="text-muted">No hay recordatorios agregados.</p>';
    return;
  }

  window.recordatoriosTemp.forEach((rec, idx) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '2px 5px';
    item.style.borderBottom = '1px solid #eee';

    const textSpan = document.createElement('span');
    textSpan.textContent = rec.text;

    const btnDel = document.createElement('button');
    btnDel.className = 'btn btn-sm btn-danger';
    btnDel.style.padding = '0 6px';
    btnDel.textContent = 'X';
    btnDel.title = 'Eliminar recordatorio';
    btnDel.onclick = () => {
      window.recordatoriosTemp.splice(idx, 1);
      actualizarListaRecordatoriosModal();
    };

    item.appendChild(textSpan);
    item.appendChild(btnDel);

    listaDiv.appendChild(item);
  });
}

// Confirmar recordatorio
document.getElementById('btnConfirmarRecordatorio').addEventListener('click', () => {
  if (!filaRecordatorioActual) return;

  if (!confirm("¿Estás seguro que quieres guardar los recordatorios?")) return;

  const idFila = filaRecordatorioActual.getAttribute('data-id');

  const select = document.getElementById('selectRecordatorio');
  const opcionSeleccionada = select.options[select.selectedIndex];
  if (select.selectedIndex !== 0) {
    const yaExiste = window.recordatoriosTemp.some(r => r.value === opcionSeleccionada.value);
    if (!yaExiste) {
      window.recordatoriosTemp.push({ value: opcionSeleccionada.value, text: opcionSeleccionada.text });
    }
  }

  recordatoriosPorFila.set(idFila, window.recordatoriosTemp);

  $('#modalRecordatorio').modal('hide');
  alert(`Recordatorios guardados (${window.recordatoriosTemp.length})`);
});

// Eliminar fila con confirmación
function eliminarFila(btn) {
  if (!confirm('¿Seguro quieres eliminar esta mascota? Esta acción no se puede deshacer.')) return;
  const fila = btn.closest('tr');
  const idFila = fila.getAttribute('data-id');

  llamadasPorFila.delete(idFila);
  observacionesPorFila.delete(idFila);
  historiaBañoPorFila.delete(idFila);
  recordatoriosPorFila.delete(idFila);

  fila.remove();
}

// Delegación para botones "Agregar" en resultados búsqueda
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnBuscar').addEventListener('click', () => {
    llenarResultadosBusqueda();
    $('#resultadoBusqueda').modal('show');
  });

  document.querySelector('#tablaResultadosBusqueda tbody').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-agregar')) {
      const btn = e.target;
      const nombreMascota = btn.getAttribute('data-nombre');
      const nombreDueno = btn.getAttribute('data-dueno');
      const nhc = btn.getAttribute('data-nhc');
      agregarSalaPeluqueria(nombreMascota, nombreDueno, nhc);
    }
  });
});
