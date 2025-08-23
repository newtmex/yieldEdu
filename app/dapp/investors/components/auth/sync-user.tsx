"use client";

import { useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { supabase } from "@/lib/supabaseClient";

export default function SyncUserToDb() {
	const { address, embeddedWalletInfo } = useAppKitAccount();

	useEffect(() => {
		const syncUser = async () => {
			if (!address) return;

			const { username, email } = embeddedWalletInfo?.user || {};

			const { data: existingUser, error: fetchError } = await supabase
				.from("investors")
				.select("*")
				.eq("address", address)
				.single();

			if (fetchError) console.error("Fetch error", fetchError);

			if (!existingUser) {
				const { error: insertError } = await supabase.from("investors").insert({
					address,
					email,
					username,
				});

				if (insertError) console.error("Insert error", insertError);
			}
		};

		syncUser();
	}, [address, embeddedWalletInfo?.user]);

	return null;
}
