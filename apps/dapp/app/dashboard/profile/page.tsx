"use client";

import { useOCAuth } from "@opencampus/ocid-connect-js";

const Page = () => {
	const { isInitialized, authState, ocAuth, OCId, ethAddress } = useOCAuth();

	if (!isInitialized) {
		return <div>Loading...</div>;
	} else if (authState.error !== undefined) {
		return <div>Error: {authState.error.message}</div>;
	} else {
		return (
			<div>
				<h4>User Info</h4>
				<pre>{JSON.stringify(ocAuth?.getAuthState(), null, 2)}</pre>
				<pre>{OCId}</pre>
				<pre>{ethAddress}</pre>
			</div>
		);
	}
};
export default Page;
