const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "welcome",
    version: "2.1",
    author: "Saimx69x",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const newUsers = logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    if (newUsers.some(u => u.userFbId === botID)) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;

    // Liste de tes images de fond
    const backgrounds = [
      "https://i.ibb.co/5hT4dK5W/591590664-824856947100070-1507971260693593290-n-jpg-nc-cat-102-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-G59l.jpg",
      "https://i.ibb.co/sdXCWW74/589402649-24991090130562892-264518499823859214-n-jpg-nc-cat-101-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-GDU.jpg",
      "https://i.ibb.co/KxVFVHPW/591707822-793465223669815-424196897577793955-n-jpg-nc-cat-107-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-E-J2.jpg",
      "https://i.ibb.co/Pv0SHMdq/575852278-24815482858124117-9090142435870537324-n-jpg-nc-cat-109-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Gq.jpg",
      "https://i.ibb.co/k2vRrzFF/590394599-1767057837318363-575421139021239884-n-jpg-nc-cat-107-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Hht.jpg"
    ];

    for (const user of newUsers) {
      const userId = user.userFbId;
      const fullName = user.fullName;

      try {
        const timeStr = new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
          hour12: true,
        });

        // Choisir une image de fond aléatoire
        const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        const bgBuffer = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
        const background = await Canvas.loadImage(bgBuffer);

        // Récupérer la photo de profil
        const ppURL = `https://graph.facebook.com/${userId}/picture?height=512&width=512`;
        const ppBuffer = (await axios.get(ppURL, { responseType: "arraybuffer" })).data;
        const avatar = await Canvas.loadImage(ppBuffer);

        // Création du Canvas
        const canvas = Canvas.createCanvas(background.width, background.height);
        const ctx = canvas.getContext("2d");

        // Dessiner le fond
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Dessiner l'avatar au centre
        const avatarSize = 200;
        const x = (canvas.width - avatarSize) / 2;
        const y = (canvas.height - avatarSize) / 2 - 30;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
        ctx.restore();

        // Écrire le nom
        ctx.font = "bold 40px Sans";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(fullName, canvas.width / 2, y + avatarSize + 50);

        // Sauvegarder l'image
        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);
        const imagePath = path.join(tmp, `welcome_${userId}.png`);
        fs.writeFileSync(imagePath, canvas.toBuffer());

        // Envoyer l'image
        await api.sendMessage({
          body:
            `‎𝐇𝐞𝐥𝐥𝐨 ${fullName}\n` +
            `𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ${groupName}\n` +
            `𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 ${memberCount} 𝐦𝐞𝐦𝐛𝐞𝐫 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 🎉\n` +
            `━━━━━━━━━━━━━━━━\n` +
            `📅 ${timeStr}`,
          attachment: fs.createReadStream(imagePath),
          mentions: [{ tag: fullName, id: userId }]
        }, threadID);

        fs.unlinkSync(imagePath);

      } catch (err) {
        console.error("❌ Error sending welcome message:", err);
      }
    }
  }
};
