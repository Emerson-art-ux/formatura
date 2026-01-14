import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// CONFIGURAÇÃO: URL idêntica à do painel
const firebaseConfig = {
    databaseURL: "https://formatura-mppf-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const palco = document.getElementById('palco');
let listaExibicao = [];
let index = 0;
let timer;

// ESCUTA EM TEMPO REAL: Se mudar no celular, roda aqui
onValue(ref(db, 'playlist'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        console.log("Novas mídias recebidas via Nuvem!");
        listaExibicao = data;
        index = 0;
        const msg = document.getElementById('msg-aguarde');
        if (msg) msg.style.display = 'none';
        iniciarCiclo();
    }
});

function iniciarCiclo() {
    clearTimeout(timer);
    
    // Limpeza de vídeos anteriores
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
        video.oncanplay = () => video.play().catch(e => console.log("Aguardando clique na tela"));
        video.onended = () => proximo();
        palco.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.className = "item-midia active";
        img.src = item.base64;
        palco.appendChild(img);
        
        // Tempo de 5 segundos para fotos
        timer = setTimeout(proximo, 5000);
    }
}

function proximo() {
    if (listaExibicao.length === 0) return;
    index = (index + 1) % listaExibicao.length;
    iniciarCiclo();
}

// Desbloqueio de autoplay: Obrigatório clicar na tela do computador uma vez
window.onclick = () => {
    const v = palco.querySelector('video');
    if (v && v.paused) v.play();
};
