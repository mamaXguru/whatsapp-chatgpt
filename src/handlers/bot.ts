import os from "os";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Message, MessageMedia } from "whatsapp-web.js";
import * as cli from "../cli/ui";
import config from "../config";
import axios from "axios";
import { handleMessageSamantha, handleVoiceMessageSamantha } from "./bot_samantha";
import { handleMessageMaya, handleVoiceMessageMaya } from "./bot_maya";
import { handleMessageJournal, handleVoiceMessageJournal } from "./bot_journal";


// Mapping from number to last conversation id
const conversations = {};

const handleMessageGPT = async (message: Message, prompt: string) => {
	cli.print(`[Log] Msg recived ${message.from} => ${message.to}`);
	try {
		// Get last conversation
		if(message.to == config.waSamanthaNumber){
			handleMessageSamantha(message, prompt);
		}
		else if(message.to == config.waMayaNumber){
			handleMessageMaya(message, prompt);
		}
		else if(message.to == config.waJournalNumber){
			handleMessageJournal(message, prompt);
		}
		

	} catch (error: any) {
		console.error("An error occured", error);
		message.reply("An error occured, please contact the administrator. (" + error.message + ")");
	}
};


const handleVoiceMessageGPT = async (message: Message, prompt: string) => {
	try {
		// Get last conversation
		if(message.to == config.waSamanthaNumber){
			handleVoiceMessageSamantha(message, prompt);
		}
		else if(message.to == config.waMayaNumber){
			handleVoiceMessageMaya(message, prompt);
		}
		else if(message.to == config.waJournalNumber){
			handleVoiceMessageJournal(message, prompt);
		}
	
	} catch (error: any) {
		console.error("An error occured", error);
		message.reply("An error occured, please contact the administrator. (" + error.message + ")");
	}
};


const handleDeleteConversation = async (message: Message) => {
	// Delete conversation
	delete conversations[message.from];

	// Reply
	message.reply("Conversation context was resetted!");
};


export { handleMessageGPT, handleDeleteConversation };
