"use client"

import { useState } from "react"

const tabs = ["View all", "Delivered", "In progress", "Refunded"]

export const OrderTabs = () => {
  const [active, setActive] = useState("View all")

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      {tabs.map((label) => (
        <button
          key={label}
          onClick={() => setActive(label)}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            active === label
              ? "bg-primary text-white"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}