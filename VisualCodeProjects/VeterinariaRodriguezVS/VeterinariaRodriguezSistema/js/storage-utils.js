


function getRegistrosMascotas() {
  try {
    return JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
  } catch (e) {
    console.error("Error al parsear registrosMascotas:", e);
    return [];
  }
}



function setRegistrosMascotas(data) {
  localStorage.setItem('registrosMascotas', JSON.stringify(data));
}



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


function updateMascotaByNHC(nhc, updaterFn) {
  const registros = getRegistrosMascotas();
  for (const dueño of registros) {
    const idx = (dueño.mascotas || []).findIndex(m => m.NHC === nhc);
    if (idx !== -1) {
      dueño.mascotas[idx] = updaterFn({ ...dueño.mascotas[idx] });
      setRegistrosMascotas(registros);
      return true;
    }
  }
  return false;
}


function getHistorialClinicoByNHC(nhc) {
  const obj = getMascotaByNHC(nhc);
  return obj?.mascota?.historialClinico || null;
}


function combinarTelefonos(t1, t2) {
  if (t1 && t2 && t1 !== t2) return `${t1} / ${t2}`;
  return t1 || t2 || '';
}
