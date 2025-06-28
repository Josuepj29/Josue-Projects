// ========== VISUALIZADOR Y PREVISUALIZADOR UNIVERSAL DE ARCHIVOS ==========

/**
 * Renderiza una previsualización de archivos base64 en un contenedor.
 * @param {Array<string>} archivos - Arreglo de archivos en base64.
 * @param {HTMLElement} contenedor - El elemento donde renderizar los previews.
 * @param {Function} [onDelete] - Callback que recibe el índice del archivo a eliminar.
 */
function renderPreviewArchivos(archivos, contenedor, onDelete) {
  contenedor.innerHTML = '';

  archivos.forEach((base64, i) => {
    let elemento;

    if (base64.startsWith('data:image')) {
      elemento = document.createElement('img');
      elemento.src = base64;
      elemento.className = 'img-thumbnail';
      elemento.style.maxWidth = '150px';
      elemento.style.cursor = 'pointer';
      elemento.title = 'Click para ver grande';
      elemento.onclick = () => mostrarArchivoGrande(base64); // Usa visor universal
    } else if (base64.startsWith('data:video')) {
      elemento = document.createElement('video');
      elemento.src = base64;
      elemento.controls = true;
      elemento.style.maxWidth = '150px';
      elemento.style.cursor = 'pointer';
      elemento.title = 'Click para ver grande';
      elemento.onclick = () => mostrarArchivoGrande(base64);
    } else if (base64.startsWith('data:application/pdf')) {
      elemento = document.createElement('embed');
      elemento.src = base64;
      elemento.type = 'application/pdf';
      elemento.style.width = '150px';
      elemento.style.height = '150px';
      elemento.style.border = '1px solid #ccc';
      elemento.style.cursor = 'pointer';
      elemento.title = 'Click para ver PDF o descargar';
      elemento.onclick = () => mostrarArchivoGrande(base64);
    } else {
      elemento = document.createElement('p');
      elemento.innerText = 'Archivo';
    }

    // Botón eliminar (si aplica)
    let btn;
    if (onDelete) {
      btn = document.createElement('button');
      btn.innerHTML = '&times;';
      btn.style.position = 'absolute';
      btn.style.top = '5px';
      btn.style.right = '5px';
      btn.style.background = '#e74c3c';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.width = '33px';
      btn.style.height = '33px';
      btn.style.fontSize = '14px';
      btn.style.lineHeight = '20px';
      btn.style.borderRadius = '50%';
      btn.style.cursor = 'pointer';
      btn.title = 'Eliminar archivo';
      btn.onmouseover = () => btn.style.background = '#c0392b';
      btn.onmouseout = () => btn.style.background = '#e74c3c';
      btn.onclick = (e) => {
        e.stopPropagation();
        onDelete(i);
      };
    }

    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-block';
    wrapper.style.position = 'relative';
    wrapper.style.margin = '5px';

    wrapper.appendChild(elemento);
    if (btn) wrapper.appendChild(btn);

    contenedor.appendChild(wrapper);
  });
}
//OK
//Ok2
//Ok3

/**
 * Visualizador modal universal para imágenes, PDFs y videos (compatibilidad mejorada para PDF).
 * @param {string} base64 - Archivo en base64.
 */
