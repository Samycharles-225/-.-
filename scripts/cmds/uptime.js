module.exports = {
    config: {
        name: "uptime",
        aliases: ["ut"],
        version: "1.3",
        author: "Charles Samy",
        category: "info",
        shortDescription: "Afficher le temps d'activité du bot",
        longDescription: "Montre depuis combien de temps 🌸✨ AESTHER fonctionne.",
    },

    onStart: async function ({ api, event }) {

        const time = process.uptime();
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        return api.sendMessage(
`🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ 💫

『 ⚡ 𝖫𝖾 𝖻𝗈𝗍 𝖿𝗈𝗇𝖼𝗍𝗂𝗈𝗇𝗇𝖾 𝖽𝖾𝗉𝗎𝗂𝗌 :  
🕒 ${hours}𝗁 🕑 ${minutes}𝗆 ⏱️ ${seconds}𝗌 ⚡ 』 💖`,
            event.threadID,
            event.messageID
        );
    }
};
