require("dotenv").config()
import { Client, VoiceChannel } from "discord.js"

const client = new Client()

client.login(process.env.DISCORD_TOKEN)

var currentChannel: VoiceChannel | undefined

var queue: VoiceChannel[] = []

function queueRunner() {
    const channel = queue[0]
    if (channel == null) return
    channel.join().then(c => {
        setTimeout(() => {
            const dispatcher = c.playFile(process.env.PLAY_FILE_PATH!)
            dispatcher.setVolume(0.125)
            c.dispatcher.on("end", () => {
                channel.leave()
            })
            c.on("disconnect", () => {
                queue.shift()
                queueRunner()
            })
        }, 500)
    })
}

client.on("voiceStateUpdate", (oldMember, newMember) => {
    if (newMember.voiceChannelID == null) { return }
    if (oldMember.voiceChannelID === newMember.voiceChannelID) return
    if (newMember.displayName.startsWith("Timecard")) return
    if (queue.find(c => c.id === newMember.voiceChannelID)) return
    queue.push(newMember.voiceChannel)
    if (queue.length === 1) queueRunner()
})