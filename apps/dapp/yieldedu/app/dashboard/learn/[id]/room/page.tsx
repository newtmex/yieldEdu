"use client";
import React, { useState, useEffect, useRef } from "react";
import {
	Mic,
	Phone,
	Volume2,
	MicOff,
	Maximize2,
	Minimize2,
	VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { vapi } from "@/utils/vapi.sdk";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import AIVideo from "../(components)/AiVideo";
import UserVideo from "../(components)/UserVideo";

const CallStatus = {
	INACTIVE: "INACTIVE",
	CONNECTING: "CONNECTING",
	ACTIVE: "ACTIVE",
	FINISHED: "FINISHED",
} as const;

type CallStatus = (typeof CallStatus)[keyof typeof CallStatus];

interface SavedMessages {
	role: "user" | "system" | "assistant";
	content: string;
}

interface Message {
	type: "transcript";
	transcriptType: "final";
	transcript: string;
	role: "assistant" | "user" | "system";
}

const VideoInterface: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const containerRef2 = useRef<HTMLDivElement>(null);
	// const [isConnected, setIsConnected] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState(1);
	const [isFullscreen, setIsFullScreen] = useState(false);
	const [isVolumeOpen, setIsVolumeOpen] = useState(false);
	const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
	const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
	const [gainNode, setGainNode] = useState<GainNode | null>(null);
	const { address, isConnected } = useAppKitAccount();

	useEffect(() => {
		// Get initial microphone access
		const initializeMicrophone = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				const context = new AudioContext();
				const source = context.createMediaStreamSource(stream);
				const gain = context.createGain();

				source.connect(gain);
				gain.connect(context.destination);
				gain.gain.value = volume;

				setAudioContext(context);
				setGainNode(gain);
				setMediaStream(stream);
			} catch (err) {
				console.error("Error accessing microphone:", err);
				toast({
					title: "Error accessing microphone",
					description:
						"Unable to detect microphone. Please check your settings.",
					variant: "destructive",
				});
			}
		};

		initializeMicrophone();

		return () => {
			if (mediaStream) {
				mediaStream.getTracks().forEach((track) => track.stop());
				if (audioContext) {
					audioContext.close();
				}
			}
		};
	}, [mediaStream, volume, audioContext]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef2.current &&
				!containerRef2.current.contains(event.target as Node)
			) {
				setIsVolumeOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [containerRef2]);

	const handleVolumeChange = (value: number[]) => {
		setVolume(value[0]);
		if (gainNode) {
			gainNode.gain.value = value[0];
		}
	};

	const handleMicrophoneToggle = () => {
		if (mediaStream) {
			const audioTracks = mediaStream.getAudioTracks();
			audioTracks.forEach((track) => {
				track.enabled = !isMuted;
			});
			setIsMuted(!isMuted);
		}
	};

	// ===================vapi==========================
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
	const [messages, setMessages] = useState<SavedMessages[]>([]);
	const { open } = useAppKit();

	useEffect(() => {
		const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
		const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
		const onMessage = (message: Message) => {
			if (message.type === "transcript" && message.transcriptType == "final") {
				const newMessage = { role: message.role, content: message.transcript };

				setMessages((prevMessages) => [...prevMessages, newMessage]);
			}
		};

		const onSpeechStart = () => setIsSpeaking(true);
		const onSpeechEnd = () => setIsSpeaking(false);

		const onError = (error: Error) => console.log("error", error);

		vapi.on("call-start", onCallStart);
		vapi.on("call-end", onCallEnd);
		vapi.on("message", onMessage);
		vapi.on("speech-start", onSpeechStart);
		vapi.on("speech-end", onSpeechEnd);
		vapi.on("error", onError);

		return () => {
			vapi.off("call-start", onCallStart);
			vapi.off("call-end", onCallEnd);
			vapi.off("message", onMessage);
			vapi.off("speech-start", onSpeechStart);
			vapi.off("speech-end", onSpeechEnd);
			vapi.off("error", onError);
		};
	}, []);

	useEffect(() => {
		if (!isConnected) open({ view: "Connect" });
	}, [isConnected, open, callStatus]);
	// useEffect(() => {
	// 	if (callStatus === CallStatus.FINISHED) router.push("/dashboard/learn");
	// }, [callStatus, router]);

	const { data } = useQuery({
		queryKey: ["lesson"],
		queryFn: () => {
			const lesson = axios.get(
				`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/vapi/generate`,
				{
					params: {
						lesson_id: window.location.pathname.split("/").at(-2),
						user_wallet: address,
					},
				}
			);

			return lesson;
		},
		enabled: isConnected,
	});
	const lesson = data?.data.lesson.lesson;

	const assistantOptions: CreateAssistantDTO = {
		name: "educator",
		firstMessage:
			"Hello, I am your educator. Are you ready to dive into the lesson?",

		transcriber: {
			provider: "deepgram",
			model: "nova-2",
			language: "en-US",
		},

		voice: {
			provider: "11labs",
			voiceId: "Harry",
			stability: 0.4,
			similarityBoost: 0.8,
			speed: 0.9,
			style: 0.5,
			useSpeakerBoost: true,
		},
		model: {
			provider: "openai",
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful assistant that helps the user learn and understand the lesson. You are friendly and engaging. You can also answer questions related to the lesson. make sure the session is not longer than 5 minutes. If the user asks a question that is not related to the lesson, politely redirect them back to the lesson. use this lesson as a reference: " +
						lesson,
				},
			],
		},
	};

	const handleCall = async () => {
		setCallStatus(CallStatus.CONNECTING);
		try {
			await vapi.start(assistantOptions);
		} catch (error) {
			console.log(error);
			vapi.stop();

			toast({
				title: "Error starting call",

				description: "Unable to connect to the call.",
				variant: "destructive",
			});
		}
	};
	const handleCallDisconnect = async () => {
		setCallStatus(CallStatus.FINISHED);
		vapi.stop();
	};

	const isCallInactiveOrFinsished =
		callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
	// const isCallActive = callStatus === CallStatus.ACTIVE;

	const onToggleFullscreen = () => {
		if (!document.fullscreenElement && containerRef.current) {
			containerRef.current
				.requestFullscreen()
				.then(() => {
					setIsFullScreen(true);
				})
				.catch((err) => {
					console.error("Error attempting to enable fullscreen:", err);
				});
		} else {
			document
				.exitFullscreen()
				.then(() => {
					setIsFullScreen(false);
				})
				.catch((err) => {
					console.error("Error attempting to exit fullscreen:", err);
				});
		}
	};

	return (
		<div
			ref={containerRef}
			className={cn("p-4 relative md:p-8 flex flex-col justify-center", {
				"bg-slate-50 dark:bg-slate-900": isFullscreen,
			})}
		>
			{callStatus === CallStatus.CONNECTING && (
				<div className="flex md:absolute top-0 right-0 left-0 items-center justify-center">
					<div className="p-8 rounded-2xl text-center animate-pulse-soft">
						<h2 className="text-xl font-medium mb-4">
							Connecting to your meeting...
						</h2>
						<div className="flex justify-center space-x-2">
							<div
								className="w-3 h-3 rounded-full bg-primary animate-bounce"
								style={{ animationDelay: "0ms" }}
							></div>
							<div
								className="w-3 h-3 rounded-full bg-primary animate-bounce"
								style={{ animationDelay: "150ms" }}
							></div>
							<div
								className="w-3 h-3 rounded-full bg-primary animate-bounce"
								style={{ animationDelay: "300ms" }}
							></div>
						</div>
					</div>
				</div>
			)}

			<div className="w-full max-w-7xl mx-auto space-y-7 md:space-y-14">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Meeting Room</h1>
					<Button
						onClick={onToggleFullscreen}
						className="ml-auto w-fit dark:bg-lime-400/20 hover:dark:bg-lime-400/30 bg-blue-400/20 hover:bg-blue-400/40"
						variant="ghost"
					>
						{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 md:h-[400px] gap-6">
					<AIVideo
						isSpeaking={isSpeaking}
						username={""}
						type=""
						className="aspect-auto"
					/>
					<UserVideo isMuted={isMuted} className="aspect-auto" />
				</div>

				{messages.length > 0 && (
					<p className="sticky bottom-36 md:relative md:bottom-0 text-sm text-center p-4 text-lime-700 font-medium dark:text-gray-300 select-none ">
						{messages.at(-1)!.content}
					</p>
				)}

				{!isConnected && (
					<span className="text-red-500 text-center">
						connect your wallet to start a call{" "}
					</span>
				)}

				{isConnected && (
					<div className="sticky bottom-5 md:relative md:bottom-0 flex w-fit mx-auto items-center justify-center gap-4 p-5">
						{isCallInactiveOrFinsished ? (
							<div className="flex w-fit p-4 items-center justify-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full border border-gray-200 dark:border-gray-700 shadow-lg">
								<button
									onClick={handleMicrophoneToggle}
									className={`p-4 rounded-full transition-colors ${
										isMuted
											? "bg-gray-200 dark:bg-gray-700"
											: "hover:bg-gray-100 dark:hover:bg-gray-700"
									}`}
									aria-label="Toggle microphone"
								>
									{isMuted ? (
										<MicOff className="text-gray-400 size-6" />
									) : (
										<Mic
											className={`w-6 h-6 text-gray-700 dark:text-gray-300`}
										/>
									)}
								</button>

								<button
									disabled={!isConnected}
									onClick={handleCall}
									className="p-4 rounded-full bg-green-500 disabled:opacity-40 enabled:hover:bg-green-600 transition-colors"
									aria-label="Connect call"
								>
									<Phone className="w-6 h-6 text-white" />
								</button>

								<div className="relative" ref={containerRef2}>
									<button
										onClick={() => setIsVolumeOpen(!isVolumeOpen)}
										className={`p-4 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
										aria-label="Volume settings"
									>
										{volume === 0 ? (
											<VolumeX className="w-6 h-6 text-gray-400" />
										) : (
											<Volume2
												className={`w-6 h-6 text-gray-700 dark:text-gray-300`}
											/>
										)}
									</button>

									{isVolumeOpen && (
										<div
											className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50"
											style={{ position: "absolute" }}
										>
											<div className="flex items-center space-x-2">
												<VolumeX
													className="h-4 w-4 cursor-pointer"
													onClick={() => handleVolumeChange([0])}
												/>
												<Slider
													value={[volume]}
													max={1}
													step={0.1}
													onValueChange={handleVolumeChange}
													className="w-full cursor-pointer"
												/>
												<Volume2
													className="h-4 w-4 cursor-pointer"
													onClick={() => handleVolumeChange([1])}
												/>
											</div>
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="flex w-fit p-4 items-center justify-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full border border-gray-200 dark:border-gray-700 shadow-lg">
								<button
									onClick={handleMicrophoneToggle}
									className={`p-4 rounded-full transition-colors ${
										isMuted
											? "bg-gray-200 dark:bg-gray-700"
											: "hover:bg-gray-100 dark:hover:bg-gray-700"
									}`}
									aria-label="Toggle microphone"
								>
									{isMuted ? (
										<MicOff className="text-gray-400 size-6" />
									) : (
										<Mic
											className={`w-6 h-6 text-gray-700 dark:text-gray-300`}
										/>
									)}
								</button>

								<button
									onClick={handleCallDisconnect}
									className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
									aria-label="End call"
								>
									<Phone className="w-6 h-6 text-white" />
								</button>

								<div className="relative" ref={containerRef2}>
									<button
										onClick={() => setIsVolumeOpen(!isVolumeOpen)}
										className={`p-4 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
										aria-label="Volume settings"
									>
										{volume === 0 ? (
											<VolumeX className="w-6 h-6 text-gray-400" />
										) : (
											<Volume2
												className={`w-6 h-6 text-gray-700 dark:text-gray-300`}
											/>
										)}
									</button>

									{isVolumeOpen && (
										<div
											className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50"
											style={{ position: "absolute" }}
										>
											<div className="flex items-center space-x-2">
												<VolumeX
													className="h-4 w-4 cursor-pointer"
													onClick={() => handleVolumeChange([0])}
												/>
												<Slider
													value={[volume]}
													max={1}
													step={0.1}
													onValueChange={handleVolumeChange}
													className="w-full cursor-pointer"
												/>
												<Volume2
													className="h-4 w-4 cursor-pointer"
													onClick={() => handleVolumeChange([1])}
												/>
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default VideoInterface;
