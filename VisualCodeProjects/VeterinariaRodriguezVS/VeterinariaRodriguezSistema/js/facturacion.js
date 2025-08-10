// ========== EVENTOS DE LOS BOTONES ==========
document.getElementById('btnDiario').addEventListener('click', () => {
    const fecha = document.getElementById('fechaDia').value;
    if (!fecha) return alert('Selecciona una fecha.');
    generarReporteFacturacion(fecha, fecha);
});
document.getElementById('formReportePeriodo').addEventListener('submit', (e) => {
    e.preventDefault(); // Previene la recarga

    const desde = e.target.desde.value;
    const hasta = e.target.hasta.value;

    if (desde > hasta) {
        alert('La fecha "desde" no puede ser mayor que "hasta".');
        return;
    }

    generarReporteFacturacion(desde, hasta);
    resaltarBotonActivo('btnPeriodo'); // si quieres mantener la clase activa
});


// ========== FUNCIONES DE FECHA Y HORA ==========

function extraerFechaYMD(fechaRaw) {
    if (!fechaRaw) return "";
    // ISO: 2025-08-03T21:39:00.821Z o 2025-08-03T11:11
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaRaw)) {
        return fechaRaw.substring(0, 10);
    }
    // Local: 3/8/2025, 4:02:16 p.m.
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(fechaRaw)) {
        let partes = fechaRaw.split(',');
        let fechaArr = partes[0].trim().split('/');
        if (fechaArr.length === 3) {
            let d = fechaArr[0].padStart(2, '0');
            let m = fechaArr[1].padStart(2, '0');
            let y = fechaArr[2];
            return `${y}-${m}-${d}`;
        }
    }
    return "";
}

function extraerFechaYHora(fechaRaw) {
    if (!fechaRaw) return { fecha: '', hora: '' };

    // ISO: 2025-08-03T21:39:00.821Z o 2025-08-03T11:11
    if (/^\d{4}-\d{2}-\d{2}T/.test(fechaRaw)) {
        const [fecha, horaCompleta] = fechaRaw.split('T');
        if (horaCompleta) {
            let horaMinutos = horaCompleta.match(/^(\d{2}):(\d{2})/);
            if (horaMinutos) return { fecha, hora: `${horaMinutos[1]}:${horaMinutos[2]}` };
        }
        return { fecha, hora: '' };
    }
    // Local: 3/8/2025, 4:15:41 p.m.
    if (/^\d{1,2}\/\d{1,2}\/\d{4},/.test(fechaRaw)) {
        let partes = fechaRaw.split(',');
        let fechaArr = partes[0].trim().split('/');
        let fecha = `${fechaArr[2]}-${fechaArr[1].padStart(2, '0')}-${fechaArr[0].padStart(2, '0')}`;
        let hora = '';
        if (partes[1]) {
            // Extrae la hora con AM/PM y la pasa a 24h
            let match = partes[1].trim().match(/(\d{1,2}):(\d{2})/);
            if (match) {
                let h = parseInt(match[1], 10);
                let m = match[2];
                let ampm = partes[1].toLowerCase().includes('p.m.') ? 'PM' : (partes[1].toLowerCase().includes('a.m.') ? 'AM' : '');
                if (ampm === 'PM' && h !== 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;
                hora = `${String(h).padStart(2, '0')}:${m}`;
            }
        }
        return { fecha, hora };
    }
    // "2025-08-03 20:06:17"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fechaRaw)) {
        let [fecha, horaCompleta] = fechaRaw.split(' ');
        let hm = horaCompleta.substring(0, 5);
        return { fecha, hora: hm };
    }
    // Solo fecha
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaRaw)) {
        return { fecha: fechaRaw, hora: '' };
    }
    return { fecha: fechaRaw, hora: '' };
}

function enRangoFecha(fechaRegistro, desde, hasta) {
    let f = extraerFechaYMD(fechaRegistro);
    return f && f >= desde && f <= hasta;
}

// ========== SOLO MONTOS NUMÉRICOS ==========
function extraerNumero(texto) {
    if (typeof texto === "number") return texto;
    if (!texto) return 0;
    // Busca TODAS las cifras (dígitos, decimales, coma, punto)
    let matches = String(texto).match(/[\d,.]+/g);
    if (!matches) return 0;
    // Suma todas las cifras encontradas
    let suma = 0;
    matches.forEach(val => {
        // Reemplaza la coma por punto solo si no tiene ya punto
        let limpio = val.replace(',', '.');
        let num = parseFloat(limpio);
        if (!isNaN(num)) suma += num;
    });
    return suma;
}



