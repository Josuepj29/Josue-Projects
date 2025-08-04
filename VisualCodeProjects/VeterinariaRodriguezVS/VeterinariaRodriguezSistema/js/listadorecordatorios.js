function limpiarFechaISO(fecha) {
    // Devuelve sólo YYYY-MM-DD o "" si no válido
    if (!fecha) return "";
    if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
        return fecha.slice(0, 10);
    }
    try {
        let d = new Date(fecha);
        if (!isNaN(d)) {
            return d.toISOString().slice(0, 10);
        }
    } catch (e) { }
    return "";
}

function cargarRecordatorios() {
    const tabla = document.getElementById("tablaRecordatorios");
    const inputFecha = document.getElementById("fechaFiltro");
    const fechaSeleccionada = inputFecha?.value;

    tabla.innerHTML = "";

    if (!fechaSeleccionada) {
        tabla.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Selecciona una fecha para buscar.</td></tr>`;
        return;
    }

    const registros = JSON.parse(localStorage.getItem("registrosMascotas")) || [];
    const resultados = [];

    registros.forEach((propietario) => {
        (propietario.mascotas || []).forEach((mascota) => {
            const historialClinico = mascota.historialClinico;

            if (historialClinico && typeof historialClinico === "object") {
                Object.values(historialClinico).forEach((entradas) => {
                    if (Array.isArray(entradas)) {
                        entradas.forEach((entrada) => {
                            const recordatorios = entrada.recordatorios || [];

                            recordatorios.forEach((recordatorio) => {
                                const fechaProxima = recordatorio.fechaProxima;
                                const fechaFormateada = limpiarFechaISO(fechaProxima);

                                if (fechaFormateada === fechaSeleccionada) {
                                    resultados.push({
                                        duenio: propietario.dueño || "-",
                                        telefono: propietario.telefono || "-",
                                        direccion: propietario.direccion || "-",
                                        mascota: mascota.nombre || "-",
                                        tipo: recordatorio.texto || "-",
                                        // Aquí limpiamos ambas fechas:
                                        fechaAplicacion: limpiarFechaISO(recordatorio.fechaInicio) || "-",
                                        fechaRecordatorio: limpiarFechaISO(fechaProxima) || "-"
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    });

    if (resultados.length === 0) {
        tabla.innerHTML = `<tr><td colspan="7" class="text-center">No hay recordatorios para la fecha seleccionada.</td></tr>`;
        return;
    }

    resultados.forEach((r) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${r.duenio}</td>
            <td>${r.telefono}</td>
            <td>${r.direccion}</td>
            <td>${r.mascota}</td>
            <td>${r.tipo}</td>
            <td>${r.fechaAplicacion}</td>
            <td>${r.fechaRecordatorio}</td>
        `;
        tabla.appendChild(row);
    });
}

// Al cargar la página, establecer fecha actual en el input
document.addEventListener("DOMContentLoaded", () => {
    const inputFecha = document.getElementById("fechaFiltro");
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.value = hoy;
});


function exportarTablaAXLSX() {
    const tabla = document.getElementById("tablaRecordatorios");
    const ws = XLSX.utils.table_to_sheet(tabla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recordatorios");
    XLSX.writeFile(wb, "recordatorios.xlsx");
}

document.getElementById("btnExportarCSV").addEventListener("click", exportarTablaAXLSX);
