const firebase = require('firebase/compat/app');
require('firebase/compat/database');
const fetch = require('node-fetch'); // npm install node-fetch


// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyCPy0-8bD-2ckURSFqC5LaapjfuwfYQX1Y",
  authDomain: "servidorglobal-51830.firebaseapp.com",
  databaseURL: "https://servidorglobal-51830-default-rtdb.firebaseio.com",
  projectId: "servidorglobal-51830",
  storageBucket: "servidorglobal-51830.firebasestorage.app",
  messagingSenderId: "531403003084",
  appId: "1:531403003084:web:bd981d24202df6b79f5e69"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();



// === Login / Cadastro ===
const loginContainer = document.getElementById("loginContainer");
const gameContainer = document.getElementById("gameContainer");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const logoutButton = document.getElementById("logoutButton");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

let currentUser = null;

registerButton.addEventListener("click", () => {
    const user = usernameInput.value;
    const pass = passwordInput.value;
    if(user && pass){
        if(localStorage.getItem("user_" + user)){
            loginMessage.textContent = "Usuário já existe!";
        } else {
            localStorage.setItem("user_" + user, JSON.stringify({password: pass, score:0, pointsPerClick:1, autoPoints:0}));
            loginMessage.textContent = "Cadastro realizado! Faça login.";
        }
    } else {
        loginMessage.textContent = "Preencha todos os campos!";
    }
});

loginButton.addEventListener("click", () => {
    const user = usernameInput.value;
    const pass = passwordInput.value;
    const data = JSON.parse(localStorage.getItem("user_" + user));
    if(data && data.password === pass){
        currentUser = user;
        loginContainer.style.display = "none";
        gameContainer.style.display = "block";
        loadProgress();
    } else {
        loginMessage.textContent = "Usuário ou senha incorretos!";
    }
});

logoutButton.addEventListener("click", () => {
    saveProgress();
    currentUser = null;
    gameContainer.style.display = "none";
    loginContainer.style.display = "block";
});

// === Game Variables ===
let score = 0;
let pointsPerClick = 1;
let autoPoints = 0;
let upgradeClickCost = 10;
let upgradeAutoCost = 50;
let upgradeMegaCost = 200;

const scoreDisplay = document.getElementById("score");
const clickButton = document.getElementById("clickButton");
const upgradeClickButton = document.getElementById("upgradeClick");
const upgradeAutoButton = document.getElementById("upgradeAuto");
const upgradeMegaButton = document.getElementById("upgradeMega");
const upgradeClickCostDisplay = upgradeClickButton.querySelector(".cost");
const upgradeAutoCostDisplay = upgradeAutoButton.querySelector(".cost");
const upgradeMegaCostDisplay = upgradeMegaButton.querySelector(".cost");
const resetButton = document.getElementById("resetButton");
const progressBar = document.getElementById("progressBar");
const clickSound = document.getElementById("clickSound");
const bgMusic = document.getElementById("bgMusic");

// Volume sliders
const clickVolumeSlider = document.getElementById("clickVolume");
const musicVolumeSlider = document.getElementById("musicVolume");
clickSound.volume = clickVolumeSlider.value;
bgMusic.volume = musicVolumeSlider.value;

clickVolumeSlider.addEventListener("input", () => clickSound.volume = clickVolumeSlider.value);
musicVolumeSlider.addEventListener("input", () => bgMusic.volume = musicVolumeSlider.value);

// Partículas
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function createParticles(x, y){
    for(let i=0; i<10; i++){
        particles.push({
            x: x,
            y: y,
            size: Math.random()*5+2,
            speedX: (Math.random()-0.5)*4,
            speedY: (Math.random()-0.5)*4,
            alpha: 1
        });
    }
}

