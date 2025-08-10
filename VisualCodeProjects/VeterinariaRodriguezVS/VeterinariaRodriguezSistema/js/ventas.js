let carrito = [];
let indexEditando = null;

// ========== CARGA ARTÍCULOS AL SELECT ==========
function cargarArticulosEnSelect() {
  const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
  const select = document.getElementById('selectArticulo');
  select.innerHTML = '<option value="" disabled selected>Selecciona artículo</option>';
  articulos.forEach(art => {
    if (art.cantidad > 0) {
      select.innerHTML += `<option value="${art.codigo}" data-precio="${art.precio}" data-stock="${art.cantidad}">${art.descripcion} (Stock: ${art.cantidad})</option>`;
    }
  });
}

// ========== AGREGAR AL CARRITO ==========
document.getElementById('formAgregarArticulo').addEventListener('submit', function (e) {
  e.preventDefault();
  const select = document.getElementById('selectArticulo');
  const codigo = select.value;
  const nombre = select.options[select.selectedIndex]?.text?.split(' (')[0] || '';
  const precio = parseFloat(select.options[select.selectedIndex]?.dataset?.precio || 0);
  const stock = parseInt(select.options[select.selectedIndex]?.dataset?.stock || 0);
  const cantidad = parseInt(document.getElementById('cantidadArticulo').value);

  if (!codigo || cantidad < 1 || cantidad > stock) {
    alert('Cantidad inválida o sin stock.');
    return;
  }

  const idx = carrito.findIndex(i => i.codigo == codigo);
  if (idx >= 0) {
    if (carrito[idx].cantidad + cantidad > stock) {
      alert('No hay suficiente stock.');
      return;
    }
    carrito[idx].cantidad += cantidad;
  } else {
    const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
    const articulo = articulos.find(a => String(a.codigo) === String(codigo));
    carrito.push({ codigo, nombre, precio, cantidad, stock, archivos: articulo?.archivos || [] });
  }
  this.reset();
  renderCarrito();
});

// ========== RENDERIZA EL CARRITO ==========
function renderCarrito() {
  const tbody = document.querySelector('#tablaCarrito tbody');
  tbody.innerHTML = '';
  let total = 0;
  carrito.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>S/ ${item.precio.toFixed(2)}</td>
      <td>S/ ${subtotal.toFixed(2)}</td>
      <td class="acciones-cell">
        <button class="btn-blue btn-tabla" onclick="modificarArticuloVenta(${i})">Modificar</button>
        <button class="btn-red btn-tabla" onclick="eliminarDelCarrito(${i})">Eliminar</button>
        <button class="btn-blue btn-tabla" onclick="verArchivoArticulo(${i})">Ver</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('totalVenta').innerHTML = `<span class="total-derecha">Total: <b>S/ ${total.toFixed(2)}</b></span>`;
  document.getElementById('btnPagar').disabled = carrito.length === 0;
}

// ========== MODIFICAR ARTÍCULO EN MODAL ==========
window.modificarArticuloVenta = function (i) {
  const item = carrito[i];
  indexEditando = i;
  document.getElementById('editCodigo').value = item.codigo;
  document.getElementById('editDescripcion').value = item.nombre;
  document.getElementById('editCantidad').value = item.cantidad;
  document.getElementById('editPrecio').value = item.precio;
  document.getElementById('modalEditarVenta').style.display = 'block';
};

document.getElementById('formEditarVenta').onsubmit = function(e) {
  e.preventDefault();
  const nuevaCantidad = parseInt(document.getElementById('editCantidad').value);
  const nuevoPrecio = parseFloat(document.getElementById('editPrecio').value);
  if (nuevaCantidad < 1 || isNaN(nuevoPrecio) || nuevoPrecio < 0) {
    alert('Datos inválidos');
    return;
  }
  // Buscar el stock real disponible
  const codigo = document.getElementById('editCodigo').value;
  const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
  const articulo = articulos.find(a => String(a.codigo) === String(codigo));
  const stockDisponible = articulo ? parseInt(articulo.cantidad) : 0;

  // Validar stock
  if (nuevaCantidad > stockDisponible) {
    alert(`No hay suficiente stock. Solo hay ${stockDisponible} unidades disponibles.`);
    return;
  }
  carrito[indexEditando].cantidad = nuevaCantidad;
  carrito[indexEditando].precio = nuevoPrecio;
  renderCarrito();
  cerrarModalEditarVenta();
};




