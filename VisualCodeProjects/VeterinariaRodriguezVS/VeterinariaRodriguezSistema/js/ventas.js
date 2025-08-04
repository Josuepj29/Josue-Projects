// Abrir modal y preparar formulario
function abrirFormulario() {
  const modal = document.getElementById("modalAgregarVenta");
  modal.style.display = "block";

  document.getElementById("formVenta").reset();

  const sugerencias = document.getElementById("sugerenciasArticulos");
  sugerencias.innerHTML = "";
  sugerencias.classList.remove("show");
  sugerencias.style.display = "none";

  document.getElementById("camposVenta").style.display = "none";

  const inputBusqueda = document.getElementById("busquedaArticulo");
  inputBusqueda.value = "";
  inputBusqueda.focus();

  // Limpiar código seleccionado
  document.getElementById("codigo").value = "";
  delete document.getElementById("formVenta").dataset.editIndex;

}

// Cerrar modal y ocultar campos
function cerrarModal() {
  document.getElementById("modalAgregarVenta").style.display = "none";
  document.getElementById("camposVenta").style.display = "none";

  const sugerencias = document.getElementById("sugerenciasArticulos");
  sugerencias.innerHTML = "";
  sugerencias.classList.remove("show");
  sugerencias.style.display = "none";
}

// Buscar artículos para mostrar sugerencias
function buscarArticulo() {
  const query = document.getElementById("busquedaArticulo").value.toLowerCase().trim();
  const articulos = JSON.parse(localStorage.getItem("articulos")) || [];
  const sugerenciasDiv = document.getElementById("sugerenciasArticulos");

  sugerenciasDiv.innerHTML = "";
  sugerenciasDiv.classList.remove("show");
  sugerenciasDiv.style.display = "none";

  if (query === "") return;

  const coincidencias = articulos.filter(a =>
    a.codigo.toString().toLowerCase().includes(query) ||
    a.descripcion.toLowerCase().includes(query)
  );

  if (coincidencias.length === 0) return;

  coincidencias.forEach(articulo => {
    const item = document.createElement("a");
    item.classList.add("dropdown-item");
    item.href = "#";
    item.textContent = `${articulo.codigo} - ${articulo.descripcion}`;
    item.addEventListener("click", (e) => {
      e.preventDefault();
      seleccionarArticulo(articulo);

      sugerenciasDiv.innerHTML = "";
      sugerenciasDiv.classList.remove("show");
      sugerenciasDiv.style.display = "none";
    });
    sugerenciasDiv.appendChild(item);
  });

  sugerenciasDiv.classList.add("show");
  sugerenciasDiv.style.display = "block";
}

// Seleccionar artículo de la lista
function seleccionarArticulo(articulo) {
  document.getElementById("codigo").value = articulo.codigo;
  document.getElementById("descripcion").value = articulo.descripcion;
  document.getElementById("precio").value = parseFloat(articulo.precio).toFixed(2);
  document.getElementById("cantidad").value = 1;
  calcularTotal();

  const ahora = new Date();
  document.getElementById("fechaHora").value = ahora.toLocaleString();

  document.getElementById("camposVenta").style.display = "block";

  const sugerencias = document.getElementById("sugerenciasArticulos");
  sugerencias.innerHTML = "";
  sugerencias.classList.remove("show");
  sugerencias.style.display = "none";
}

// Calcular total según cantidad y precio
function calcularTotal() {
  const cantidad = parseFloat(document.getElementById("cantidad").value) || 0;
  const precio = parseFloat(document.getElementById("precio").value) || 0;
  const total = cantidad * precio;
  document.getElementById("total").value = total.toFixed(2);
}

// Agregar venta a localStorage y actualizar tabla
function agregarVenta(e) {
  e.preventDefault();

  const codigo = document.getElementById("codigo").value;
  const descripcion = document.getElementById("descripcion").value;
  const cantidad = parseFloat(document.getElementById("cantidad").value);
  const precio = parseFloat(document.getElementById("precio").value);
  const total = parseFloat(document.getElementById("total").value);
  const fechaHora = document.getElementById("fechaHora").value;

  if (!codigo || !descripcion || isNaN(cantidad) || isNaN(precio)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  const venta = { codigo, descripcion, cantidad, precio, total, fechaHora };
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  const formVenta = document.getElementById("formVenta");
  const indexEditar = formVenta.dataset.editIndex;

  if (indexEditar !== undefined && indexEditar !== "") {
    ventas[parseInt(indexEditar)] = venta;
    delete formVenta.dataset.editIndex;
    alert("Venta actualizada correctamente.");
  } else {
    ventas.push(venta);
    alert("Venta agregada correctamente.");
  }

  localStorage.setItem("ventas", JSON.stringify(ventas));
  cerrarModal();
  cargarTablaVentas();
}


// Cargar ventas desde localStorage
function cargarTablaVentas() {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  const tbody = document.querySelector("#tablaVentas tbody");
  tbody.innerHTML = "";

  if (ventas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay ventas registradas.</td></tr>`;
    return;
  }

  ventas.forEach((venta, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td>${venta.codigo}</td>
  <td>${venta.descripcion}</td>
  <td>${venta.cantidad}</td>
  <td>${venta.precio.toFixed(2)}</td>
  <td>${venta.total.toFixed(2)}</td>
  <td>${venta.fechaHora}</td>
  <td>
    <div style="display: flex; gap: 6px;">
      <button class="btn btn-info btn-sm" onclick="verArchivos('${venta.codigo}')">👁️ Ver</button>
      <button class="btn btn-warning btn-sm" onclick="editarVenta(${index})">✏️ Editar</button>
      <button class="btn btn-danger btn-sm" onclick="eliminarVenta(${index})">🗑️ Eliminar</button>
    </div>
  </td>
`;


    tbody.appendChild(tr);
  });
}