function handleParticles(){
    for(let i=0; i<particles.length; i++){
        let p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.02;
        if(p.alpha <= 0) particles.splice(i,1);
        else{
            ctx.fillStyle = `rgba(255,255,0,${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fill();
        }
    }
}

function animateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    handleParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// === Game Functions ===
clickButton.addEventListener("click", (e) => {
    score += pointsPerClick;
    animateClick();
    playClickSound();
    createParticles(e.clientX, e.clientY);
    updateScore();
});

upgradeClickButton.addEventListener("click", () => {
    if(score >= upgradeClickCost){
        score -= upgradeClickCost;
        pointsPerClick += 1;
        upgradeClickCost = Math.floor(upgradeClickCost * 1.5);
        updateScore();
        upgradeClickCostDisplay.textContent = upgradeClickCost;
    } else alert("Pontos insuficientes!");
});

upgradeAutoButton.addEventListener("click", () => {
    if(score >= upgradeAutoCost){
        score -= upgradeAutoCost;
        autoPoints += 1;
        upgradeAutoCost = Math.floor(upgradeAutoCost * 1.5);
        updateScore();
        upgradeAutoCostDisplay.textContent = upgradeAutoCost;
    } else alert("Pontos insuficientes!");
});

upgradeMegaButton.addEventListener("click", () => {
    if(score >= upgradeMegaCost){
        score -= upgradeMegaCost;
        pointsPerClick += 5;
        upgradeMegaCost = Math.floor(upgradeMegaCost * 2);
        updateScore();
        upgradeMegaCostDisplay.textContent = upgradeMegaCost;
    } else alert("Pontos insuficientes!");
});

resetButton.addEventListener("click", () => {
    score = 0;
    pointsPerClick = 1;
    autoPoints = 0;
    upgradeClickCost = 10;
    upgradeAutoCost = 50;
    upgradeMegaCost = 200;
    updateScore();
    upgradeClickCostDisplay.textContent = upgradeClickCost;
    upgradeAutoCostDisplay.textContent = upgradeAutoCost;
    upgradeMegaCostDisplay.textContent = upgradeMegaCost;
    saveProgress();
});

// Pontos automáticos
setInterval(() => {
    score += autoPoints;
    updateScore();
},1000);

function updateScore(){
    scoreDisplay.textContent = score;
    const progressPercent = Math.min((score/100)*100,100);
    progressBar.style.width = progressPercent + "%";
    saveProgress();
    saveToFirebase();
}

function animateClick(){
    clickButton.style.transform = "scale(1.2)";
    setTimeout(()=>{clickButton.style.transform="scale(1)";},100);
}

function playClickSound(){
    if(clickSound){
        clickSound.currentTime = 0;
        clickSound.play();
    }
}

function saveProgress(){
    if(currentUser){
        const data = {
            password: JSON.parse(localStorage.getItem("user_" + currentUser)).password,
            score,
            pointsPerClick,
            autoPoints
        };
        localStorage.setItem("user_" + currentUser, JSON.stringify(data));
    }
}

function loadProgress(){
    if(currentUser){
        const data = JSON.parse(localStorage.getItem("user_" + currentUser));
        score = data.score || 0;
        pointsPerClick = data.pointsPerClick || 1;
        autoPoints = data.autoPoints || 0;
        updateScore();
    }
}

// === Firebase Functions ===
function saveToFirebase(){
    if(currentUser){
        database.ref("players/" + currentUser).set({
            score: score
        });
    }
}

function loadGlobalRanking(){
    const rankingList = document.getElementById("rankingList");
    rankingList.innerHTML = "";

    database.ref("players").orderByChild("score").limitToLast(100).once("value", snapshot => {
        const players = [];
        snapshot.forEach(child => {
            players.push({username: child.key, score: child.val().score});
        });
        players.sort((a,b)=>b.score - a.score);
        players.forEach(p=>{
            const li = document.createElement("li");
            li.textContent = `${p.username} - ${p.score} pontos`;
            if(currentUser && p.username === currentUser){
                li.classList.add("currentUser"); // destaca o jogador atual
            }
            rankingList.appendChild(li);
        });
    });
}
