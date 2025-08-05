import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

enum UserRoles {
	admin = "admin",
	partner = "partner",
	creator = "creators",
	user = "user",
}
/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
	...defaultStatements,
	course: ["create", "read", "update", "delete", "update:own", "delete:own"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
	[UserRoles?.user]: ac.newRole({
		course: ["read"],
	}),

	[UserRoles?.partner]: ac.newRole({
		course: ["read", "create", "delete:own", "update:own"],
	}),
	[UserRoles?.creator]: ac.newRole({
		course: ["read", "create", "delete:own", "update:own"],
	}),
	[UserRoles?.admin]: ac.newRole({
		...adminAc.statements,
		course: [...statement.course],
	}),
};
