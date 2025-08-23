"use client";
import VIPHuman from "@/public/being-vip.svg";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import CourseCard from "@/components/course-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useCoursePermissions } from "@/hooks/course";
import { UserRoles } from "@/lib/permissions";
import { authClient } from "@/lib/auth-client";
import Loading from "@/app/loading";

const page = () => {
	const { data: session } = authClient.useSession();

	const { hasContentCreationPermissions } = useCoursePermissions({
		role: session?.user.role as UserRoles,
		permissions: {
			course: ["create", "delete:own", "update:own"],
		},
	});

	const { data: courses, isPending } = useQuery({
		queryKey: ["courses"],
		queryFn: async () => {
			const response = await supabase
				.from("courses")
				.select("title,description,rating,id,image_url");

			if (response.error) {
				console.log(response.error);
				throw new Error(response.error.message);
			}

			return response.data;
		},
	});

	if (hasContentCreationPermissions === null) {
		return <Loading />;
	}

	return (
		<div className="space-y-4 p-5">
			<div className="flex border-b flex-col md:flex-row max-w-4xl mx-auto justify-center items-center gap-4 ">
				<div className="flex-[1.5] w-full space-y-3">
					<h1 className="text-xl md:text-3xl lg:text-5xl mb-2 font-bold">
						Learn and Earn at Your Own Pace
					</h1>
					<p className="text-muted-foreground text-[14px]">
						Explore bite-sized lessons designed to build your knowledge and
						momentum. As you complete activities, you’ll earn YUZU points, grow
						your learning streak, and unlock new opportunities on your journey.
					</p>
					{hasContentCreationPermissions && (
						<div className="flex gap-4">
							<Link href={"/courses/create-course"}>
								<Button>Create Course</Button>
							</Link>
							<Link href={"/courses/manage-course"}>
								<Button variant={"outline"}>Manage Course</Button>
							</Link>
						</div>
					)}
				</div>
				<div className="flex-1 hidden md:flex w-full">
					<Image
						alt="being vip"
						className="h-auto w-full invert-0 dark:invert"
						src={VIPHuman}
					/>
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4">
				{isPending ? (
					Array.from({ length: 5 }).map((_, idx) => (
						<Card
							key={idx}
							className="grid grid-cols-2 gap-5 w-full rounded-xl p-5 animate-pulse"
						>
							<div>
								<Skeleton className="h-4 w-full bg-primary/5 rounded" />
								<div className="pt-4 flex flex-col gap-2">
									<Skeleton className="h-2 w-[200px] bg-primary/5 rounded" />
									<Skeleton className="h-2 w-[180px] bg-primary/5 rounded" />
									<Skeleton className="h-2 w-[170px] bg-primary/5 rounded" />
								</div>
								<div className="space-y-2 pt-7">
									<Skeleton className="h-8 w-[110px] bg-primary/5 rounded" />
								</div>
							</div>
							<div className="w-full h-[170px] bg-primary/5 rounded" />
						</Card>
					))
				) : courses && courses?.length > 0 ? (
					courses?.map((course: any) => (
						<CourseCard key={course.id} {...course} />
					))
				) : !navigator.onLine ? (
					<div className="col-span-full flex flex-col items-center justify-center py-12">
						<p className="text-lg font-semibold text-red-500">
							No internet connection
						</p>
						<p className="text-muted-foreground text-sm mt-2">
							Please check your network and try again.
						</p>
					</div>
				) : (
					<div className="col-span-full flex flex-col items-center justify-center py-12">
						<p className="text-lg font-semibold">No courses found</p>
						<p className="text-muted-foreground text-sm mt-2">
							Start by creating your first course!
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default page;
