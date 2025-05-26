"use client";

import OCConnectWrapper from "@/components/OCConnectWrapper";

const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
	return <OCConnectWrapper>{children}</OCConnectWrapper>;
};

export default GlobalContextProvider;
