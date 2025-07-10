


function getRegistrosMascotas() {
  return JSON.parse(localStorage.getItem('registrosMascotas') || '[]');
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
