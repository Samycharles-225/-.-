const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞  💖\n";

function formatFont(text) {
  const fontMapping = {
    A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈",
    J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐",
    R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
    1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒", 5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗", 0: "𝟎"
  };
  return text.split('').map(char => fontMapping[char.toUpperCase()] || char).join('');
}

function formatFonts(text) {
  const fontList = {
    a: "𝚊", b: "𝚋", c: "𝚌", d: "𝚍", e: "𝚎", f: "𝚏", g: "𝚐", h: "𝚑",
    i: "𝚒", j: "𝚓", k: "𝚔", l: "𝚕", m: "𝚖", n: "𝚗", o: "𝚘", p: "𝚙",
    q: "𝚚", r: "𝚛", s: "𝚜", t: "𝚝", u: "𝚞", v: "𝚟", w: "𝚠", x: "𝚡",
    y: "𝚢", z: "𝚣", 1: "𝟷", 2: "𝟸", 3: "𝟹", 4: "𝟺", 5: "𝟻", 6: "𝟼",
    7: "𝟽", 8: "𝟾", 9: "𝟿", 0: "𝟶"
  };
  return text.split('').map(char => fontList[char.toLowerCase()] || char).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "1.21",
    author: "Samy Charles",
    countDown: 9,
    role: 0,
    shortDescription: { en: "Show available commands" },
    longDescription: { en: "Display all available commands sorted by category." },
    category: "info",
    guide: { en: ".help [command_name]" },
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = await getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = `｡☆✼★━━━━━━━━━━━━★✼☆｡
            💌 𝙷𝙴𝙻𝙿 𝙼𝙴𝙽𝚄 — 🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ 
｡☆✼★━━━━━━━━━━━━★✼☆｡\n`;

      for (const [name, value] of commands) {
        if (value.config.role > role) continue;

        const category = value.config.category || "𝙉𝙊 𝘾𝘼𝙏𝙀𝙂𝙊𝙍𝙔";
        if (!categories[category]) categories[category] = { commands: [] };

        categories[category].commands.push(name);
      }

      Object.keys(categories).sort().forEach(category => {
        const formattedCategory = formatFont(category.toUpperCase());
        msg += `🌸 〘 ${formattedCategory} 〙\n`;

        const names = categories[category].commands.sort();
        for (const cmd of names) {
          msg += ` ⤷ 💠 ${formatFonts(cmd)}\n`;
        }

        msg += `┈┈┈┈┈┈┈┈┈┈┈┈\n`;
      });

      msg += `✨ Total commandes : ${commands.size}
✧ Tape ( ${prefix}help nom ) pour plus de détails ✧
${doNotDelete}`;

      return message.reply(msg);
    }

    const commandName = args[0].toLowerCase();
    const command =
      commands.get(commandName) ||
      commands.get(aliases.get(commandName));

    if (!command) {
      return message.reply(`🚫 Command "${commandName}" not found.`);
    }

    const config = command.config;
    const usage = (config.guide?.en || "")
      .replace(/{p}/g, prefix)
      .replace(/{n}/g, config.name);

    const response = 
`╭──[ 💖 𝙷𝙴𝙻𝙿 — 🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ ]──╮
🔹 Name : ${config.name}
🔹 Description : ${config.longDescription?.en || "None"}
🔹 Aliases : ${config.aliases?.join(", ") || "None"}
🔹 Version : ${config.version || "1.0"}
🔹 Role : ${config.role}
🔹 Cooldown : ${config.countDown || 2}s
🔹 Author : ${config.author || "Unknown"}
🔸 Usage : ${usage}
╰────────────────────────╯`;

    return message.reply(response);
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (Users)";
    case 1: return "1 (Group Admins)";
    case 2: return "2 (Bot Admins)";
    default: return "Unknown role";
  }
}
