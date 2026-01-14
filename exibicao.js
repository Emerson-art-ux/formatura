import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://formatura-506aa-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const palco = document.getElementById('palco');
let listaExibicao = [];
let index = 0;
let timer;

// ESCUTA EM TEMPO REAL: Se mudar no telemóvel, atualiza aqui
onValue(ref(db, 'playlist'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        console.log("Novas mídias recebidas!");
        listaExibicao = data;
        index = 0;
        const msg = document.getElementById('msg-aguarde');
        if (msg) msg.style.display = 'none';
        iniciarCiclo();
    }
});

function iniciarCiclo() {
    clearTimeout(timer);
    
    // Limpeza de vídeos anteriores para não travar o computador
    palco.querySelectorAll('video').forEach(v => {
        v.onended = null; 
        v.pause(); 
        v.removeAttribute('src'); 
        v.load(); 
        v.remove();
    });
    
    palco.innerHTML = ""; 

    if (!listaExibicao || listaExibicao.length === 0) return;
    const item = listaExibicao[index];
    
    if (item.tipo === 'video') {
        const video = document.createElement('video');
        video.className = "item-midia active";
        video.muted = true; 
        video.playsInline = true; 
        video.src = item.base64;
        video.oncanplay = () => video.play().catch(() => console.log("Clique na tela para dar som/play"));
        video.onended = () => proximo();
        palco.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.className = "item-midia active";
        img.src = item.base64;
        palco.appendChild(img);
        
        // Tempo de exibição da foto: 5 segundos
        timer = setTimeout(proximo, 5000);
    }
}

function proximo() {
    if (listaExibicao.length === 0) return;
    index = (index + 1) % listaExibicao.length;
    iniciarCiclo();
}

// Desbloqueio manual (Clique obrigatório no computador da TV)
window.onclick = () => {
    const v = palco.querySelector('video');
    if (v && v.paused) v.play();
};
