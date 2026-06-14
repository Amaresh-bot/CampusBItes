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
  const [active, setActive] = React.useState<string | null>(activeLabel || null)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const [tapped, setTapped] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (activeLabel !== undefined) {
      setActive(activeLabel)
    }
  }, [activeLabel])

  return (
    <div className={cn("flex items-end justify-center w-full py-2", className)}>
      {/* Glassmorphic floating capsule */}
      <div
        className={cn(
          "flex items-end gap-1 px-3 py-2 rounded-[28px]",
          "bg-white/80 backdrop-blur-md",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
          "border border-white/60"
        )}
      >
        {items.map((item, i) => {
          const isActive = active === item.label
          const isHovered = hovered === i
          const isTapped = tapped === i
          const isCart = item.label === "Cart"

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
              {/* Cart: Elevated circular floating button */}
              {isCart ? (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  animate={{
                    scale: isHovered ? 1.08 : isTapped ? 0.88 : 1,
                    y: isHovered ? -3 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onClick={() => {
                    setActive(item.label)
                    setTapped(i)
                    setTimeout(() => setTapped(null), 300)
                    item.onClick?.()
                  }}
                  aria-label={item.label}
                  className={cn(
                    "relative flex items-center justify-center",
                    "w-[52px] h-[52px] rounded-full",
                    "-mt-5 mb-1",
                    "shadow-[0_4px_18px_rgba(27,77,62,0.45)]",
                    "border-[3px] border-white",
                    isActive
                      ? "bg-[#1B4D3E]"
                      : "bg-[#1B4D3E] hover:bg-[#2E7D5A]",
                    "transition-colors duration-200"
                  )}
                >
                  <item.icon
                    className="w-[22px] h-[22px] text-white stroke-[2.2]"
                  />
                  {/* Active pulse ring */}
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-[#1B4D3E]/30 pointer-events-none"
                    />
                  )}
                </motion.button>
              ) : (
                /* Standard icon tab button */
                <motion.button
                  animate={{
                    scale: isHovered ? 1.15 : isTapped ? 0.90 : 1,
                    y: isHovered ? -2 : 0,
                  }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onClick={() => {
                    setActive(item.label)
                    setTapped(i)
                    setTimeout(() => setTapped(null), 300)
                    item.onClick?.()
                  }}
                  aria-label={item.label}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5",
                    "w-[48px] h-[44px] rounded-2xl",
                    "transition-colors duration-150",
                    isActive
                      ? "text-[#1B4D3E]"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors duration-150",
                      isActive ? "text-[#1B4D3E] stroke-[2.4]" : "text-slate-400 stroke-[1.9]"
                    )}
                  />

                  {/* Label */}
                  <span
                    className={cn(
                      "text-[9px] font-bold leading-none tracking-wide transition-colors duration-150",
                      isActive ? "text-[#1B4D3E]" : "text-slate-400"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator dot */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        key="active-dot"
                        layoutId="nav-active-dot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#1B4D3E]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Tap ripple */}
                  <AnimatePresence>
                    {isTapped && (
                      <motion.span
                        key="ripple"
                        initial={{ scale: 0.5, opacity: 0.4 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="absolute inset-0 rounded-2xl bg-[#1B4D3E]/15 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Cart label below (outside circle) */}
              {isCart && (
                <span
                  className={cn(
                    "text-[9px] font-bold leading-none tracking-wide -mt-0.5 transition-colors duration-150",
                    isActive ? "text-[#1B4D3E]" : "text-slate-400"
                  )}
                >
                  {item.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
