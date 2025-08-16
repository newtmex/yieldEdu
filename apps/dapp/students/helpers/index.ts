import {
	AchievementCondition,
	performanceSummaryTpe,
} from "@/app/(dashboard)/achievements/page";

export function formatNumber(num: number) {
	if (num >= 1_000_000) {
		return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
	}
	if (num >= 1_000) {
		return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
	}
	return num.toString();
}

type Achievement = {
	id: string;
	name: string;
	condition: AchievementCondition; // e.g. "complete_first_course", "score_100_quiz", "stake_1000_edu"
};

export type Performance = {
	completedCourses: number;
	quizScores: { courseId: string; score: number }[];
	stakedEdu: number;
};

export function isUnlockable(
	achievement: Achievement,
	performance: performanceSummaryTpe
) {
	if (!achievement.condition || !performance) return false;

	const { type, count, score, amount } = achievement.condition;

	switch (type) {
		case "course_completed":
			return performance.completedCourses >= count;
		case "investment":
			return performance.totalStakedEdu >= amount;
		case "quiz_score":
			return (
				performance.quizScores.filter((q) => q.score >= score).length >= count
			);
		default:
			return false;
	}
}

export function summarizePerformance(
	performance: any[]
): performanceSummaryTpe {
	const completedCourses = performance.filter(
		(p) => p.sections_completed === p.total_sections
	).length;

	const quizScores = performance.map((p) => ({
		courseId: p.course_id,
		score: p.quiz_accuracy_percent,
	}));

	const highestScore = Math.max(...quizScores.map((q) => q.score), 0);

	const totalStakedEdu = performance.reduce((acc, p) => acc + (p.staked_edu || 0), 0);

	return {
		completedCourses,
		quizScores,
		highestScore,
		totalStakedEdu,
	};
}
