const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function showLogin() {
    loginPage.style.display = 'block';
    registerPage.style.display = 'none';
}

function showRegister() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'block';
}

// Load users from localStorage
let users = JSON.parse(localStorage.getItem('users')) || [];

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', username);
        window.location.href = 'dashboard.html'; // Redirect ke dashboard
    } else {
        alert('Invalid username or password!');
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (users.some(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    showLogin();
});
