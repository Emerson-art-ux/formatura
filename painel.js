// Importação do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// CONFIGURAÇÃO: Cole a sua URL aqui
const firebaseConfig = {
    databaseURL: "https://console.firebase.google.com/u/0/project/formatura-506aa/firestore/databases/-default-/data" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let listaArquivos = [];
const input = document.getElementById('f-input');
const feedback = document.getElementById('feedback');
const grid = document.getElementById('grid-fotos');
const statusVazio = document.getElementById('status-vazio');

function switchTab(evt, tabName) {
    const contents = document.getElementsByClassName("content");
    for (let i = 0; i < contents.length; i++) contents[i].classList.remove("active");
    const tabs = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

input.onchange = async () => {
    const files = Array.from(input.files);
    if (files.length === 0) return;
    feedback.innerText = `Processando ${files.length} ficheiros...`;
    feedback.style.color = "var(--accent)";

    for (const file of files) {
        const base64 = await convert64(file);
        const tipo = file.type.startsWith('video') ? 'video' : 'img';
        const id = Date.now() + Math.random();
        const item = { id, base64, tipo };
        listaArquivos.push(item);
        renderItem(item);
    }
    feedback.innerText = `Concluído! ${files.length} itens prontos.`;
    feedback.style.color = "var(--success)";
    statusVazio.style.display = 'none';
    input.value = ""; 
};

function renderItem(item) {
    const div = document.createElement('div');
    div.className = 'foto-card';
    div.id = `card-${item.id}`;
    let midia = item.tipo === 'video' ? document.createElement('video') : document.createElement('img');
    midia.src = item.base64;
    if (item.tipo === 'video') {
        midia.muted = true;
        const badge = document.createElement('div');
        badge.className = 'video-badge';
        badge.innerText = 'VÍDEO';
        div.appendChild(badge);
    }
    const btn = document.createElement('button');
    btn.className = 'remove-btn';
    btn.innerHTML = '&times;';
    btn.onclick = () => {
        listaArquivos = listaArquivos.filter(i => i.id !== item.id);
        div.remove();
        if(listaArquivos.length === 0) statusVazio.style.display = 'block';
    };
    div.appendChild(midia);
    div.appendChild(btn);
    grid.appendChild(div);
}

// FUNÇÃO ATUALIZADA: Agora envia para o Celular/TV via Nuvem
window.enviarParaTV = function() {
    if (listaArquivos.length === 0) return alert("Adicione mídias primeiro!");
    feedback.innerText = "Sincronizando com a TV...";
    
    set(ref(db, 'playlist'), listaArquivos)
    .then(() => {
        alert("Enviado para a nuvem! A TV atualizará sozinha.");
        feedback.innerText = "Sincronizado com sucesso!";
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao enviar. Verifique o tamanho do vídeo.");
    });
}

const convert64 = file => new Promise((resolve) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result);
});