function mostrarArchivoGrande(base64) {
  // Elimina cualquier modal viejo
  let modal = document.getElementById('modalArchivoGrande');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'modalArchivoGrande';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.cursor = 'pointer';
  modal.style.zIndex = '99999';

  let contenido = '';
  if (base64.startsWith('data:image')) {
    contenido = `<img src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:12px; box-shadow:0 0 20px #000;">`;
  } else if (base64.startsWith('data:application/pdf')) {
    try {
      // Crea Blob URL temporal para iframe (mayor compatibilidad)
      const byteString = atob(base64.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      contenido = `
        <iframe src="${blobUrl}" style="width:90vw; height:90vh; border-radius:12px; background:#333;"></iframe>
        <br>
        <a href="${base64}" download="archivo.pdf" class="btn btn-primary mt-2" style="background:#1976d2;border:none;">Descargar PDF</a>
        <div style="color:white;font-size:16px;margin-top:6px;opacity:.8;">
          Si el PDF no se visualiza, por favor descárguelo para verlo en su visor de escritorio.
        </div>
      `;
    } catch (e) {
      contenido = `
        <div style="color:white;">No se pudo visualizar el PDF, pero puedes descargarlo:</div>
        <a href="${base64}" download="archivo.pdf" class="btn btn-primary mt-2" style="background:#1976d2;border:none;">Descargar PDF</a>
      `;
    }
  } else if (base64.startsWith('data:video')) {
    contenido = `<video src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:12px;" controls autoplay></video>`;
  } else {
    contenido = `<p style="color:white;">Archivo no soportado</p>`;
  }

  modal.innerHTML = `
    <span style="position:absolute;top:24px;right:32px;font-size:44px;color:white;cursor:pointer;z-index:2" onclick="document.getElementById('modalArchivoGrande').remove()">&times;</span>
    <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${contenido}</div>
  `;

  // Cerrar clic fondo
  modal.onclick = function(e) {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}
window.mostrarArchivoGrande = mostrarArchivoGrande;



/**
 * Visualizador modal universal para imágenes grandes.
 * @param {string} src - Imagen en base64.
 */
function mostrarArchivoGrande(base64) {
  // Elimina cualquier modal viejo
  let modal = document.getElementById('modalArchivoGrande');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'modalArchivoGrande';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.cursor = 'pointer';
  modal.style.zIndex = '99999';

  let contenido = '';
  if (base64.startsWith('data:image')) {
    contenido = `<img src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:12px; box-shadow:0 0 20px #000;">`;
  } else if (base64.startsWith('data:application/pdf')) {

    
    contenido = `
      <embed src="${base64}" type="application/pdf" style="width:90vw; height:90vh; border-radius:12px;">
      <br><a href="${base64}" download="archivo.pdf" class="btn btn-primary mt-2" style="background:#1976d2;border:none;">Descargar PDF</a>
    `;
  } else if (base64.startsWith('data:video')) {
    contenido = `<video src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:12px;" controls autoplay></video>`;
  } else {
    contenido = `<p style="color:white;">Archivo no soportado</p>`;
  }

  modal.innerHTML = `
    <span style="position:absolute;top:24px;right:32px;font-size:44px;color:white;cursor:pointer;z-index:2" onclick="document.getElementById('modalArchivoGrande').remove()">&times;</span>
    <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${contenido}</div>
  `;

  // Cerrar clic fondo
  modal.onclick = function(e) {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}
window.mostrarArchivoGrande = mostrarArchivoGrande; // Asegura globalidad
window.mostrarArchivoGrande = mostrarArchivoGrande; // Lo mismo, para compatibilidad





// ARCHIVOS CARRUSEL 

function mostrarCarruselArchivos(archivos, indexInicial = 0) {
  if (!archivos || archivos.length === 0) return;

  // Elimina visor viejo si hay
  let modal = document.getElementById('modalCarruselArchivos');
  if (modal) modal.remove();

  let index = indexInicial;

  function render() {
    let contenido = '';
    const base64 = archivos[index];

    if (base64.startsWith('data:image')) {
      contenido = `<img src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:10px; box-shadow:0 0 30px #000;">`;
    } else if (base64.startsWith('data:application/pdf')) {
      try {
        // Blob URL para compatibilidad
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        contenido = `
          <iframe src="${blobUrl}" style="width:90vw; height:90vh; border-radius:10px; background:#333;"></iframe>
          <br>
          <div style="width:100%;text-align:center;margin-top:10px;">
         <a href="${base64}" download="archivo.pdf"class="btn btn-primary mt-2"
         style="background:#1976d2;border:none;min-width:240px;max-width:220px;width:auto;
         padding: 8px 22px;font-size:1rem;display:inline-block;">Descargar PDF</a>
          <div style="color:white;font-size:16px;margin-top:6px;opacity:.8;">
            Si el PDF no se visualiza, por favor descárguelo.
          </div>
        `;
      } catch (e) {
        contenido = `
          <div style="color:white;">No se pudo visualizar el PDF, pero puedes descargarlo:</div>
          <a href="${base64}" download="archivo.pdf" class="btn btn-primary mt-2" style="background:#1976d2;border:none;">Descargar PDF</a>
        `;
      }
    } else if (base64.startsWith('data:video')) {
      contenido = `<video src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:10px;" controls autoplay></video>`;
    } else {
      contenido = `<p style="color:white;">Archivo no soportado</p>`;
    }

    modal.innerHTML = `
      <span style="position:absolute;top:20px;right:38px;font-size:46px;color:white;cursor:pointer;z-index:2" onclick="document.getElementById('modalCarruselArchivos').remove()">&times;</span>
      <button style="position:absolute;left:25px;top:50%;transform:translateY(-50%);font-size:44px;color:white;background:rgba(0,0,0,0.3);border:none;border-radius:50%;width:55px;height:55px;cursor:pointer;z-index:2;${archivos.length<=1?'display:none;':''}"
        onclick="window._carruselPrev && window._carruselPrev()">&lt;</button>
      <div style="display:flex;align-items:center;justify-content:center;width:100vw;height:100vh;">${contenido}</div>
      <button style="position:absolute;right:25px;top:50%;transform:translateY(-50%);font-size:44px;color:white;background:rgba(0,0,0,0.3);border:none;border-radius:50%;width:55px;height:55px;cursor:pointer;z-index:2;${archivos.length<=1?'display:none;':''}"
        onclick="window._carruselNext && window._carruselNext()">&gt;</button>
      <div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);color:white;font-size:16px;opacity:.95">
        ${index+1} / ${archivos.length}
      </div>
    `;
  }

  modal = document.createElement('div');
  modal.id = 'modalCarruselArchivos';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.87)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.cursor = 'pointer';
  modal.style.zIndex = '999999';
  document.body.appendChild(modal);

  // Navegación
  window._carruselPrev = function() {
    index = (index - 1 + archivos.length) % archivos.length;
    render();
  };
  window._carruselNext = function() {
    index = (index + 1) % archivos.length;
    render();
  };

  // Cerrar al hacer clic fuera del contenido
  modal.onclick = function(e) {
    if (e.target === modal) modal.remove();
  };

  render();
}
window.mostrarCarruselArchivos = mostrarCarruselArchivos;


















/* // Supón que archivosActuales es tu array de base64


const contenedor = document.getElementById('previewArchivos');
renderPreviewArchivos(archivosActuales, contenedor, function (index) {
  archivosActuales.splice(index, 1);
  renderPreviewArchivos(archivosActuales, contenedor, arguments.callee); // Recarga el preview
});


mostrarImagenGrande(base64DeImagen);


*/