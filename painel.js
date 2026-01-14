import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// URL corrigida baseada na sua Imagem 4
const firebaseConfig = {
    databaseURL: "https://formatura-mppf-default-rtdb.firebaseio.com/" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// MOVIDO PARA O TOPO: Resolve o erro de inicialização (Imagem 3)
const convert64 = file => new Promise(res => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => res(r.result);
});

let listaArquivos = [];

// FUNÇÃO DE ABAS: Disponível globalmente
window.switchTab = function(evt, tabName) {
    document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

const input = document.getElementById('f-input');
const feedback = document.getElementById('feedback');
const grid = document.getElementById('grid-fotos');

if(input) {
    input.onchange = async () => {
        const files = Array.from(input.files);
        if (files.length === 0) return;
        
        feedback.innerText = "Processando mídias...";
        
        for (const file of files) {
            const base64 = await convert64(file);
            const tipo = file.type.startsWith('video') ? 'video' : 'img';
            const item = { id: Date.now() + Math.random(), base64, tipo };
            listaArquivos.push(item);
            renderItem(item);
        }
        feedback.innerText = "Mídias prontas!";
        const statusVazio = document.getElementById('status-vazio');
        if(statusVazio) statusVazio.style.display = 'none';
    };
}

function renderItem(item) {
    const div = document.createElement('div');
    div.className = 'foto-card';
    let midia = item.tipo === 'video' ? document.createElement('video') : document.createElement('img');
    midia.src = item.base64;
    const btn = document.createElement('button');
    btn.className = 'remove-btn'; btn.innerHTML = '&times;';
    btn.onclick = () => { 
        div.remove(); 
        listaArquivos = listaArquivos.filter(i => i.id !== item.id);
        if(listaArquivos.length === 0) document.getElementById('status-vazio').style.display = 'block';
    };
    div.append(midia, btn);
    grid.appendChild(div);
}

// ENVIO PARA O FIREBASE: Resolve o erro de 'null setting onclick'
window.enviarParaTV = function() {
    if (listaArquivos.length === 0) return alert("Adicione mídias primeiro!");
    
    feedback.innerText = "Enviando para a nuvem...";
    feedback.style.color = "orange";
    
    set(ref(db, 'playlist'), listaArquivos)
        .then(() => {
            alert("TV Atualizada!");
            feedback.innerText = "Sincronizado!";
            feedback.style.color = "green";
        })
        .catch(err => {
            console.error(err);
            alert("Erro: Mídia muito pesada para o banco de dados.");
        });
};

