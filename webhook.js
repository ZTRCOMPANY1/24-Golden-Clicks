import fetch from "node-fetch";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// config do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCPy0-8bD-2ckURSFqC5LaapjfuwfYQX1Y",
  authDomain: "servidorglobal-51830.firebaseapp.com",
  databaseURL: "https://servidorglobal-51830-default-rtdb.firebaseio.com",
  projectId: "servidorglobal-51830",
  storageBucket: "servidorglobal-51830.firebasestorage.app",
  messagingSenderId: "531403003084",
  appId: "1:531403003084:web:bd981d24202df6b79f5e69"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const webhookURL = process.env.WEBHOOK_URL; // você vai colocar isso no Render

// Função para enviar mensagem ao Discord
async function sendMessage(text) {
  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: text
    })
  });
}

// Listener em tempo real
const playersRef = ref(db, "players");

onValue(playersRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;

  // pega todos os players
  const list = Object.values(data);

  // pega top 1
  const top = list.sort((a, b) => b.score - a.score)[0];

  sendMessage(`🏆 **Top Player Atualizado**  
👤 Usuário: **${top.name}**  
⭐ Score: **${top.score}**  
⏰ Atualizado agora!`);
});

// Mantém o processo vivo
setInterval(() => {
  console.log("Webhook rodando...");
}, 60000);
