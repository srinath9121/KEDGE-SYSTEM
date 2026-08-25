"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronsUpDown, Check, Building2, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"

const organizations = [
  {
    name: "Efferd",
    logoColor: "from-emerald-400 to-blue-500",
    id: "efferd",
  },
  {
    name: "Acme Inc",
    logoColor: "from-orange-400 to-rose-500",
    id: "acme-inc",
  },
  {
    name: "Evil Corp",
    logoColor: "from-blue-600 to-indigo-800",
    id: "evil-corp",
  },
]

export function OrgSwitcher() {
  const { state } = useSidebar()
  const [selectedOrg, setSelectedOrg] = React.useState(organizations[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center justify-between rounded-lg border bg-muted/30 p-2 text-left text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Switch organization"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Animated/Glowing Logo Icon */}
            <div
              className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${selectedOrg.logoColor} shadow-md shadow-emerald-500/10`}
            >
              <div className="absolute inset-0 rounded-lg bg-white/10 blur-[1px]" />
              <Building2 className="relative h-4 w-4 text-white" />
            </div>

            {/* Title - Hidden when collapsed */}
            <AnimatePresence mode="wait">
              {state === "expanded" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col"
                >
                  <span className="font-semibold text-sm text-foreground truncate max-w-[100px]">
                    {selectedOrg.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Enterprise
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {state === "expanded" && (
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setSelectedOrg(org)}
            className="flex items-center justify-between cursor-pointer py-2"
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br ${org.logoColor}`}
              >
                <Building2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-sm">{org.name}</span>
            </div>
            {selectedOrg.id === org.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Create organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
