import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://formatura-mppf-default-rtdb.firebaseio.com/" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 1. MOVER A FUNÇÃO PARA O TOPO (Resolve o erro de inicialização)
const convert64 = file => new Promise(res => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => res(r.result);
});

let listaArquivos = [];

// 2. FUNÇÃO DE ABAS
window.switchTab = function(evt, tabName) {
    document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

const input = document.getElementById('f-input');
const feedback = document.getElementById('feedback');
const grid = document.getElementById('grid-fotos');

// 3. PROCESSAMENTO DE ARQUIVOS
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
        feedback.innerText = "Tudo pronto para enviar!";
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
    btn.onclick = () => { div.remove(); listaArquivos = listaArquivos.filter(i => i.id !== item.id); };
    div.append(midia, btn);
    grid.appendChild(div);
}

// 4. ENVIO PARA O FIREBASE (Garantindo que o botão existe)
document.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.querySelector('.btn-launch'); // Busca pela classe se o ID falhar
    if(btnEnviar) {
        btnEnviar.onclick = () => {
            if (listaArquivos.length === 0) return alert("Adicione mídias primeiro!");
            feedback.innerText = "Sincronizando com a TV...";
            
            set(ref(db, 'playlist'), listaArquivos)
                .then(() => alert("TV Atualizada com sucesso!"))
                .catch(err => alert("Erro ao enviar: Vídeos muito grandes."));
        };
    }
});

