"use client";

import { useRef } from "react";
import { useKeypress } from "@/hooks/use-keypress";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import { SearchIcon } from "lucide-react";

export function AppSearch() {
	const groupRef = useRef(null);
	const { setOpen } = useSidebar();

	useKeypress({
		combo: ["meta+k", "ctrl+k"],
		callback: () => {
			const input = groupRef.current?.querySelector<HTMLInputElement>(
				"[data-slot=input-group-control]"
			);
			input?.focus({ preventScroll: true });
			setOpen(true);
		},
	});

	return (
		<InputGroup ref={groupRef} className="max-w-sm">
			<InputGroupAddon align="inline-start" className="pl-1.75">
				<SearchIcon className="size-4 text-muted-foreground" />
			</InputGroupAddon>
			<InputGroupInput
				aria-label="Search"
				name="q"
				placeholder="Search..."
				type="search"
				className="bg-muted/50 border-none pl-8"
			/>
			<InputGroupAddon align="inline-end">
				<KbdGroup>
					<Kbd>⌘</Kbd>
					<Kbd>K</Kbd>
				</KbdGroup>
			</InputGroupAddon>
		</InputGroup>
	);
}