function verArchivos(codigo) {
  const articulos = JSON.parse(localStorage.getItem("articulos")) || [];
  const articulo = articulos.find(a => a.codigo == codigo);

  if (!articulo || !articulo.archivos || articulo.archivos.length === 0) {
    alert("No hay archivos asociados a este artículo.");
    return;
  }

  // Mostrar carrusel con los archivos
 mostrarCarruselArchivos(articulo.archivos.map(a => a.base64), 0);
}


// Eliminar venta
function eliminarVenta(index) {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  ventas.splice(index, 1);
  localStorage.setItem("ventas", JSON.stringify(ventas));
  cargarTablaVentas();
}

// Cerrar sugerencias al hacer click fuera
document.addEventListener("click", (event) => {
  const input = document.getElementById("busquedaArticulo");
  const sugerencias = document.getElementById("sugerenciasArticulos");

  if (input && sugerencias && !input.contains(event.target) && !sugerencias.contains(event.target)) {
    sugerencias.classList.remove("show");
    sugerencias.style.display = "none";
  }
});

// Inicialización segura al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarTablaVentas();

  const formVenta = document.getElementById("formVenta");
  if (formVenta) {
    formVenta.removeEventListener("submit", agregarVenta);
    formVenta.addEventListener("submit", agregarVenta);
  }

  const inputBusqueda = document.getElementById("busquedaArticulo");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", buscarArticulo);
  }

  const cantidadInput = document.getElementById("cantidad");
  if (cantidadInput) {
    cantidadInput.addEventListener("input", calcularTotal);
  }

  const precioInput = document.getElementById("precio");
  if (precioInput) {
    precioInput.addEventListener("input", calcularTotal);
  }
});


function borrarVentas() {
  if (confirm("¿Estás seguro de que deseas borrar todas las ventas?")) {
    // Elimina las ventas del almacenamiento local
    localStorage.removeItem("ventas");

    // Limpia la tabla en el DOM
    const tbody = document.querySelector("#tablaVentas tbody");
    tbody.innerHTML = "";

    console.log("🔴 Todas las ventas han sido borradas.");
  }
}


function abrirModalVenta() {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  if (ventas.length === 0) {
    alert("No hay productos en la tabla para vender.");
    return;
  }

  const resumenDiv = document.getElementById("resumenVenta");
  resumenDiv.innerHTML = ""; // Limpiar antes

  let totalFinal = 0;

  // Generar contenido dinámico con los artículos en la tabla
  ventas.forEach((venta, index) => {
    const itemHTML = `
      <div style="border-bottom: 1px solid #ccc; padding: 5px 0;">
        <strong>${venta.descripcion}</strong> x${venta.cantidad} -  S/ ${venta.precio.toFixed(2)} 
        = <strong>S/ ${(venta.precio * venta.cantidad).toFixed(2)}</strong>
      </div>
    `;
    totalFinal += venta.precio * venta.cantidad;
    resumenDiv.innerHTML += itemHTML;
  });

  resumenDiv.innerHTML += `<hr><p style="font-size: 18px;"><strong>Total: S/ ${totalFinal.toFixed(2)}</strong></p>`;

  document.getElementById("modalResumenVenta").style.display = "block";
}


function editarVenta(index) {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  const venta = ventas[index];

  const modal = document.getElementById("modalAgregarVenta");
  modal.style.display = "block";

  // Mostrar directamente los campos sin esperar selección
  document.getElementById("camposVenta").style.display = "block";

  // Rellenar los campos directamente
  document.getElementById("codigo").value = venta.codigo;
  document.getElementById("descripcion").value = venta.descripcion;
  document.getElementById("cantidad").value = venta.cantidad;
  document.getElementById("precio").value = venta.precio;
  document.getElementById("total").value = venta.total;
  document.getElementById("fechaHora").value = venta.fechaHora;

  // Limpiar búsqueda y sugerencias (por si acaso)
  document.getElementById("busquedaArticulo").value = "";
  const sugerencias = document.getElementById("sugerenciasArticulos");
  sugerencias.innerHTML = "";
  sugerencias.classList.remove("show");
  sugerencias.style.display = "none";

  // Guardar el índice que se está editando
  document.getElementById("formVenta").dataset.editIndex = index;
}









function procesarVenta() {
  const medioPago = document.getElementById("medioPago").value;
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  if (ventas.length === 0) {
    alert("No hay ventas que procesar.");
    cerrarModalVenta();
    return;
  }

  // Aquí podrías guardar un historial si quieres

  // Limpiar tabla y localStorage
  localStorage.removeItem("ventas");
  document.querySelector("#tablaVentas tbody").innerHTML = "";

  // Cerrar modal
  cerrarModalVenta();

  alert(`Venta procesada exitosamente con medio de pago: ${medioPago.toUpperCase()}`);
}

function cerrarModalVenta() {
  document.getElementById("modalResumenVenta").style.display = "none";
}