// ========== GENERA EL REPORTE ==========
function generarReporteFacturacion(fechaDesde, fechaHasta) {
    // MVet y Peluquería (tu lógica original)
    let registros = JSON.parse(localStorage.getItem('registrosMascotas')) || [];
    let ingresosMVet = [];
    let ingresosPelu = [];

    registros.forEach(dueno => {
        (dueno.mascotas || []).forEach(mascota => {
            // MVet
            (mascota.historialClinico?.atencionMVet || []).forEach(atencion => {
                if (enRangoFecha(atencion.fecha, fechaDesde, fechaHasta)) {
                    ingresosMVet.push({
                        fecha: extraerFechaYMD(atencion.fecha),
                        hora: extraerHora(atencion.fecha),
                        mascota: mascota.nombre,
                        propietario: dueno['dueño'],
                        concepto: atencion.anamnesis || '(sin detalle)',
                        monto: extraerNumero(atencion.tratamiento)
                    });
                }
            });
            // Peluquería
            (mascota.historialClinico?.peluqueria || []).forEach(servicio => {
                if (enRangoFecha(servicio.fecha, fechaDesde, fechaHasta)) {
                    ingresosPelu.push({
                        fecha: extraerFechaYMD(servicio.fecha),
                        hora: extraerHora(servicio.fecha),
                        mascota: mascota.nombre,
                        propietario: dueno['dueño'],
                        concepto: servicio.anamnesis || '(peluquería)',
                        monto: extraerNumero(servicio.tratamiento)
                    });
                }
            });
        });
    });

    // **Ventas**
    let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    let ingresosVentas = [];
    ventas.forEach(v => {
        if (enRangoFecha(v.fecha, fechaDesde, fechaHasta)) {
            ingresosVentas.push({
                fecha: extraerFechaYMD(v.fecha),
                hora: extraerHora(v.fecha),
                metodo: v.metodo,
                productos: (v.carrito || []).map(i => `${i.nombre} x${i.cantidad}`).join(', '),
                total: extraerNumero(v.total)
            });
        }
    });

    // Renderiza todo junto
    renderTablaFacturacion(ingresosMVet, ingresosPelu, ingresosVentas, fechaDesde, fechaHasta);
}


function extraerHora(fechaRaw) {
    if (!fechaRaw) return "";
    // Si es ISO: 2025-08-07T08:03:17.111Z
    if (/^\d{4}-\d{2}-\d{2}T/.test(fechaRaw)) {
        // Usamos el constructor Date para extraer la hora local
        const d = new Date(fechaRaw);
        if (!isNaN(d)) {
            // Devuelve la hora y minutos en formato HH:MM
            return d.toLocaleTimeString('es-PE', { hour: "2-digit", minute: "2-digit" });
        }
    }
    // Si es local tipo 7/8/2025, 8:04:20 a. m.
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(fechaRaw)) {
        let partes = fechaRaw.split(',');
        let horaAMPM = (partes[1] || '').trim();
        return horaAMPM || "";
    }
    // Si es "2025-08-03 20:06:17"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fechaRaw)) {
        return fechaRaw.slice(11, 16); // HH:MM
    }
    return "";
}




document.getElementById('btnHoy').addEventListener('click', () => {
    const hoy = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    document.getElementById('fechaDia').value = hoy;
    generarReporteFacturacion(hoy, hoy); // Llama al mismo método que el botón "Ver reporte"
});




// ========== RENDERIZA LA TABLA ==========
function renderTablaFacturacion(mvet, pelu, ventas, desde, hasta) {
    const cont = document.getElementById('resultadosFacturacion');
    let totalMVet = mvet.reduce((acc, i) => acc + i.monto, 0);
    let totalPelu = pelu.reduce((acc, i) => acc + i.monto, 0);
    let totalVentas = ventas.reduce((acc, i) => acc + i.total, 0);
    let total = totalMVet + totalPelu + totalVentas;

    cont.innerHTML = `
        <h2>Reporte de ingresos ${desde === hasta ? 'del día ' + desde : `del ${desde} al ${hasta}`}</h2>

        <div class="tabla-zona">
            <h3>Ingresos - Atención Médica (MVet)</h3>
            ${mvet.length ? tablaHTML(mvet, "MVet", totalMVet) : '<p class="vacio">No hay ingresos médicos en este periodo.</p>'}
            <div class="subtotal">Subtotal MVet: <b>S/ ${totalMVet.toFixed(2)}</b></div>
        </div>
        
        <div class="tabla-zona">
            <h3>Ingresos - Peluquería</h3>
            ${pelu.length ? tablaHTML(pelu, "Peluquería", totalPelu) : '<p class="vacio">No hay ingresos de peluquería en este periodo.</p>'}
            <div class="subtotal">Subtotal Peluquería: <b>S/ ${totalPelu.toFixed(2)}</b></div>
        </div>

        <div class="tabla-zona">
            <h3>Ingresos - Ventas</h3>
            ${ventas.length ? tablaVentasHTML(ventas, totalVentas) : '<p class="vacio">No hay ventas en este periodo.</p>'}
            <div class="subtotal">Subtotal Ventas: <b>S/ ${totalVentas.toFixed(2)}</b></div>
        </div>

        <div class="total-final">Ingreso Total: <b>S/ ${total.toFixed(2)}</b></div>
    `;
}

