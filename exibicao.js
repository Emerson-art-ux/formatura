const canal = new BroadcastChannel('canal_tv');
const palco = document.getElementById('palco');
let listaExibicao = [];
let index = 0;
let timer;

// Escuta as mensagens vindas do painel de controle
canal.onmessage = (event) => {
    console.log("Novos dados recebidos");
    listaExibicao = event.data;
    index = 0;
    if (listaExibicao.length > 0) {
        const msg = document.getElementById('msg-aguarde');
        if (msg) msg.style.display = 'none';
        iniciarCiclo();
    }
};

function iniciarCiclo() {
    clearTimeout(timer);
    
    // 1. Limpeza segura dos vídeos anteriores para não travar a memória
    const videosAtivos = palco.querySelectorAll('video');
    videosAtivos.forEach(v => {
        v.onended = null; 
        v.pause();
        v.removeAttribute('src'); 
        v.load();
        v.remove();
    });
    
    palco.innerHTML = ""; // Limpa o palco (fotos ou mensagens)

    if (!listaExibicao || listaExibicao.length === 0) return;

    const item = listaExibicao[index];
    
    if (item.tipo === 'video') {
        const video = document.createElement('video');
        video.className = "item-midia active";
        video.muted = true;
        video.playsInline = true;
        video.src = item.base64;

        // Tenta tocar assim que o navegador confirmar que tem dados suficientes
        video.oncanplay = () => {
            video.play().catch(e => console.log("Aguardando interação do usuário"));
        };

        video.onended = () => proximo();

        palco.appendChild(video);
    } else {
        // Exibição de imagem
        const img = document.createElement('img');
        img.className = "item-midia active";
        img.src = item.base64;
        palco.appendChild(img);
        
        // Tempo padrão para fotos: 5 segundos
        timer = setTimeout(proximo, 5000);
    }
}

function proximo() {
    if (listaExibicao.length === 0) return;
    index = (index + 1) % listaExibicao.length;
    iniciarCiclo();
}

// Liberação de autoplay: cliques na janela ajudam o navegador a autorizar o vídeo
window.onclick = () => {
    const v = palco.querySelector('video');
    if (v && v.paused) v.play();
};