document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".dashboard-card");
  cards.forEach((card, index) => {
    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "all 0.6s ease";
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }, 100 * index);
  });
  const clickSound = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      clickSound.currentTime = 0;
      clickSound.play();
    });
  });
  cards.forEach(card => {
    const label = card.querySelector("span").textContent;
    card.setAttribute("title", `Ir a ${label}`);
  });
  tsParticles.load("tsparticles", {
    fullScreen: { enable: true, zIndex: -1 },
    particles: {
      number: { value: 800 },
      color: { value: "#5dade2" },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 0.4,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 10,
        random: { enable: true, minimumValue: 5 },
        anim: {
          enable: true,
          speed: 5,
          size_min: 3,
          sync: false
        }
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: "none",
        random: true,
        straight: false,
        outModes: "out"
      }
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "bubble" },
        onClick: { enable: false }
      },
      modes: {
        bubble: {
          distance: 100,
          size: 20,
          duration: 2,
          opacity: 1
        }
      }
    },
    detectRetina: true
  });
});
