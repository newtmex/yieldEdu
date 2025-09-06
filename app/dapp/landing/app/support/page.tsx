"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Shape, ExtrudeGeometry } from "three";
import Navigation from "@/components/navbar";
import Footer from "@/components/footer";
import { IconBubbleText, IconMail, IconTestPipe } from "@tabler/icons-react";
import { PlasticButton } from "@/components/plastic-button";
import { toast } from "sonner";
import Link from "next/link";

const features = [
	{
		id: "email-support",
		icon: IconMail,
		title: "Email Support",
		description: "Send us an email and we'll get back to you within 24 hours.",
	},
	{
		id: "live-chat",
		icon: IconBubbleText,
		title: "Live Chat",
		description: "Join our community for instant answers from the team.",
	},
	{
		id: "feature-request",
		icon: IconTestPipe,
		title: "Feature Request",
		description: "Help shape the future of on-chain education.",
	},
];

// WebGL support detection
const checkWebGLSupport = () => {
	try {
		const canvas = document.createElement("canvas");
		const gl =
			canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		return !!gl;
	} catch (e) {
		return false;
	}
};

// Performance detection
const getPerformanceLevel = () => {
	const canvas = document.createElement("canvas");
	const gl = canvas.getContext("webgl");
	if (!gl) return "low";

	const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
	if (debugInfo) {
		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		// Simple heuristic for performance level
		if (renderer.includes("Intel") || renderer.includes("Integrated"))
			return "low";
		if (
			renderer.includes("GTX") ||
			renderer.includes("RTX") ||
			renderer.includes("Radeon")
		)
			return "high";
	}
	return "medium";
};

// Create geometry once and cache it
const createSharedGeometry = (() => {
	let cachedGeometry: ExtrudeGeometry | null = null;

	return () => {
		if (cachedGeometry) return cachedGeometry;

		const shape = new Shape();
		const angleStep = Math.PI * 0.5;
		const radius = 1;

		shape.absarc(2, 2, radius, angleStep * 0, angleStep * 1);
		shape.absarc(-2, 2, radius, angleStep * 1, angleStep * 2);
		shape.absarc(-2, -2, radius, angleStep * 2, angleStep * 3);
		shape.absarc(2, -2, radius, angleStep * 3, angleStep * 4);

		const extrudeSettings = {
			depth: 0.3,
			bevelEnabled: true,
			bevelThickness: 0.05,
			bevelSize: 0.05,
			bevelSegments: 20,
			curveSegments: 20,
		};

		cachedGeometry = new ExtrudeGeometry(shape, extrudeSettings);
		cachedGeometry.center();
		return cachedGeometry;
	};
})();

const Box = ({
	position,
	rotation,
}: {
	position: [number, number, number];
	rotation: [number, number, number];
}) => {
	// Use shared geometry instead of creating new one
	const geometry = useMemo(() => createSharedGeometry(), []);

	return (
		<mesh geometry={geometry} position={position} rotation={rotation}>
			<meshPhysicalMaterial
				color="#232323"
				metalness={1}
				roughness={0.3}
				reflectivity={0.5}
				ior={1.5}
				emissive="#000000"
				emissiveIntensity={0}
				transparent={false}
				opacity={1.0}
				transmission={0.0}
				thickness={0.5}
				clearcoat={0.0}
				clearcoatRoughness={0.0}
				sheen={0}
				sheenRoughness={1.0}
				sheenColor="#ffffff"
				specularIntensity={1.0}
				specularColor="#ffffff"
				iridescence={1}
				iridescenceIOR={1.3}
				iridescenceThicknessRange={[100, 400]}
				flatShading={false}
				side={0}
				alphaTest={0}
				depthWrite={true}
				depthTest={true}
			/>
		</mesh>
	);
};

const AnimatedBoxes = ({ performanceLevel }: { performanceLevel: string }) => {
	const groupRef = useRef<any>(null!);

	useFrame((state, delta) => {
		if (groupRef.current) {
			groupRef.current.rotation.x += delta * 0.05;
		}
	});

	// Adjust box count based on performance
	const boxCount = useMemo(() => {
		switch (performanceLevel) {
			case "low":
				return 50;
			case "medium":
				return 50;
			case "high":
				return 50;
			default:
				return 50;
		}
	}, [performanceLevel]);

	// Memoize boxes array to prevent recreation on every render
	const boxes = useMemo(() => {
		return Array.from({ length: boxCount }, (_, index) => ({
			position: [(index - boxCount / 2) * 0.75, 0, 0] as [
				number,
				number,
				number
			],
			rotation: [(index - 10) * 0.1, Math.PI / 2, 0] as [
				number,
				number,
				number
			],
			id: index,
		}));
	}, [boxCount]);

	return (
		<group ref={groupRef}>
			{boxes.map((box) => (
				<Box key={box.id} position={box.position} rotation={box.rotation} />
			))}
		</group>
	);
};

