const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

registerLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
    wrapper.classList.remove('active');
});

// --- LOGIN ---

const errorMessage = document.getElementById('loginErrorMessage');

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    hideError();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
        showError('Por favor, ingrese correo y contraseña.');
        return;
    }

    if (!emailRegex.test(email)) {
        showError('Por favor, ingrese un correo electrónico válido.');
        return;
    }

    if (email === 'usuario@ejemplo.com' && password === '123456') {
        alert('Login exitoso');
        window.location.href = 'principal.html';
    } else {
        showError('Usuario o contraseña incorrectos.');
    }
});

// --- REGISTRO ---

const registerForm = document.querySelector('.form-box.register form');
const termsCheckbox = document.getElementById('termsCheckbox');

// Creamos un div para mostrar errores de registro con id
const registerErrorMessage = document.createElement('div');
registerErrorMessage.id = 'registerErrorMessage';
registerErrorMessage.style.marginTop = '10px';
registerForm.appendChild(registerErrorMessage);

function showRegisterError(message) {
    registerErrorMessage.textContent = message;
    registerErrorMessage.classList.add('show');
}

function hideRegisterError() {
    registerErrorMessage.textContent = '';
    registerErrorMessage.classList.remove('show');
}

registerForm.addEventListener('submit', function(event) {
    hideRegisterError();

    if (!termsCheckbox.checked) {
        event.preventDefault();
        showRegisterError('Debes aceptar los términos y condiciones para registrarte.');
    } else {
        // Aquí iría la lógica real de registro o redireccionamiento
        window.location.href = 'principal.html';
    }
});
