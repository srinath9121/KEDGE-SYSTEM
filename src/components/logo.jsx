import React from "react"

export function LogoIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 text-primary"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" fill="currentColor" fillOpacity="0.2" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" fill="currentColor" fillOpacity="0.2" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
