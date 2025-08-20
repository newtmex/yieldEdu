import { CourseFormData } from "@/app/(dashboard)/courses/create-course/page";

export const checkMeaningfulDraft = (parsed: any) => {
	// More strict checking - only consider it meaningful if there's substantial content
	const hasTitle = (parsed.title || "").trim().length > 0;
	const hasDescription = (parsed.description || "").trim().length > 0;
	const hasLongDescription = (parsed.longDescription || "").trim().length > 0;
	const hasCategory = (parsed.category || "").trim().length > 0;

	const hasNonEmptyLearning =
		Array.isArray(parsed.whatYouWillLearn) &&
		parsed.whatYouWillLearn.some(
			(item: string) => (item || "").trim().length > 0
		);

	const hasSectionsContent =
		Array.isArray(parsed.sections) &&
		parsed.sections.some(
			(section: any) =>
				(section?.title || "").trim().length > 0 ||
				(Array.isArray(section?.lessons) &&
					section.lessons.some(
						(lesson: any) =>
							(lesson?.title || "").trim().length > 0 ||
							(lesson?.content !== null &&
								lesson?.content !== undefined &&
								JSON.stringify(lesson.content).length > 0)
					))
		);

	const hasQuizContent =
		Array.isArray(parsed.quizzes) &&
		parsed.quizzes.some(
			(q: any) =>
				(q?.question || "").trim().length > 0 ||
				(Array.isArray(q?.options) &&
					q.options.some((opt: string) => (opt || "").trim().length > 0)) // At least 2 characters
		);

	const hasRewardsContent = parsed.rewards && parsed.rewards.enabled === true;

	// Require at least one substantial field to be filled
	return (
		hasTitle ||
		hasDescription ||
		hasLongDescription ||
		hasCategory ||
		hasNonEmptyLearning ||
		hasSectionsContent ||
		hasQuizContent ||
		hasRewardsContent
	);
};

export function logDeepDiff(a: any, b: any, path = "") {
	if (a === b) return; // identical, no diff

	if (a === undefined || b === undefined) {
		console.log(`Diff at ${path || "root"}:`, { a, b });
		return;
	}

	if (
		typeof a !== "object" ||
		typeof b !== "object" ||
		a === null ||
		b === null
	) {
		console.log(`Diff at ${path || "root"}:`, { a, b });
		return;
	}

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			console.log(`Diff at ${path}: array length ${a.length} vs ${b.length}`);
		}
		a.forEach((item, i) => {
			logDeepDiff(item, b[i], `${path}[${i}]`);
		});
		return;
	}

	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
	keys.forEach((key) => {
		if (!(key in a)) {
			console.log(`Diff at ${path}.${key}: key missing in first object`, {
				b: b[key],
			});
		} else if (!(key in b)) {
			console.log(`Diff at ${path}.${key}: key missing in second object`, {
				a: a[key],
			});
		} else {
			logDeepDiff(a[key], b[key], path ? `${path}.${key}` : key);
		}
	});
}

export function customDeepEqual(a: any, b: any): boolean {
	// Same reference or primitive value
	if (a === b) return true;

	// Handle null or non-object types
	if (
		typeof a !== "object" ||
		typeof b !== "object" ||
		a === null ||
		b === null
	) {
		return false;
	}

	// Arrays
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!customDeepEqual(a[i], b[i])) return false;
		}
		return true;
	}

	// If one is array and other is not
	if (Array.isArray(a) !== Array.isArray(b)) return false;

	// Objects
	const keysA = Object.keys(a).filter((k) => k !== "time"); // ignore "time" fields
	const keysB = Object.keys(b).filter((k) => k !== "time");

	if (keysA.length !== keysB.length) return false;

	// Compare keys ignoring order
	const allKeys = new Set([...keysA, ...keysB]);
	for (let key of allKeys) {
		if (!customDeepEqual(a[key], b[key])) return false;
	}

	return true;
}

export const trimData = (data: CourseFormData): CourseFormData => {
	const deepClean = (obj: any): any => {
		if (Array.isArray(obj)) {
			return obj
				?.map(deepClean) // clean each element
				.filter((item) => item !== undefined && item !== null && item !== "");
		}
		if (obj && typeof obj === "object") {
			const cleaned: any = {};
			for (const key in obj) {
				if (key === "time") continue; // remove volatile timestamp
				const value = deepClean(obj[key]);
				if (value !== undefined && value !== null && value !== "") {
					cleaned[key] = value;
				}
			}
			return cleaned;
		}
		if (typeof obj === "string") return obj.trim();
		return obj;
	};

	return deepClean(data);
};
