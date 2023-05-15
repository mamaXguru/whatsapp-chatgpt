import process from "process";

import { TranscriptionMode } from "./types/transcription-mode";
import { TTSMode } from "./types/tts-mode";
import { AWSPollyEngine } from "./types/aws-polly-engine";

// Environment variables
import dotenv from "dotenv";
dotenv.config();

// Config Interface
interface IConfig {
	// API
	apiServerUrl: string;

	// WhatsApp
	waMayaNumber: string;
	waSamanthaNumber: string;
	waJournalNumber: string;

	// Access control
	whitelistedPhoneNumbers: string[];

	// OpenAI
	openAIModel: string;
	openAIAPIKeys: string[];
	maxModelTokens: number;
	prePrompt: string | undefined;

	// Prefix
	prefixEnabled: boolean;
	prefixSkippedForMe: boolean;
	gptPrefix: string;
	dallePrefix: string;
	langChainPrefix: string;
	resetPrefix: string;
	aiConfigPrefix: string;

	// Groupchats
	groupchatsEnabled: boolean;

	// Prompt Moderation
	promptModerationEnabled: boolean;
	promptModerationBlacklistedCategories: string[];

	// AWS
	awsAccessKeyId: string;
	awsSecretAccessKey: string;
	awsRegion: string;
	awsPollyVoiceId: string;
	awsPollyEngine: AWSPollyEngine;

	// Voice transcription & Text-to-Speech
	speechServerUrl: string;
	whisperServerUrl: string;
	openAIServerUrl: string;
	whisperApiKey: string;
	ttsEnabled: boolean;
	ttsMode: TTSMode;
	transcriptionEnabled: boolean;
	transcriptionMode: TranscriptionMode;
	transcriptionLanguage: string;
}

// Config
export const config: IConfig = {
	apiServerUrl: process.env.APIServer || "https://api.mamaguru.co/",
	// apiServerUrl: process.env.APIServer || "http://0.0.0.0:8000",

	waMayaNumber: process.env.waMaya|| "84777464037@c.us1",
	waSamanthaNumber: process.env.waSamantha || "84777464037@c.us1",
	waJournalNumber: process.env.waJournal|| "84777464037@c.us",

	whitelistedPhoneNumbers: process.env.WHITELISTED_PHONE_NUMBERS?.split(",") || [],

	openAIAPIKeys: (process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || "").split(",").filter((key) => !!key), // Default: []
	openAIModel: process.env.OPENAI_GPT_MODEL || "gpt-3.5-turbo", // Default: gpt-3.5-turbo
	maxModelTokens: getEnvMaxModelTokens(), // Default: 4096
	prePrompt: process.env.PRE_PROMPT, // Default: undefined

	// Prefix
	prefixEnabled: getEnvBooleanWithDefault("PREFIX_ENABLED", true), // Default: true
	prefixSkippedForMe: getEnvBooleanWithDefault("PREFIX_SKIPPED_FOR_ME", true), // Default: true
	gptPrefix: process.env.GPT_PREFIX || "!x_gpt", // Default: !gpt
	dallePrefix: process.env.DALLE_PREFIX || "!x_dalle", // Default: !dalle
	resetPrefix: process.env.RESET_PREFIX || "!x_reset", // Default: !reset
	aiConfigPrefix: process.env.AI_CONFIG_PREFIX || "!x_config", // Default: !config
	langChainPrefix: process.env.LANGCHAIN_PREFIX || "!x_lang", // Default: !lang

	// Groupchats
	groupchatsEnabled: getEnvBooleanWithDefault("GROUPCHATS_ENABLED", false), // Default: false

	// Prompt Moderation
	promptModerationEnabled: getEnvBooleanWithDefault("PROMPT_MODERATION_ENABLED", false), // Default: false
	promptModerationBlacklistedCategories: getEnvPromptModerationBlacklistedCategories(), // Default: ["hate", "hate/threatening", "self-harm", "sexual", "sexual/minors", "violence", "violence/graphic"]

	// AWS
	awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "", // Default: ""
	awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "", // Default: ""
	awsRegion: process.env.AWS_REGION || "", // Default: ""
	awsPollyVoiceId: process.env.AWS_POLLY_VOICE_ID || "", // Default: "Joanna"
	awsPollyEngine: getEnvAWSPollyVoiceEngine(), // Default: standard

	// Speech API, Default: https://speech-service.verlekar.com
	speechServerUrl: process.env.SPEECH_API_URL || "https://speech-service.verlekar.com",
	whisperServerUrl: process.env.WHISPER_API_URL || "https://transcribe.whisperapi.com",
	openAIServerUrl: process.env.OPENAI_API_URL || "https://api.openai.com/v1/audio/transcriptions",
	whisperApiKey: process.env.WHISPER_API_KEY || "", // Default: ""

	// Text-to-Speech
	ttsEnabled: getEnvBooleanWithDefault("TTS_ENABLED", false), // Default: false
	ttsMode: getEnvTTSMode(), // Default: speech-api

	// Transcription
	transcriptionEnabled: getEnvBooleanWithDefault("TRANSCRIPTION_ENABLED", false), // Default: false
	transcriptionMode: getEnvTranscriptionMode(), // Default: local
	transcriptionLanguage: process.env.TRANSCRIPTION_LANGUAGE || "" // Default: null
};

/**
 * Get the max model tokens from the environment variable
 * @returns The max model tokens from the environment variable or 4096
 */
function getEnvMaxModelTokens() {
	const envValue = process.env.MAX_MODEL_TOKENS;
	if (envValue == undefined || envValue == "") {
		return 4096;
	}

	return parseInt(envValue);
}

/**
 * Get an environment variable as a boolean with a default value
 * @param key The environment variable key
 * @param defaultValue The default value
 * @returns The value of the environment variable or the default value
 */
function getEnvBooleanWithDefault(key: string, defaultValue: boolean): boolean {
	const envValue = process.env[key]?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return defaultValue;
	}

	return envValue == "true";
}

/**
 * Get the blacklist categories for prompt moderation from the environment variable
 * @returns Blacklisted categories for prompt moderation
 */
function getEnvPromptModerationBlacklistedCategories(): string[] {
	const envValue = process.env.PROMPT_MODERATION_BLACKLISTED_CATEGORIES;
	if (envValue == undefined || envValue == "") {
		return ["hate", "hate/threatening", "self-harm", "sexual", "sexual/minors", "violence", "violence/graphic"];
	} else {
		return JSON.parse(envValue.replace(/'/g, '"'));
	}
}

/**
 * Get the transcription mode from the environment variable
 * @returns The transcription mode
 */
function getEnvTranscriptionMode(): TranscriptionMode {
	const envValue = process.env.TRANSCRIPTION_MODE?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return TranscriptionMode.Local;
	}

	return envValue as TranscriptionMode;
}

/**
 * Get the tss mode from the environment variable
 * @returns The tts mode
 */
function getEnvTTSMode(): TTSMode {
	const envValue = process.env.TTS_MODE?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return TTSMode.SpeechAPI;
	}

	return envValue as TTSMode;
}

/**
 * Get the AWS Polly voice engine from the environment variable
 * @returns The voice engine
 */
function getEnvAWSPollyVoiceEngine(): AWSPollyEngine {
	const envValue = process.env.AWS_POLLY_VOICE_ENGINE?.toLowerCase();
	if (envValue == undefined || envValue == "") {
		return AWSPollyEngine.Standard;
	}

	return envValue as AWSPollyEngine;
}

export default config;
