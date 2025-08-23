"use client";

import React from "react";
import { Button } from "./button";
import { Achievement } from "@/app/(dashboard)/achievements/page";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
if (!baseUrl) {
	throw new Error(`NEXT_PUBLIC_WEBSITE_URL is not set`);
}
const IssueBadge = ({ badge, OCId }: { badge: Achievement; OCId: string }) => {
	const { data: session } = useSession();
	const { address, isConnected } = useAccount();
	const { open } = useAppKit();
	const router = useRouter();
	const queryClient = useQueryClient();
	const profileUrl = `${baseUrl}/user/${session?.user.id}`;

	const mutation = useMutation({
		mutationFn: async () => {
			// issuance payload
			const payload = {
				credentialPayload: {
					validFrom: new Date().toISOString(),
					awardedDate: new Date().toISOString(),
					description: badge.description,
					credentialSubject: {
						name: session?.user.name,
						type: "Person",
						email: session?.user.email,
						image: session?.user.image,
						profileUrl,
						achievement: {
							name: badge.name,
							identifier: badge.id,
							description: badge.description,
							achievementType: "Badge",
						},
					},
					// Optional fields: validUntil, attachments
				},
				holderOcId: OCId,
			};
			const res = await axios.post("/api/issue-badge", {
				payload,
				holderAddress: address, //remove this if its ocA....adding will default to OCB
			});
			return res.data;
		},
		onSuccess: async (data) => {
			const vc = data.vc;
			const insertPayload = {
				user_ocid: vc.credentialSubject.id,
				achievement_id: vc.credentialSubject.achievement.identifier,
				user_id: session?.user.id,
				issued_at: vc.awardedDate ?? new Date().toISOString(),
				issuance_status: "issued",
				nftCollection: vc.nftCollection,
			};
			const { error } = await supabase
				.from("user_achievements")
				.insert([insertPayload]);

			if (error) {
				toast.error("Failed to save badge in database.");
				console.error("Supabase insert error:", error);
			} else {
				toast.success("Badge issued successfully!");
				await queryClient.invalidateQueries({
					queryKey: ["user_achievements", session?.user.id],
				});
			}
		},
		onError: (error: any) => {
			console.log(error);
			// axios error handling
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message || "Failed to issue badge");
			} else {
				toast.error("Unexpected error occurred");
			}
		},
	});

	const handleClick = () => {
		if (!session || !session.user) {
			router.push("/signin");
		}
		if (!isConnected) {
			// Step 1: Connect wallet
			open({ view: "Connect" });
			return;
		}
		mutation.mutate();
	};

	let buttonText = "Connect Wallet";
	if (isConnected && !OCId) buttonText = "Connect OCID";
	if (isConnected && OCId) buttonText = "Claim Badge";

	return (
		<Button disabled={mutation.isPending} onClick={handleClick} size="sm">
			{mutation.isPending ? "claiming..." : buttonText}
		</Button>
	);
};

export default IssueBadge;
