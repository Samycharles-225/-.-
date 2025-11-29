const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "1.7",
        author: "SAMY-CHARLES",
        category: "events"
    },

    langs: {  
        vi: {  
            session1: "sáng",  
            session2: "trưa",  
            session3: "chiều",  
            session4: "tối",  
            welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",  
            multiple1: "bạn",  
            multiple2: "các bạn",  
            defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"  
        },  
        en: {  
            session1: "morning",  
            session2: "noon",  
            session3: "afternoon",  
            session4: "evening",  
            welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",  
            multiple1: "you",  
            multiple2: "you guys",  
            defaultWelcomeMessage: `Hello {userName}.\nWelcome {multiple} to the chat group: {boxName}\nHave a nice {session} 😊`  
        }  
    },  

    onStart: async ({ threadsData, message, event, api, getLang }) => {  
        if (event.logMessageType == "log:subscribe")  
            return async function () {  
                const hours = getTime("HH");  
                const { threadID } = event;  
                const { nickNameBot } = global.GoatBot.config;  
                const prefix = global.utils.getPrefix(threadID);  
                const dataAddedParticipants = event.logMessageData.addedParticipants;  

                // if new member is bot  
                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {  
                    if (nickNameBot)  
                        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());  
                    return message.send(getLang("welcomeMessage", prefix));  
                }  

                // if new member:  
                if (!global.temp.welcomeEvent[threadID])  
                    global.temp.welcomeEvent[threadID] = {  
                        joinTimeout: null,  
                        dataAddedParticipants: []  
                    };  

                // push new member to array  
                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);  
                // if timeout is set, clear it  
                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);  

                // set new timeout  
                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {  
                    const threadData = await threadsData.get(threadID);  
                    if (threadData.settings.sendWelcomeMessage == false) return;  

                    const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;  
                    const dataBanned = threadData.data.banned_ban || [];  
                    const threadName = threadData.threadName;  
                    const userName = [],  
                        mentions = [];  
                    let multiple = false;  

                    if (dataAddedParticipants.length > 1)  
                        multiple = true;  

                    for (const user of dataAddedParticipants) {  
                        if (dataBanned.some((item) => item.id == user.userFbId)) continue;  
                        userName.push(user.fullName);  
                        mentions.push({  
                            tag: user.fullName,  
                            id: user.userFbId  
                        });  
                    }  

                    if (userName.length == 0) return;  

                    // ------------------ MESSAGE KAWAII AJOUTÉ ICI ------------------ //

                    const adderName = event.author ? event.author : "Un admin";
                    const memberCount = threadData.data.members ? threadData.data.members.length : "?";
                    const adminCount = threadData.adminIDs ? threadData.adminIDs.length : "?";
                    const joinTime = getTime("DD/MM/YYYY • HH:mm");

                    const welcomeMessage = `╭───────────────⭓
│  🌸🐬 𝗟𝗜𝗔𝗠𝗦 𝗕𝗢𝗧 — 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 🐬🌸
│
│  💖 ʙɪᴇɴᴠᴇɴᴜᴇ @${userName.join(", ")} !!
│  ✨ ᴏɴ ᴇsᴛ ᴛʀᴏᴘ ᴄᴏɴᴛᴇɴᴛ ᴛᴇ ʀᴇᴊᴏɪɴᴅʀᴇ 💕  
│  🧸 ᴍᴇᴛ ᴛᴏɪ ᴀ̀ ʟ'ᴀɪsᴇ ᴇᴛ ᴘʀᴏғɪᴛᴇ ᴅᴜ ɢʀᴏᴜᴘᴇ 🌟
│
│  📛 ɢʀᴏᴜᴘ ɴᴀᴍᴇ: ${threadName}
│  👥 ᴍᴇᴍʙʀᴇs: ${memberCount}
│  🛡️ ᴀᴅᴍɪɴs: ${adminCount}
│  ⏰ ᴀʀʀɪᴠᴇ́ᴇ: ${joinTime}
│  ➕ ᴀᴊᴏᴜᴛᴇ́ ᴘᴀʀ: ${adderName}
│
│  💡 ᴄᴏᴍᴍᴀɴᴅᴇs: ${prefix}help ✨
╰───────────────⭓`;

                    message.send({  
                        body: welcomeMessage,  
                        mentions  
                    });  

                    delete global.temp.welcomeEvent[threadID];  
                }, 1500);  
            };  
    }
};