window.cerrarModalEditarVenta = function() {
  document.getElementById('modalEditarVenta').style.display = 'none';
  indexEditando = null;
};

// ========== ELIMINAR DEL CARRITO CON CONFIRMACIÓN ==========
window.eliminarDelCarrito = function(i) {
  if (confirm("¿Seguro que quieres eliminar este artículo del carrito?")) {
    carrito.splice(i, 1);
    renderCarrito();
  }
};

// ========== VER ARCHIVO/FOTO DEL ARTÍCULO (usa tu carrusel) ==========
window.verArchivoArticulo = function(i) {
  const archivos = carrito[i]?.archivos || [];
  if (!archivos.length) return alert("Sin archivo asociado");
  // Si archivos son [{base64, ...}]
  mostrarCarruselArchivos(archivos.map(a => a.base64), 0);
};

// ========== PAGAR: MUESTRA MODAL DE CONFIRMACIÓN ==========
document.getElementById('btnPagar').onclick = function () {
  renderResumenVenta();
  document.getElementById('modalPago').style.display = 'block';
};





function renderResumenVenta() {
  let html = '<ul>';
  let total = 0;
  carrito.forEach(item => {
    const subt = item.precio * item.cantidad;
    html += `
      <li>
        <span class="nombre-articulo">${item.nombre} <span style="color:#666;font-weight:400;">x${item.cantidad}</span></span>
        <span style="color:#2196f3;">S/ ${subt.toFixed(2)}</span>
      </li>`;
    total += subt;
  });
  html += `</ul>
    <span class="res-total">Total: S/ ${total.toFixed(2)}</span>
  `;
  document.getElementById('resumenVenta').innerHTML = html;
}


// ========== CONFIRMAR Y PAGAR ==========
document.getElementById('btnConfirmarPago').onclick = function () {
  const metodo = document.getElementById('metodoPago').value;
  if (!metodo) {
    alert('Selecciona método de pago');
    return;
  }
  
  // --- CONFIRMACIÓN DE COBRO ---
  if (!confirm('¿Estás seguro de realizar el cobro y finalizar la venta?')) {
    return; // Si cancela, no sigue el proceso
  }


  // --- GUARDAR LA VENTA EN HISTORIAL ---
  let historialVentas = JSON.parse(localStorage.getItem('ventas')) || [];
  historialVentas.push({
    fecha: new Date().toISOString(),
    carrito: JSON.parse(JSON.stringify(carrito)), // copia profunda
    metodo: metodo,
    total: carrito.reduce((acc, i) => acc + i.cantidad * i.precio, 0)
  });
  localStorage.setItem('ventas', JSON.stringify(historialVentas));
  // --------------------------------------

  // Actualiza stock de los artículos en localStorage
  let articulos = JSON.parse(localStorage.getItem('articulos')) || [];
  carrito.forEach(item => {
    const art = articulos.find(a => String(a.codigo) === String(item.codigo));
    if (art) art.cantidad -= item.cantidad;
  });
  localStorage.setItem('articulos', JSON.stringify(articulos));
  cerrarModalPago();
  carrito = [];
  renderCarrito();
  cargarArticulosEnSelect();
  alert("¡Venta realizada correctamente!");
};


window.cerrarModalPago = function() {
  document.getElementById('modalPago').style.display = 'none';
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function () {
  cargarArticulosEnSelect();
  renderCarrito();
});
