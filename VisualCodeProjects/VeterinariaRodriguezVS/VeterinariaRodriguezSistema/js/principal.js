const sesion = JSON.parse(localStorage.getItem("sesionUsuario"));
if (!sesion) {
  window.location.href = "login.html";
}

// Permisos de visualización por rol
const permisos = {
  admin: [
    "sala_de_espera.html",
    "peluqueria.html",
    "historia_clinica.html",
    "mvet.html",
    "nuevo.html",
    "listadorecordatorios.html",
    "ventas.html",
    "garticulos.html",
    "procesos.html",
    "facturacion.html"
  ],
  peluquero: [
    "sala_de_espera.html",
    "peluqueria.html"
  ],
  asistente: [
    "sala_de_espera.html",
    "mvet.html",
    "historia_clinica.html"
  ]
};

document.addEventListener("DOMContentLoaded", function () {
  // ... aquí tu código actual (animaciones, partículas, etc.)

  // Ocultar cards según permisos
  const links = document.querySelectorAll(".card-link");
  const permitidos = permisos[sesion.rol] || [];
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!permitidos.includes(href)) {
      link.style.display = "none";
    }
  });

  // Mostrar usuario y rol
  if (document.getElementById("userInfo")) {
    document.getElementById("userInfo").innerHTML = `<b>${sesion.nombre}</b> (${sesion.rol})`;
  }

  // Cerrar sesión
  const btnLogout = document.querySelector(".btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function() {
      localStorage.removeItem("sesionUsuario");
      window.location.href = "login.html";
    });
  }
});




// Mostrar nombre y rol
document.addEventListener("DOMContentLoaded", function () {
  // Mostrar datos de usuario en la cabecera
  if (sesion && document.getElementById("userInfo")) {
    document.getElementById("userInfo").innerHTML = `<b>${sesion.nombre}</b> (${sesion.rol})`;
  }

  // Animación de las tarjetas (igual que antes)
  const cards = document.querySelectorAll(".dashboard-card");
  cards.forEach((card, index) => {
    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "all 0.6s ease";
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }, 100 * index);

    const label = card.querySelector("span")?.textContent || "sección";
    card.setAttribute("title", `Ir a ${label}`);
  });

  // Efecto partículas
  if (typeof tsParticles !== "undefined" && tsParticles?.load) {
    tsParticles.load("tsparticles", {
      fullScreen: { enable: true, zIndex: -1 },
      particles: {
        number: { value: 800 },
        color: { value: "#5dade2" },
        shape: { type: "circle" },
        opacity: { value: 0.1 },
        size: { value: 2 },
        move: { enable: true, speed: 0.3 }
      },
      interactivity: {
        events: { onhover: { enable: false } }
      },
      retina_detect: true
    }).catch(e => console.warn("tsParticles.load falló:", e));
  } else {
    console.warn("tsParticles no está disponible.");
  }

  // ---------- Botón de Cerrar Sesión ----------
  const btnLogout = document.querySelector(".btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function() {
      localStorage.removeItem("sesionUsuario");
      window.location.href = "login.html";
    });
  }

  // ---------- Roles: Solo admin puede ver Gestión de Artículos ----------
  if (sesion.rol !== "admin") {
    const adminArticulos = document.getElementById("adminArticulos");
    if (adminArticulos) adminArticulos.style.display = "none";
  }
});
