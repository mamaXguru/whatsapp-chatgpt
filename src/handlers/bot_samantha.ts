import os from "os";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Message, MessageMedia } from "whatsapp-web.js";
import * as cli from "../cli/ui";
import config from "../config";
import axios from "axios";

// Mapping from number to last conversation id
const conversations = {};

const handleMessageSamantha = async (message: Message, prompt: string) => {
	try {
		// Get last conversation
		const lastConversationId = conversations[message.from];

		cli.print(`[GPT] Received prompt from ${message.from}: ${prompt}`);


		const start = Date.now();

		const end = Date.now() - start;
		const response = await axios.post(config.apiServerUrl+'api/samantha/chat', {
			"message": prompt,
			"user_id": message.from
		})


		cli.print(`[GPT] Answer to ${message.from}: ${response.data.msg}  | OpenAI request took ${end}ms)`);

		message.reply(response.data.msg);
	} catch (error: any) {
		console.error("An error occured", error);
		message.reply("An error occured, please contact the administrator. (" + error.message + ")");
	}
};


const handleVoiceMessageSamantha = async (message: Message, prompt: string) => {
	try {
		// Get last conversation
		const lastConversationId = conversations[message.from];

		cli.print(`[GPT] Received prompt from ${message.from}: ${prompt}`);


		const start = Date.now();

		const end = Date.now() - start;
		const response = await axios.post(config.apiServerUrl+'api/chat/transcribe', {
			"message": prompt,
			"user_id": message.from
		})

		cli.print(`[GPT] Answer to ${message.from}: ${response.data.msg}  | OpenAI request took ${end}ms)`);

		message.reply(response.data.msg);
	} catch (error: any) {
		console.error("An error occured", error);
		message.reply("An error occured, please contact the administrator. (" + error.message + ")");
	}
};


const handleDeleteConversationSamantha = async (message: Message) => {
	// Delete conversation
	delete conversations[message.from];

	// Reply
	message.reply("Conversation context was resetted!");
};


export { handleMessageSamantha, handleVoiceMessageSamantha, handleDeleteConversationSamantha };