const Scene = ({ performanceLevel }: { performanceLevel: string }) => {
	const [cameraPosition, setCameraPosition] = React.useState<
		[number, number, number]
	>([5, 5, 20]);

	// Adjust settings based on performance level
	const canvasSettings = useMemo(() => {
		const baseSettings = {
			camera: { position: cameraPosition, fov: 40 },
			gl: {
				powerPreference: "high-performance" as const,
				antialias: false,
			},
		};

		switch (performanceLevel) {
			case "low":
				return {
					...baseSettings,
					dpr: [0.5, 1] as [number, number],
					gl: { ...baseSettings.gl, antialias: false },
				};
			case "medium":
				return {
					...baseSettings,
					dpr: [1, 1.5] as [number, number],
				};
			case "high":
			default:
				return {
					...baseSettings,
					dpr: [1, 2] as [number, number],
					gl: { ...baseSettings.gl, antialias: true },
				};
		}
	}, [cameraPosition, performanceLevel]);

	return (
		<div className="w-full h-full z-0">
			<Canvas {...canvasSettings}>
				<ambientLight intensity={15} />
				<directionalLight position={[10, 10, 5]} intensity={15} />
				<AnimatedBoxes performanceLevel={performanceLevel} />
			</Canvas>
		</div>
	);
};

// Fallback component for unsupported browsers
const FallbackScene = () => (
	<div className="w-full h-full z-0 flex items-center justify-center">
		<div className="text-center p-8 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
			<div className="text-4xl mb-4">🎨</div>
			<h3 className="text-lg font-medium mb-2">3D Graphics Unavailable</h3>
			<p className="text-sm text-neutral-400 max-w-md">
				Your browser doesn't support WebGL or 3D graphics. The page
				functionality remains fully available.
			</p>
		</div>
	</div>
);

const Page = () => {
	const [webglSupported, setWebglSupported] = useState(true);
	const [performanceLevel, setPerformanceLevel] = useState("medium");

	useEffect(() => {
		// Check support on client side only
		const supported = checkWebGLSupport();
		setWebglSupported(supported);

		if (!supported) {
			setPerformanceLevel("low");
		}

		if (supported) {
			setPerformanceLevel(getPerformanceLevel());
			toast.warning("You do not support 3d graphics.");
		}
	}, []);

	const handleSendEmail = (
		email: string = "support@yieldedu.xyz",
		subject?: string
	) => {
		const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${
			subject ? encodeURIComponent(subject) : ""
		}`;
		window.open(gmailURL, "_blank");
	};

	return (
		<div className="bg-linear-to-br from-[#000] to-[#1A2428] text-white">
			<Navigation />
			<main className="min-h-screen pt-32 overflow-y-auto overflow-x-clip text-white flex flex-col items-center justify-center p-8">
				<div className="w-full max-w-6xl space-y-12 relative z-10">
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
						{features.map((feature) => (
							<div
								key={feature.id}
								className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col justify-start items-start space-y-2 md:space-y-3"
							>
								<feature.icon
									size={18}
									className="text-white/80 md:w-5 md:h-5 shrink-0 aspect-square"
								/>
								<h3 className="text-sm md:text-base font-medium">
									{feature.title}
								</h3>
								<p className="text-xs md:text-sm text-neutral-400">
									{feature.description}
								</p>
								{feature.id === "email-support" && (
									<PlasticButton
										onClick={() =>
											handleSendEmail(process.env.NEXT_PUBLIC_SUPPORT_MAIL!)
										}
										className="mt-auto"
										text="Contact Us"
									/>
								)}
								{feature.id === "live-chat" && (
									<Link
										href={process.env.NEXT_PUBLIC_TELEGRAM_URL!}
										target="_blank"
									>
										<PlasticButton className="mt-auto" text="Chat Now" />
									</Link>
								)}
								{feature.id === "feature-request" && (
									<PlasticButton
										onClick={() =>
											handleSendEmail(
												process.env.NEXT_PUBLIC_SUPPORT_MAIL!,
												"feature-request"
											)
										}
										className="mt-auto"
										text="Request Feature"
									/>
								)}
							</div>
						))}
					</div>
				</div>
				<div className="absolute inset-0">
					<Scene performanceLevel={performanceLevel} />
				</div>
			</main>
			<Footer className="hover:text-white" />
		</div>
	);
};

export default Page;
