import axios from 'axios';
import { Telegraf } from 'telegraf';
import 'dotenv/config'; 
import { askQuestion } from './askQuestion.js'

const startTelegramBot = async () => {

    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
    const BOT_USERNAME = '@askMonadSpy'

    bot.start((ctx) => {
        ctx.reply(`👋Hey I'm ${BOT_USERNAME}. Ask me anything about the Monad Blockchain`)
    });

    bot.on("text", async (ctx) => {
        const messageText = ctx.message.text

        const isInGroup = ctx.chat.type.includes("group")
        const isTagged = messageText.includes(BOT_USERNAME)

        if (isInGroup && !isTagged) return

        const userQuestion = isInGroup ? 
        messageText.replace(BOT_USERNAME, "").trim()
        : messageText

        const prompt = await askQuestion(userQuestion)
        const answer = await askGroq(prompt);

        ctx.reply(answer)
    })
    bot.launch()
    console.log("Bot is successfully launched")


};

const askGroq = async (prompt) => {

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions", 
            {
                model: 'llama-3.3-70b-versatile', 
                messages: [{role: 'user', content: prompt}],
                temperature: 0.7
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`
                },
            }, 
            
        );

        const answer = response?.data.choices?.[0]?.message?.content

        if (answer && answer.trim() !== "") {
            return answer
        }

    } catch (error) {
        console.error("Groq API Error:", error.message)
        return 'Failed to get a response'
   
    }
} 

startTelegramBot()






