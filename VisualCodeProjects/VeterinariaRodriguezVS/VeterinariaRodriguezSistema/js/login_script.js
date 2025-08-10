
// ---------- Ventanas de login/register animadas ----------
const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const errorMessage = document.getElementById('loginErrorMessage');
const registerErrorMessage = document.getElementById('registerErrorMessage');

document.querySelectorAll('.register-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper?.classList.add('active');
  });
});
document.querySelectorAll('.login-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper?.classList.remove('active');
  });
});

function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  }
}
function hideError() {
  if (errorMessage) {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
  }
}
function showRegisterError(message) {
  if (registerErrorMessage) {
    registerErrorMessage.textContent = message;
    registerErrorMessage.classList.add('show');
  }
}
function hideRegisterError() {
  if (registerErrorMessage) {
    registerErrorMessage.textContent = '';
    registerErrorMessage.classList.remove('show');
  }
}

// ---------- Usuarios de demo por defecto ----------
const usuariosDemo = [
  { email: "Josue.pj2901@gmail.com", password: "123456", nombre: "Josue", rol: "admin" },
  { email: "Groomer@gmail.com", password: "123456", nombre: "JosueGroomer", rol: "peluquero" },
  { email: "Asistente@gmail.com", password: "123456", nombre: "JosueAsistente", rol: "asistente" }
];
if (!localStorage.getItem("usuarios")) {
  localStorage.setItem("usuarios", JSON.stringify(usuariosDemo));
}

// ---------- Login ----------
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    hideError();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        showError('Por favor, ingrese correo y contraseña.');
        return;
    }
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
        localStorage.setItem("sesionUsuario", JSON.stringify({
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol
        }));
        window.location.href = "principal.html";
    } else {
        showError('Usuario o contraseña incorrectos.');
    }
});

// ---------- Registro ----------
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    hideRegisterError();

    const email = document.getElementById('registerEmail').value.trim();
    const nombre = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const terms = document.getElementById('termsCheckbox').checked;

    if (!terms) {
        showRegisterError('Debes aceptar los términos y condiciones.');
        return;
    }
    if (!email || !nombre || !password) {
        showRegisterError('Completa todos los campos.');
        return;
    }
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    if (usuarios.find(u => u.email === email)) {
      showRegisterError('Ese correo ya está registrado.');
      return;
    }
    const nuevoUsuario = { email, password, nombre, rol: "asistente" }; // por defecto
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("sesionUsuario", JSON.stringify({
      email,
      nombre,
      rol: "asistente"
    }));
    window.location.href = "principal.html";
});

// Olvidó la contraseña: abrir modal
document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('resetPasswordModal').style.display = 'flex';
});

// Cerrar modal
document.getElementById('closeResetModal').addEventListener('click', function() {
  document.getElementById('resetPasswordModal').style.display = 'none';
  document.getElementById('resetPasswordMessage').textContent = "";
  document.getElementById('resetPasswordForm').reset();
});

// Restablecer contraseña
document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value.trim();
  const msg = document.getElementById('resetPasswordMessage');

  // Busca si el correo existe, pero no revela el resultado
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  // Aquí no cambias nada, solo muestras el mensaje
  msg.textContent = "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.";
  msg.style.color = "green";
  setTimeout(() => {
    document.getElementById('resetPasswordModal').style.display = 'none';
    msg.textContent = "";
    document.getElementById('resetPasswordForm').reset();
  }, 3000);
});
