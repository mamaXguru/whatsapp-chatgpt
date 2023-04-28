import { Message } from "whatsapp-web.js";

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

	const selfNotedMessage = message.fromMe && message.hasQuotedMsg === false && message.from === message.to;
	const whitelistedPhoneNumbers = getConfig("general", "whitelist");

	// if (!selfNotedMessage && whitelistedPhoneNumbers.length > 0 && !whitelistedPhoneNumbers.includes(message.from)) {
	// 	cli.print(`Ignoring message from ${message.from} because it is not whitelisted.`);
	// 	return;
	// }

	await handleMessageGPT(message, messageString);
	return;
}

export { handleIncomingMessage };