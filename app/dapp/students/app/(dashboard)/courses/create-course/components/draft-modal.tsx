import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { CourseFormData } from "../page";
import { UseFormReturn } from "react-hook-form";

interface CourseModalProps {
	isEditMode: boolean;
	draftData: CourseFormData;
	form: UseFormReturn<CourseFormData>;
	setInitialData: Dispatch<SetStateAction<CourseFormData | null>>;
	setShowDraftModal: Dispatch<SetStateAction<boolean>>;
	setIsFromDraft: Dispatch<SetStateAction<boolean>>;
	initialData: CourseFormData | null;
	LOCAL_STORAGE_KEY: string;
}
const DraftModal = ({
	isEditMode,
	draftData,
	form,
	setInitialData,
	setIsFromDraft,
	setShowDraftModal,
	initialData,
	LOCAL_STORAGE_KEY,
}: CourseModalProps) => {
	return (
		<Dialog open={true}>
			<DialogContent>
				<DialogTitle>Continue with Draft?</DialogTitle>
				<DialogDescription>
					A saved draft exists. Do you want to continue with your draft or load
					the version from the database?
				</DialogDescription>
				<div className="flex justify-end gap-2 mt-4">
					<Button
						onClick={() => {
							if (isEditMode) {
								form.reset(draftData); // Load draft data into the form
							} else {
								form.reset(draftData);
								setInitialData(draftData);
								setIsFromDraft(true);
							}
							setShowDraftModal(false);
							toast.success("Draft has been restored!", {
								description:
									"Your draft has been restored. You can continue editing the old version won’t be saved anymore.",
							});
						}}
					>
						Continue with Draft
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							localStorage.removeItem(LOCAL_STORAGE_KEY); // Remove first
							if (initialData) {
								form.reset(initialData); // Revert to original DB data
								setInitialData(initialData); // Ensure initialData is consistent
							} else {
								// If no initialData (new course), reset to default empty values
								form.reset();
								setInitialData(form.getValues()); // Set initialData to current form values (which are now defaults)
							}
							setIsFromDraft(false); // Explicitly set to false
							setShowDraftModal(false);
							toast.success("Draft discarded successfully!");
						}}
					>
						Discard Draft
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DraftModal;
