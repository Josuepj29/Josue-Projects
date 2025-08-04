document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".dashboard-card");

  cards.forEach((card, index) => {
    // Animación de entrada
    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "all 0.6s ease";
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }, 100 * index);

    // Sonido al hacer clic
    card.addEventListener("click", () => {
      clickSound.currentTime = 0;
      clickSound.play();
    });

    // Tooltip al pasar el mouse
    const label = card.querySelector("span")?.textContent || "sección";
    card.setAttribute("title", `Ir a ${label}`);
  });

  // Efecto de partículas de fondo
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
});
