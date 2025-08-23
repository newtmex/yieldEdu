import axios from "axios";
import { NextResponse } from "next/server";

const OCA_ENDPOINT = process.env.OCA_ENDPOINT;

export async function POST(request: Request) {
	const { payload, holderAddress } = await request.json();

	if (!payload) {
		return NextResponse.json({ message: "Missing payload" }, { status: 400 });
	}

	const requestBody: any = {
		credentialPayload: payload.credentialPayload,
	};

	if (holderAddress) {
		// Badge issuance (eligible for Yuzu points)
		requestBody.collectionSymbol = "ocbadge";
		requestBody.holderAddress = holderAddress;
	} else if (payload.holderOcId) {
		requestBody.holderOcId = payload.holderOcId;
		// 🔹 Achievement issuance
	}
	try {
		if (!OCA_ENDPOINT) throw new Error("OCA_ENDPOINT NOT SET IN ENV");
		// Call staging issuer
		const response = await axios.post(OCA_ENDPOINT, requestBody, {
			headers: {
				"X-API-KEY": process.env.OCA_API_KEY!,
				"Content-Type": "application/json",
			},
		});

		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		console.error("Issuance failed:", error.response?.data || error.message);
		return NextResponse.json(
			{
				message: error.response?.data?.message || "Issuance failed",
				details: error.response?.data || null,
			},
			{ status: error.response?.status || 500 }
		);
	}
}
