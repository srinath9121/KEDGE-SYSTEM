"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

const latestChange = {
	title: "Real-time funnels",
	description:
		"Build and analyze conversion funnels with live event streaming in real-time.",
	url: "#",
};

export function LatestChange() {
	const [isOpen, setIsOpen] = useState(true);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className={cn(
				"group/latest-change rounded-xl border bg-muted/50 p-4 transition-all duration-200 hover:bg-muted"
			)}
		>
			<div className="relative flex size-full flex-col gap-1.5 overflow-hidden">
				<div className="flex items-center justify-between">
					<p className="font-semibold text-xs text-foreground">UPDATE</p>
					<Button
						className="size-5 rounded-full p-0 hover:bg-accent"
						onClick={() => setIsOpen(false)}
						size="icon"
						variant="ghost"
					>
						<XIcon className="size-3 text-muted-foreground" />
					</Button>
				</div>
				<p className="font-bold text-sm text-foreground">{latestChange.title}</p>
				<span className="text-xs text-muted-foreground leading-normal">
					{latestChange.description}
				</span>
				<Button
					asChild
					className="w-max px-0 font-medium text-xs text-primary"
					size="sm"
					variant="link"
				>
					<a href={latestChange.url}>Learn more</a>
				</Button>
			</div>
		</div>
	);
}
