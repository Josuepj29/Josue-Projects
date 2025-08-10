// procesos.js

document.getElementById('formBusqueda').addEventListener('submit', function (e) {
    e.preventDefault();
    buscarMascotas();
});
document.getElementById('cerrarModal').addEventListener('click', cerrarModal);

let mascotaSeleccionada = null;

// Función principal de búsqueda avanzada
function buscarMascotas() {
    // Obtener valores del formulario
    const mascota = document.getElementById('inputMascota').value.trim().toUpperCase();
    const dueno = document.getElementById('inputDueno').value.trim().toUpperCase();
    const telefono = document.getElementById('inputTelefono').value.trim();
    const direccion = document.getElementById('inputDireccion').value.trim().toUpperCase();
    const nhc = document.getElementById('inputNHC').value.trim().toUpperCase();

    // Cargar mascotas desde localStorage
    let todasMascotas = [];
    try {
        // Ajusta el nombre de la clave según tu sistema (por defecto 'mascotas')
        const data = localStorage.getItem('registrosMascotas');
        if (data) {
            todasMascotas = JSON.parse(data);
        }
    } catch (err) {
        console.error('Error cargando mascotas de localStorage:', err);
    }

    // Filtrar mascotas según los campos
    const mascotas = todasMascotas.filter(m =>
        (!mascota || (m.nombre && m.nombre.toUpperCase().includes(mascota))) &&
        (!dueno || (m.propietario && m.propietario.toUpperCase().includes(dueno))) &&
        (!telefono || (m.telefono && m.telefono.includes(telefono))) &&
        (!direccion || (m.direccion && m.direccion.toUpperCase().includes(direccion))) &&
        (!nhc || (m.nhc && m.nhc.toUpperCase().includes(nhc)))
    );

    renderResultados(mascotas);
}

// Muestra los resultados y permite abrir el modal para reportes
function buscarMascotas() {
    // Obtener valores del formulario
    const mascotaInput   = document.getElementById('inputMascota').value.trim().toUpperCase();
    const duenoInput     = document.getElementById('inputDueno').value.trim().toUpperCase();
    const telefonoInput  = document.getElementById('inputTelefono').value.trim();
    const direccionInput = document.getElementById('inputDireccion').value.trim().toUpperCase();
    const nhcInput       = document.getElementById('inputNHC').value.trim().toUpperCase();

    // Cargar dueños desde localStorage
    let todosDueno = [];
    try {
        const data = localStorage.getItem('registrosMascotas');
        if (data) {
            todosDueno = JSON.parse(data);
        }
    } catch (err) {
        console.error('Error cargando datos:', err);
    }

    // Armar lista de mascotas planas, con datos del dueño
    let mascotasPlanas = [];
    todosDueno.forEach(dueno => {
        if (Array.isArray(dueno.mascotas)) {
            dueno.mascotas.forEach(mascota => {
                mascotasPlanas.push({
                    nombre: mascota.nombre || '-',
                    NHC: mascota.NHC || '-',// ajusta si el campo tiene otro nombre
                    propietario: dueno['dueño'] || '-', // nota: campo dueño
                    telefono: combinarTelefonos(dueno.telefono, dueno.telefono2), 
                    direccion: dueno.direccion || '-'
                });
            });
        }
    });

    // Filtrar mascotas según los campos
    const resultado = mascotasPlanas.filter((m, i) => {
    const originalDueno = todosDueno.find(d => (d.mascotas||[]).some(mm => mm.NHC === m.NHC));
    return (
        (!mascotaInput    || m.nombre.toUpperCase().includes(mascotaInput)) &&
        (!duenoInput      || m.propietario.toUpperCase().includes(duenoInput)) &&
        (!telefonoInput   || 
            (originalDueno?.telefono && originalDueno.telefono.includes(telefonoInput)) ||
            (originalDueno?.telefono2 && originalDueno.telefono2.includes(telefonoInput))
        ) &&
        (!direccionInput  || m.direccion.toUpperCase().includes(direccionInput)) &&
        (!nhcInput        || (m.NHC && m.NHC.toUpperCase().includes(nhcInput)))
    );
});
    renderResultados(resultado);
}

function renderResultados(mascotas) {
    const contenedor = document.getElementById('resultados');
    contenedor.innerHTML = '';
    if (!mascotas.length) {
        contenedor.innerHTML = '<p>No se encontraron mascotas.</p>';
        return;
    }
    mascotas.forEach(mascota => {
        const card = document.createElement('div');
        card.className = 'card-mascota';
        card.innerHTML = `
            <div class="info-card">
                <strong>Mascota:</strong> ${mascota.nombre}<br>
                <strong>Propietario:</strong> ${mascota.propietario}<br>
                <strong>Teléfono:</strong> ${mascota.telefono}<br>
                <strong>Dirección:</strong> ${mascota.direccion}<br>
                <strong>NHC:</strong> ${mascota.NHC || '-'}<br>
            </div>
            <button class="btnReporte" data-nhc="${mascota.nhc}">Generar Reporte/Certificado</button>
        `;
        contenedor.appendChild(card);
    });

    document.querySelectorAll('.btnReporte').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nhc = btn.dataset.nhc;
            mascotaSeleccionada = mascotas.find(m => m.nhc === nhc);
            abrirModalReporte();
        });
    });
}


// Muestra el modal para seleccionar el tipo de reporte y completar los campos
function abrirModalReporte() {
    document.getElementById('modalReporte').classList.add('active');
    document.getElementById('formCampos').innerHTML = '';
    document.getElementById('tipoReporte').value = '';

    // Generar campos al seleccionar el formato
    document.getElementById('tipoReporte').onchange = function () {
        generarCamposPorFormato(this.value);
    };
}

function cerrarModal() {
    document.getElementById('modalReporte').classList.remove('active');
}

// Genera dinámicamente los campos para el formato seleccionado
function generarCamposPorFormato(tipo) {
    const form = document.getElementById('formCampos');
    form.innerHTML = '';

    // Ejemplo de estructura base para los formatos
    let campos = [];
    switch (tipo) {
        case "certificado_salud":
            campos = [
                { label: "Fecha", name: "fecha", type: "date" },
                { label: "Observaciones", name: "observaciones", type: "textarea" }
            ];
            break;
        case "certificado_vacunacion":
            campos = [
                { label: "Vacunas aplicadas", name: "vacunas", type: "text" },
                { label: "Fecha", name: "fecha", type: "date" }
            ];
            break;
        case "autorizacion_sedacion":
            campos = [
                { label: "Veterinario responsable", name: "veterinario", type: "text" },
                { label: "Detalle de maniobras", name: "maniobras", type: "textarea" }
            ];
            break;
        default:
            form.innerHTML = '<p>Selecciona un tipo de reporte para continuar.</p>';
            return;
    }

    campos.forEach(campo => {
        let input;
        if (campo.type === "textarea") {
            input = `<textarea name="${campo.name}" placeholder="${campo.label}" required></textarea>`;
        } else {
            input = `<input type="${campo.type}" name="${campo.name}" placeholder="${campo.label}" required>`;
        }
        form.innerHTML += `<label>${campo.label}</label>${input}<br>`;
    });
}

// Botones de exportar (por ahora solo muestran alertas, agrega lógica luego)
document.getElementById('btnExportarPDF').addEventListener('click', () => {
    alert("Función de exportar PDF aún no implementada.");
});

document.getElementById('btnExportarExcel').addEventListener('click', () => {
    alert("Función de exportar Excel aún no implementada.");
});

document.querySelector('.modal-reporte').addEventListener('click', function (e) {
    if (e.target === this) cerrarModal();
});
