import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "firebase-adminsdk-fbsvc@formatura-506aa.iam.gserviceaccount.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const palco = document.getElementById('palco');
let listaExibicao = [];
let index = 0;
let timer;

// ESCUTA A NUVEM
onValue(ref(db, 'playlist'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        listaExibicao = data;
        index = 0;
        document.getElementById('msg-aguarde').style.display = 'none';
        iniciarCiclo();
    }
});

function iniciarCiclo() {
    clearTimeout(timer);
    palco.innerHTML = ""; 
    if (!listaExibicao.length) return;

    const item = listaExibicao[index];
    if (item.tipo === 'video') {
        const v = document.createElement('video');
        v.className = "item-midia active";
        v.src = item.base64; v.muted = true; v.autoplay = true; v.playsInline = true;
        v.onended = () => proximo();
        palco.appendChild(v);
    } else {
        const img = document.createElement('img');
        img.className = "item-midia active";
        img.src = item.base64;
        palco.appendChild(img);
        timer = setTimeout(proximo, 5000);
    }
}

function proximo() {
    index = (index + 1) % listaExibicao.length;
    iniciarCiclo();
}

// Clique inicial obrigatório no computador
window.onclick = () => {
    const v = document.querySelector('video');
    if (v) v.play();
};
