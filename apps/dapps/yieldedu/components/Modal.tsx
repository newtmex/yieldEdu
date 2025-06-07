import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Dispatch, SetStateAction } from "react";

const Modal = ({
	showModal,
	setShowModal,
}: {
	showModal: boolean;
	setShowModal: Dispatch<SetStateAction<boolean>>;
}) => {
	return (
		<Dialog modal={true} open={showModal} onOpenChange={setShowModal}>
			<DialogContent className="m-2">
				<DialogHeader>
					<DialogTitle>Insufficient Tokens</DialogTitle>
					<DialogDescription className="space-y-4 pt-3">
						<p>
							You need (FYT) tokens for interaction.{" "}
							<span className="text-green-600">
								Click on the Get Test Tokens button{" "}
							</span>{" "}
							at the top right to Mint free test tokens{" "}
						</p>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};

export default Modal;
