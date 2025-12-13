const OWNER_UID = "61582382664051"; // 👑 Samy Charles
const COOLDOWN_TIME = 2 * 60 * 1000; // 2 minutes
const SEND_DELAY = 1500; // 1.5s entre chaque groupe
const cooldown = new Map();

module.exports = {
  config: {
    name: "noti",
    aliases: ["notif", "announce"],
    version: "2.0.0",
    author: "Samy Charles",
    role: 0,
    category: "group",
    shortDescription: "Notification globale AESTHER 🌸✨",
    longDescription: "Diffuse un message stylé dans tous les groupes où le bot est présent",
    guide: {
      en: "{p}noti <message>"
    }
  },

  onStart: async function ({ api, event, args, message }) {

    // 👑 OWNER CHECK
    if (event.senderID !== OWNER_UID) {
      return message.reply(
        "⛔ ACCÈS REFUSÉ\n\n" +
        "🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ :\n" +
        "Cette commande est réservée à **Samy Charles** 👑"
      );
    }

    // ⏱️ COOLDOWN
    const now = Date.now();
    if (cooldown.has(event.senderID)) {
      const last = cooldown.get(event.senderID);
      if (now - last < COOLDOWN_TIME) {
        const wait = Math.ceil((COOLDOWN_TIME - (now - last)) / 1000);
        return message.reply(`⏳ Patiente ${wait}s avant une nouvelle notification 🌸`);
      }
    }
    cooldown.set(event.senderID, now);

    const text = args.join(" ");
    if (!text) {
      return message.reply(
        "🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ :\n" +
        "💌 Écris le message à diffuser"
      );
    }

    api.setMessageReaction("📢", event.messageID, () => {}, true);

    // 📥 Récupération des groupes
    const threads = await api.getThreadList(100, null, ["INBOX"]);
    const groups = threads.filter(t => t.isGroup);

    if (groups.length === 0) {
      return message.reply(
        "❌ Aucun groupe trouvé."
      );
    }

    let success = 0;
    let failed = 0;

    const finalMessage =
`🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞  :

📢 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡

${text}

💖 — Samy Charles 👑`;

    for (const group of groups) {
      try {
        await api.sendMessage(finalMessage, group.threadID);
        success++;
        await new Promise(res => setTimeout(res, SEND_DELAY));
      } catch (e) {
        failed++;
      }
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    return message.reply(
      "🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ :\n\n" +
      `📊 Diffusion terminée\n\n` +
      `✅ Groupes envoyés : ${success}\n` +
      `❌ Échecs : ${failed}\n\n` +
      `💖 Notification signée Samy Charles 👑`
    );
  }
};
