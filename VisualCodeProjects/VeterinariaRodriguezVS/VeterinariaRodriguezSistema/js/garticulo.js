let filaEditando = null;
let imagenesTemporales = [];

function obtenerUltimoCodigoSeguro() {
  try {
    return parseInt(localStorage.getItem('ultimoCodigo')) || 0;
  } catch (e) {
    console.error("Error obteniendo 'ultimoCodigo':", e);
    return 0;
  }
}

function obtenerArticulosSeguro() {
  try {
    return JSON.parse(localStorage.getItem('articulos')) || [];
  } catch (e) {
    console.error("Error leyendo 'articulos':", e);
    return [];
  }
}


// Abrir el modal
function abrirFormulario() {
  const modal = document.getElementById('modalFormulario');
  modal.style.display = 'block';
  modal.classList.remove('modal-fade-out');
  modal.classList.add('modal-fade-in');

  if (filaEditando === null) {
    document.getElementById('formArticulo').reset();
    imagenesTemporales = []; // limpiamos por si hay basura acumulada
    mostrarVistaPrevia([]);
    
    let ultimoCodigo = parseInt(localStorage.getItem('ultimoCodigo')) || 0;
    ultimoCodigo += 1;
    localStorage.setItem('ultimoCodigo', ultimoCodigo);
    document.getElementById('codigo').value = ultimoCodigo;
    document.getElementById('codigo').readOnly = true;
  } else {
    const articulos = JSON.parse(localStorage.getItem("articulos")) || [];
    const articulo = articulos[filaEditando];
    imagenesTemporales = [...(articulo.archivos || [])];
    mostrarVistaPrevia(imagenesTemporales);
  }
}


// Cerrar el modal
function cerrarFormulario() {
  const modal = document.getElementById('modalFormulario');
  modal.classList.remove('modal-fade-in');
  modal.classList.add('modal-fade-out');

  modal.addEventListener('animationend', function handler() {
    modal.style.display = 'none';
    modal.removeEventListener('animationend', handler);
  });
}

// Agregar artículo
function agregarArticulo() {
  const codigo = document.getElementById("codigo").value;
  const descripcion = document.getElementById("descripcion").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const inputArchivos = document.getElementById("imagenes");
  const archivos = Array.from(inputArchivos.files);

  const lectores = archivos.map((archivo) => {
    return new Promise((resolve) => {
      const lector = new FileReader();
      lector.onload = () => {
        resolve({
          nombre: archivo.name,
          tipo: archivo.type,
          base64: lector.result
        });
      };
      lector.readAsDataURL(archivo);
    });
  });

  Promise.all(lectores).then((archivosProcesados) => {
    // Agrega los nuevos archivos (si los hay) a los temporales
    imagenesTemporales = imagenesTemporales.concat(archivosProcesados);

    let articulos = JSON.parse(localStorage.getItem("articulos")) || [];

    const nuevoArticulo = {
      codigo,
      descripcion,
      precio,
      cantidad,
      archivos: imagenesTemporales // Aquí ya tienes imágenes anteriores + nuevas
    };

    if (filaEditando !== null) {
      articulos[filaEditando] = { ...articulos[filaEditando], ...nuevoArticulo };
      filaEditando = null;
    } else {
      articulos.push(nuevoArticulo);
    }

    localStorage.setItem("articulos", JSON.stringify(articulos));

    cerrarFormulario();
    mostrarArticulos();

    // Limpiar imágenes temporales después de guardar
    imagenesTemporales = [];
  });
}


document.getElementById("imagenes").addEventListener("change", function () {
  const nuevosArchivos = Array.from(this.files);

  const lectores = nuevosArchivos.map((archivo) => {
    return new Promise((resolve) => {
      const lector = new FileReader();
      lector.onload = () => {
        resolve({
          nombre: archivo.name,
          tipo: archivo.type,
          base64: lector.result
        });
      };
      lector.readAsDataURL(archivo);
    });
  });

  Promise.all(lectores).then((archivosProcesados) => {
    imagenesTemporales = imagenesTemporales.concat(archivosProcesados);
    mostrarVistaPrevia(imagenesTemporales);
    this.value = ""; // limpiar selección del input
  });
});



