import { Message } from "whatsapp-web.js";
import { transcribeRequest } from "../providers/speech";

// Config & Constants
import config from "../config";

// CLI
import * as cli from "../cli/ui";

// Bot
import { handleMessageGPT, handleDeleteConversation } from "../handlers/bot";
import { handleMessageAIConfig, getConfig } from "../handlers/ai-config";

// For deciding to ignore old messages
import { botReadyTimestamp } from "../index";

// Handles message
async function handleIncomingMessage(message: Message) {
	let messageString = message.body;

	// Prevent handling old messages
	if (message.timestamp != null) {
		const messageTimestamp = new Date(message.timestamp * 1000);

		// If startTimestamp is null, the bot is not ready yet
		if (botReadyTimestamp == null) {
			cli.print("Ignoring message because bot is not ready yet: " + messageString);
			return;
		}

		// Ignore messages that are sent before the bot is started
		if (messageTimestamp < botReadyTimestamp) {
			cli.print("Ignoring old message: " + messageString);
			return;
		}
	}
  
	// Ignore groupchats if disabled
  if ((await message.getChat()).isGroup && !config.groupchatsEnabled) return;


  const selfNotedMessage = message.fromMe;

  if (selfNotedMessage) {
	  cli.print(`Ignoring message from ${message.from} because it is self message.`);
	  return;
  }


	// Transcribe audio
	if (message.hasMedia) {
		const media = await message.downloadMedia();

		// Convert media to base64 string
		const mediaBuffer = Buffer.from(media.data, "base64");
		let res;
		res = await transcribeRequest(new Blob([mediaBuffer]));
		const { text: transcribedText } = res;
		// Log transcription
		cli.print(`[Transcription] Transcription response: ${transcribedText}`);

		// Reply with transcription
		const reply = `You said: ${transcribedText}`;
		message.reply(reply);

		// Handle message GPT
		await handleMessageGPT(message, transcribedText);
		return;
	}


	await handleMessageGPT(message, messageString);
	return;
}

export { handleIncomingMessage };