function tablaHTML(arr, titulo, subtotal) {
    return `
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Mascota</th>
                <th>Propietario</th>
                <th>Concepto</th>
                <th>Monto</th>
            </tr>
        </thead>
        <tbody>
            ${arr.map(item => `
                <tr>
                    <td>${item.fecha || ''}</td>
                    <td>${item.hora || ''}</td>
                    <td>${item.mascota || ''}</td>
                    <td>${item.propietario || ''}</td>
                    <td title="${item.concepto || ''}">
                        ${acortarTextoPalabra(item.concepto || '', 25)}
                    </td>
                    <td>S/ ${item.monto > 0 ? item.monto.toFixed(2) : '-'}</td>
                </tr>
            `).join('')}
            <tr>
                <td colspan="5" style="font-weight:bold;text-align:right;">Subtotal ${titulo}:</td>
                <td style="font-weight:bold;">S/ ${subtotal.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    `;
}

function tablaVentasHTML(arr, subtotal) {
    return `
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Método</th>
                <th>Productos</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${arr.map(item => `
                <tr>
                    <td>${item.fecha || ''}</td>
                    <td>${item.hora || ''}</td>
                    <td>${item.metodo || ''}</td>
                    <td>${item.productos || ''}</td>
                    <td>S/ ${item.total > 0 ? item.total.toFixed(2) : '-'}</td>
                </tr>
            `).join('')}
            <tr>
                <td colspan="4" style="font-weight:bold;text-align:right;">Subtotal Ventas:</td>
                <td style="font-weight:bold;">S/ ${subtotal.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    `;
}



function acortarTextoPalabra(texto, max = 25) {
    if (!texto) return '';
    if (texto.length <= max) return texto;
    let corto = texto.slice(0, max);
    // Si el corte cayó a mitad de palabra, retrocede hasta el último espacio
    let ultimoEspacio = corto.lastIndexOf(' ');
    if (ultimoEspacio > 15) { // No te deja con textos ridículamente cortos
        corto = corto.slice(0, ultimoEspacio);
    }
    return corto + '…';
}