function mostrarVistaPrevia(listaArchivos) {
  const contenedor = document.getElementById("previewImagenes");
  contenedor.innerHTML = "";

  listaArchivos.forEach((archivo, index) => {
    const div = document.createElement("div");
    div.classList.add("preview-item");

    const img = document.createElement("img");
    img.src = archivo.base64;
    img.classList.add("preview-imagen");

    const btnEliminar = document.createElement("button");
    btnEliminar.innerText = "❌";
    btnEliminar.classList.add("btn-eliminar-imagen");
    btnEliminar.onclick = function () {
      imagenesTemporales.splice(index, 1); // eliminar la imagen
      mostrarVistaPrevia(imagenesTemporales); // volver a renderizar
    };

    div.appendChild(img);
    div.appendChild(btnEliminar);
    contenedor.appendChild(div);
  });
}




// Agrega una fila a la tabla
function agregarFilaArticulo(articulo, index) {
  const tabla = document.querySelector('#tablaArticulos tbody');
  const fila = document.createElement('tr');

  fila.innerHTML = `
    <td>${articulo.codigo}</td>
    <td>${articulo.descripcion}</td>
    <td>${parseFloat(articulo.precio).toFixed(2)}</td>
    <td>${articulo.cantidad}</td>
    <td class="acciones-cell">
      <button class="btn btn-warning btn-tabla" onclick="modificarArticulo(${index})">✏️ Modificar</button>
      <button class="btn btn-danger btn-tabla" onclick="eliminarArticulo(${index})">🗑️ Eliminar</button>
      <button class="btn btn-info btn-tabla" onclick="verArchivos(${index})">👁 Ver</button>
    </td>
  `;

  tabla.appendChild(fila);
}

// Mostrar todos los artículos
function mostrarArticulos() {
  const tabla = document.querySelector("#tablaArticulos tbody");
  tabla.innerHTML = "";

  const articulos = JSON.parse(localStorage.getItem("articulos")) || [];
  articulos.forEach((articulo, index) => agregarFilaArticulo(articulo, index));
}

// Ver archivos del artículo
function verArchivos(index) {
  const articulos = JSON.parse(localStorage.getItem("articulos")) || [];
  const articulo = articulos[index];

  if (!articulo || !articulo.archivos || articulo.archivos.length === 0) {
    alert("Este artículo no tiene archivos para mostrar.");
    return;
  }

 mostrarCarruselArchivos(articulo.archivos.map(a => a.base64), 0);
}

// Buscar artículos
function buscarArticulos() {
  const filtroCodigo = document.getElementById('buscarCodigo').value.toLowerCase();
  const filtroDescripcion = document.getElementById('buscarDescripcion').value.toLowerCase();
  const filas = document.querySelectorAll('#tablaArticulos tbody tr');

  filas.forEach(fila => {
    const celdas = fila.getElementsByTagName('td');
    const codigo = celdas[0].textContent.toLowerCase();
    const descripcion = celdas[1].textContent.toLowerCase();

    const coincideCodigo = codigo.includes(filtroCodigo);
    const coincideDescripcion = descripcion.includes(filtroDescripcion);

    fila.style.display = (coincideCodigo && coincideDescripcion) ? '' : 'none';
  });
}

// Modificar artículo
function modificarArticulo(index) {
  const articulos = JSON.parse(localStorage.getItem("articulos")) || [];
  const articulo = articulos[index];

  document.getElementById("codigo").value = articulo.codigo;
  document.getElementById("descripcion").value = articulo.descripcion;
  document.getElementById("precio").value = articulo.precio;
  document.getElementById("cantidad").value = articulo.cantidad;

  document.getElementById("codigo").readOnly = true;
  document.getElementById("descripcion").readOnly = true;

  filaEditando = index;

  // Previsualizar imágenes anteriores
 imagenesTemporales = [...(articulo.archivos || [])];
mostrarVistaPrevia(imagenesTemporales);

  abrirFormulario();
}


// Eliminar artículo
function eliminarArticulo(index) {
  const articulos = JSON.parse(localStorage.getItem("articulos")) || [];
  if (confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
    articulos.splice(index, 1);
    localStorage.setItem("articulos", JSON.stringify(articulos));
    mostrarArticulos();
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formArticulo');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      agregarArticulo();
    });
  }
  mostrarArticulos();
});
