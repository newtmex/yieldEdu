"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { UserRoles } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type typeUseCoursePermissions = {
	role?: UserRoles | undefined;
	permissions:
		| {
				readonly course?:
					| (
							| "create"
							| "read"
							| "update"
							| "delete"
							| "update:own"
							| "delete:own"
					  )[]
					| undefined;
				readonly user?:
					| (
							| "create"
							| "delete"
							| "list"
							| "set-role"
							| "ban"
							| "impersonate"
							| "set-password"
					  )[]
					| undefined;
				readonly session?: ("delete" | "list" | "revoke")[] | undefined;
		  }
		| undefined;
};
const useCourseInfo = (id: string) => {
	const { data: session } = useSession();

	const {
		data: courseStatus,
		isPending,
		error,
	} = useQuery({
		queryKey: ["enrollment", session?.user.id, id],
		enabled: !!session?.user.id && !!id,
		refetchInterval: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		gcTime: 0,
		refetchOnMount: false,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("enrollments")
				.select("completed")
				.eq("course_id", id)
				.eq("user_id", session?.user.id)
				.maybeSingle();
			if (error) throw new Error(error.message);
			return data;
		},
	});

	return { course_completed: courseStatus?.completed, isPending, error };
};

export const useCoursePermissions = ({
	role,
	permissions,
}: typeUseCoursePermissions) => {
	const { data: session, isPending } = useSession();
	const [permissionsLoading, setPermissionsLoading] = useState(true);
	const [hasContentCreationPermissions, setHasContentCreationPermissions] =
		useState<null | boolean>(null);

	useEffect(() => {
		const checkPermissions = async () => {
			if (isPending) {
				return; // Still loading session
			}
			if (!session || !session?.user) {
				setHasContentCreationPermissions(false);
				setPermissionsLoading(false);
				return;
			}
			try {
				const canCreate = await authClient.admin.hasPermission({
					userId: session?.user.id,
					role,
					permissions,
				});
				if (canCreate.data?.error) {
					setHasContentCreationPermissions(false);
					throw new Error(canCreate.data.error);
				} else {
					setHasContentCreationPermissions(canCreate.data?.success || false);
				}
			} catch (error) {
				console.error("Permission check failed:", error);
				setHasContentCreationPermissions(false);
			} finally {
				setPermissionsLoading(false);
			}
		};
		checkPermissions();
	}, [session?.user.id, isPending]);
	return {
		hasContentCreationPermissions,
		permissionsLoading,
		isPermissionPending: isPending,
	};
};

export default useCourseInfo;
