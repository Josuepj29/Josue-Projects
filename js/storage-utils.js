// ===================== UTILIDADES DE ALMACENAMIENTO GLOBAL =====================

// Devuelve el array de dueños y sus mascotas, cada mascota con su historialClinico
function getRegistrosMascotas() {
  return JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
}

// Guarda el array de dueños y mascotas
function setRegistrosMascotas(data) {
  localStorage.setItem('registrosMascotas', JSON.stringify(data));
}

// Busca y devuelve un objeto { mascota, dueño } por NHC (acceso global al historial)
function getMascotaByNHC(nhc) {
  const registros = getRegistrosMascotas();
  for (const dueño of registros) {
    const mascota = (dueño.mascotas || []).find(m => m.NHC === nhc);
    if (mascota) {
      return { 
        mascota,
        dueño
      };
    }
  }
  return null;
}

// Guarda la mascota modificada (historial, archivos, lo que sea) según NHC
function updateMascotaByNHC(nhc, updaterFn) {
  const registros = getRegistrosMascotas();
  for (const dueño of registros) {
    const idx = (dueño.mascotas || []).findIndex(m => m.NHC === nhc);
    if (idx !== -1) {
      // updaterFn recibe la mascota y debe devolver el objeto modificado
      dueño.mascotas[idx] = updaterFn({ ...dueño.mascotas[idx] });
      setRegistrosMascotas(registros);
      return true;
    }
  }
  return false;
}

// (OPCIONAL) Acceso rápido solo al historial clínico de una mascota
function getHistorialClinicoByNHC(nhc) {
  const obj = getMascotaByNHC(nhc);
  return obj?.mascota?.historialClinico || null;
}
