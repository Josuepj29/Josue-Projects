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
      elemento.onclick = () => mostrarArchivoGrande(base64);
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

    let btn;
    if (onDelete) {
      btn = document.createElement('button');
      btn.innerHTML = '&times;';
      btn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: #e74c3c;
        color: #fff;
        border: none;
        width: 33px;
        height: 33px;
        font-size: 14px;
        line-height: 20px;
        border-radius: 50%;
        cursor: pointer;
      `;
      btn.title = 'Eliminar archivo';
      btn.onmouseover = () => btn.style.background = '#c0392b';
      btn.onmouseout = () => btn.style.background = '#e74c3c';
      btn.onclick = (e) => {
        e.stopPropagation();
        onDelete(i);
      };
    }

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:inline-block; position:relative; margin:5px;';
    wrapper.appendChild(elemento);
    if (btn) wrapper.appendChild(btn);

    contenedor.appendChild(wrapper);
  });
}

function mostrarArchivoGrande(base64) {
  let modal = document.getElementById('modalArchivoGrande');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'modalArchivoGrande';
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 99999;
  `;

  let contenido = '';
  if (base64.startsWith('data:image')) {
    contenido = `<img src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:12px; box-shadow:0 0 20px #000;">`;
  } else if (base64.startsWith('data:application/pdf')) {
    try {
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

  modal.onclick = function(e) {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}

function mostrarCarruselArchivos(archivos, indexInicial = 0) {
  if (!archivos || archivos.length === 0) return;

  let modal = document.getElementById('modalCarruselArchivos');
  if (modal) modal.remove();

  let index = indexInicial;

  function render() {
    const base64 = archivos[index];
    let contenido = '';

    if (base64.startsWith('data:image')) {
      contenido = `<img src="${base64}" style="max-width:90vw; max-height:90vh; border-radius:10px; box-shadow:0 0 30px #000;">`;
    } else if (base64.startsWith('data:application/pdf')) {
      try {
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
            <a href="${base64}" download="archivo.pdf" class="btn btn-primary mt-2"
              style="background:#1976d2;border:none;min-width:240px;max-width:220px;width:auto;
              padding: 8px 22px;font-size:1rem;display:inline-block;">Descargar PDF</a>
            <div style="color:white;font-size:16px;margin-top:6px;opacity:.8;">
              Si el PDF no se visualiza, por favor descárguelo.
            </div>
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
        ${index + 1} / ${archivos.length}
      </div>
    `;
  }

  modal = document.createElement('div');
  modal.id = 'modalCarruselArchivos';
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.87);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999999;
  `;

  document.body.appendChild(modal);

  window._carruselPrev = function () {
    index = (index - 1 + archivos.length) % archivos.length;
    render();
  };
  window._carruselNext = function () {
    index = (index + 1) % archivos.length;
    render();
  };

  modal.onclick = function (e) {
    if (e.target === modal) modal.remove();
  };

  render();
}

// Exponer funciones globales
window.mostrarArchivoGrande = mostrarArchivoGrande;
window.mostrarCarruselArchivos = mostrarCarruselArchivos;
