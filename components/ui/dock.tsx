"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface DockItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  onHover?: () => void
}

interface DockProps {
  className?: string
  activeLabel?: string
  items: DockItem[]
}

export default function Dock({ items, className, activeLabel }: DockProps) {
  // Derive active tab directly from prop — no internal state lag
  const active = activeLabel ?? null
  const [hovered, setHovered] = React.useState<number | null>(null)
  const [tapped, setTapped] = React.useState<number | null>(null)

  return (
    <div className={cn("flex items-center justify-center w-full py-3 px-4", className)}>
      {/* Dark green glassmorphic floating capsule with elevated shadow */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-[28px]",
          "bg-[#1B4332]/95 backdrop-blur-lg",
          "shadow-[0_12px_40px_rgba(0,0,0,0.3),0_2px_12px_rgba(0,0,0,0.15)]",
          "border border-white/10"
        )}
      >
        {items.map((item, i) => {
          const isActive = active === item.label
          const isHovered = hovered === i
          const isTapped = tapped === i

          return (
            <div
              key={item.label}
              className="relative flex flex-col items-center"
              onMouseEnter={() => {
                setHovered(i)
                item.onHover?.()
              }}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Animated active indicator background pill */}
              {isActive && (
                <motion.div
                  layoutId="dock-active-pill"
                  className="absolute inset-0 bg-white/12 rounded-2xl pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}

              <motion.button
                animate={{
                  scale: isHovered ? 1.05 : isTapped ? 0.95 : 1,
                  y: isHovered ? -1 : 0,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={() => {
                  setTapped(i)
                  setTimeout(() => setTapped(null), 200)
                  item.onClick?.()
                }}
                aria-label={item.label}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5",
                  "w-[56px] h-[48px] rounded-2xl z-10",
                  "transition-colors duration-150 cursor-pointer"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-150",
                    isActive ? "text-white stroke-[2.4]" : "text-[#A5D6A7]/50 stroke-[1.9]"
                  )}
                  // @ts-ignore
                  fill={isActive ? "currentColor" : "none"}
                />

                {/* Label */}
                <span
                  className={cn(
                    "text-[9px] font-semibold leading-none tracking-wide transition-colors duration-150",
                    isActive ? "text-white font-bold" : "text-[#A5D6A7]/45"
                  )}
                >
                  {item.label}
                </span>
              </motion.button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
