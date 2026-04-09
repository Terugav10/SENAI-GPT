const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

// ⚠️ coloque sua chave aqui (e depois remova do front em produção)
const API_KEY = "Chat gpt audio";

let started = false;

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pergunta = input.value.trim();
    if (!pergunta) return;

    // ativa o chat na primeira mensagem
    if (!started) {
        chatBox.classList.remove("hidden");
        started = true;
    }

    addMsg(pergunta, "user");
    const loadingMsg = addMsg("Carregando...", "bot");
    input.value = "";

    try {
        const res = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + API_KEY
            },
            body: JSON.stringify({
                model: "gpt-5.4-nano",
                input: pergunta
            })
        });

        const data = await res.json();
        const resposta = data.output?.[0]?.content?.[0]?.text || "Erro";

        // Não adicionar o texto da resposta, apenas gerar TTS
        try {
            const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "tts-1",
                    input: resposta,
                    voice: "alloy"
                })
            });

            if (ttsRes.ok) {
                const audioBlob = await ttsRes.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                // Remover mensagem de carregando após iniciar o áudio
                loadingMsg.remove();
            } else {
                console.error("Erro no TTS:", ttsRes.statusText);
                loadingMsg.textContent = "Erro no áudio";
            }
        } catch (ttsErr) {
            console.error("Erro ao gerar TTS:", ttsErr);
            loadingMsg.textContent = "Erro ao gerar áudio";
        }

    } catch (err) {
        loadingMsg.textContent = "Erro na requisição";
        console.error(err);
    }
});