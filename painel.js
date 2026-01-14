import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "firebase-adminsdk-fbsvc@formatura-506aa.iam.gserviceaccount.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let listaArquivos = [];
const input = document.getElementById('f-input');
const feedback = document.getElementById('feedback');
const grid = document.getElementById('grid-fotos');

// Tornar a função disponível para os botões do HTML
window.switchTab = (evt, tabName) => {
    document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
};

input.onchange = async () => {
    const files = Array.from(input.files);
    feedback.innerText = "Processando...";
    for (const file of files) {
        const base64 = await convert64(file);
        const tipo = file.type.startsWith('video') ? 'video' : 'img';
        const item = { id: Date.now() + Math.random(), base64, tipo };
        listaArquivos.push(item);
        renderItem(item);
    }
    feedback.innerText = "Pronto para enviar!";
    document.getElementById('status-vazio').style.display = 'none';
};

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

document.getElementById('btnEnviar').onclick = () => {
    if (listaArquivos.length === 0) return alert("Adicione mídias!");
    feedback.innerText = "Sincronizando com a TV...";
    set(ref(db, 'playlist'), listaArquivos)
        .then(() => alert("TV Atualizada!"))
        .catch(err => alert("Erro: Vídeo muito grande para o Firebase."));
};

const convert64 = file => new Promise(res => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => res(r.result);
});