function formatoFechaISO(fecha) {
    // Devuelve yyyy-mm-dd local (sin UTC)
    const d = new Date(fecha);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getMonday(d) {
    d = new Date(d);
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes (1)
    return new Date(d.setDate(diff));
}


// 1. Lista de IDs de los botones rápidos
const botonesRapidos = ['btnHoy', 'btnDiario', 'btnSemanal', 'btnMensual', 'btnAnual', 'btnPeriodo'];

// 2. Función para iluminar solo el activo
function resaltarBotonActivo(id) {
    botonesRapidos.forEach(bid => {
        const b = document.getElementById(bid);
        if (b) b.classList.remove('boton-activo');
    });
    const btn = document.getElementById(id);
    if (btn) btn.classList.add('boton-activo');
}

// 3. Al hacer clic en cada botón, llama a la función
document.getElementById('btnHoy').onclick = function () {
    const hoy = new Date().toISOString().slice(0, 10);
    document.getElementById('fechaDia').value = hoy;
    generarReporteFacturacion(hoy, hoy);
    resaltarBotonActivo('btnHoy');
};
document.getElementById('btnDiario').onclick = function () {
    const fecha = document.getElementById('fechaDia').value;
    if (!fecha) return alert('Selecciona una fecha.');
    generarReporteFacturacion(fecha, fecha);
    resaltarBotonActivo('btnDiario');
};
document.getElementById('btnSemanal').onclick = function () {
    const hoy = new Date();
    const lunes = getMonday(hoy);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    document.getElementById('fechaDesde').value = formatoFechaISO(lunes);
    document.getElementById('fechaHasta').value = formatoFechaISO(domingo);
    generarReporteFacturacion(formatoFechaISO(lunes), formatoFechaISO(domingo));
    resaltarBotonActivo('btnSemanal');
};
document.getElementById('btnMensual').onclick = function () {
    const hoy = new Date();
    const año = hoy.getFullYear(), mes = hoy.getMonth();
    const desde = new Date(año, mes, 1);
    const hasta = new Date(año, mes + 1, 0);
    document.getElementById('fechaDesde').value = formatoFechaISO(desde);
    document.getElementById('fechaHasta').value = formatoFechaISO(hasta);
    generarReporteFacturacion(formatoFechaISO(desde), formatoFechaISO(hasta));
    resaltarBotonActivo('btnMensual');
};
document.getElementById('btnAnual').onclick = function () {
    const hoy = new Date();
    const año = hoy.getFullYear();
    document.getElementById('fechaDesde').value = `${año}-01-01`;
    document.getElementById('fechaHasta').value = `${año}-12-31`;
    generarReporteFacturacion(`${año}-01-01`, `${año}-12-31`);
    resaltarBotonActivo('btnAnual');
};
document.getElementById('btnPeriodo').onclick = function () {
    const desde = document.getElementById('fechaDesde').value;
    const hasta = document.getElementById('fechaHasta').value;
    if (!desde || !hasta) return alert('Completa ambas fechas.');
    if (desde > hasta) return alert('La fecha "desde" no puede ser mayor que "hasta".');
    generarReporteFacturacion(desde, hasta);
    resaltarBotonActivo('btnPeriodo');
};


document.getElementById('btnExportarExcel').addEventListener('click', function() {
    const tablas = document.querySelectorAll('.tabla-zona table');
    if (tablas.length < 3) return alert("No hay datos para exportar.");

    const tablaMVet = tablas[0];
    const tablaPelu = tablas[1];
    const tablaVentas = tablas[2];

    // SheetJS: convierte cada tabla a array de arrays (incluye subtotales)
    const datosMVet = XLSX.utils.table_to_sheet(tablaMVet);
    const datosPelu = XLSX.utils.table_to_sheet(tablaPelu);
    const datosVentas = XLSX.utils.table_to_sheet(tablaVentas);

    const arrMVet = XLSX.utils.sheet_to_json(datosMVet, { header:1 });
    const arrPelu = XLSX.utils.sheet_to_json(datosPelu, { header:1 });
    const arrVentas = XLSX.utils.sheet_to_json(datosVentas, { header:1 });

    // Títulos de cada sección
    arrMVet.unshift(["Ingresos - Atención Médica (MVet)"]);
    arrPelu.unshift(["Ingresos - Peluquería"]);
    arrVentas.unshift(["Ingresos - Ventas"]);

    // Extrae subtotales de la última fila de cada tabla
    let totalMVet = 0, totalPelu = 0, totalVentas = 0;
    try {
        totalMVet = parseFloat(tablaMVet.rows[tablaMVet.rows.length-1].cells[1].innerText.replace('S/','').replace(',','.')) || 0;
    } catch(e) {}
    try {
        totalPelu = parseFloat(tablaPelu.rows[tablaPelu.rows.length-1].cells[1].innerText.replace('S/','').replace(',','.')) || 0;
    } catch(e) {}
    try {
        totalVentas = parseFloat(tablaVentas.rows[tablaVentas.rows.length-1].cells[1].innerText.replace('S/','').replace(',','.')) || 0;
    } catch(e) {}

    let totalGeneral = (totalMVet + totalPelu + totalVentas).toFixed(2);
    const filaTotalGeneral = ["", "", "", "", "TOTAL GENERAL:", `S/ ${totalGeneral}`];

    // Arma todo en un solo array (una sola hoja)
    const arrFinal = [
        ...arrMVet,
        [],
        [],
        ...arrPelu,
        [],
        [],
        ...arrVentas,
        [],
        filaTotalGeneral
    ];

    // Exporta a Excel
    const ws = XLSX.utils.aoa_to_sheet(arrFinal);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturación");
    XLSX.writeFile(wb, "reporte_facturacion.xlsx");
});



document.getElementById("btnExportarPDF").addEventListener("click", function () {
    // Puedes exportar todo el contenedor de resultados o solo la tabla
    const elemento = document.getElementById("resultadosFacturacion");
    if (!elemento) {
        alert("No hay contenido para exportar.");
        return;
    }
    html2pdf()
        .from(elemento)
        .set({
            margin: [0.3, 0.3, 0.3, 0.3],
            filename: 'reporte_facturacion.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'landscape', unit: 'in', format: 'a4' }
        })
        .save();
});
