function LoadingScreen({ text }: { text?: string }) {
	return (
		<div className="flex h-screen flex-col items-center justify-center">
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				className="text-foreground"
			>
				<circle cx="4" cy="12" r="2" fill="currentColor">
					<animate
						id="spinner_qFRN"
						begin="0;spinner_OcgL.end+0.25s"
						attributeName="cy"
						calcMode="spline"
						dur="0.6s"
						values="12;6;12"
						keySplines=".33,.66,.66,1;.33,0,.66,.33"
					/>
				</circle>
				<circle cx="12" cy="12" r="2" fill="currentColor">
					<animate
						begin="spinner_qFRN.begin+0.1s"
						attributeName="cy"
						calcMode="spline"
						dur="0.6s"
						values="12;6;12"
						keySplines=".33,.66,.66,1;.33,0,.66,.33"
					/>
				</circle>
				<circle cx="20" cy="12" r="2" fill="currentColor">
					<animate
						id="spinner_OcgL"
						begin="spinner_qFRN.begin+0.2s"
						attributeName="cy"
						calcMode="spline"
						dur="0.6s"
						values="12;6;12"
						keySplines=".33,.66,.66,1;.33,0,.66,.33"
					/>
				</circle>
			</svg>
			{text ? (
				<p className="mt-4 text-lg">{text}.</p>
			) : (
				<p className="mt-4 text-lg">Please wait, we are redirecting you...</p>
			)}
		</div>
	);
}
export default LoadingScreen;
