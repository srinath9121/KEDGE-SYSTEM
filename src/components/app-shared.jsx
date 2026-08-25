import React from "react";
import {
	LayoutDashboardIcon,
	MousePointerClickIcon,
	FunnelIcon,
	RepeatIcon,
	GitBranchIcon,
	UsersIcon,
	ChartPieIcon,
	UserIcon,
	PlugIcon,
} from "lucide-react";

export const navGroups = [
	{
		label: "Platform",
		items: [
			{
				title: "Dashboard",
				path: "#/dashboard",
				icon: <LayoutDashboardIcon />,
				isActive: true,
			},
			{
				title: "Content Calendar",
				path: "#/calendar",
				icon: <RepeatIcon />, // Close enough placeholder
			},
			{
				title: "Campaigns",
				path: "#/campaigns",
				icon: <MousePointerClickIcon />,
			},
			{
				title: "Analytics",
				path: "#/analytics",
				icon: <ChartPieIcon />,
			},
			{
				title: "Team",
				path: "#/team",
				icon: <UsersIcon />,
			},
			{
				title: "Integrations",
				path: "#/integrations",
				icon: <PlugIcon />,
			},
		],
	},
];

export const navLinks = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
];
