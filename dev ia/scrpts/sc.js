const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

// ⚠️ coloque sua chave aqui (e depois remova do front em produção)
const API_KEY = "CHAVE API GPT";

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

        addMsg(resposta, "bot");

    } catch (err) {
        addMsg("Erro na requisição", "bot");
        console.error(err);
    }
});