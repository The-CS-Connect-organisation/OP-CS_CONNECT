"use client";

import * as React from "react";
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";


const DropdownContext = createContext(null);


export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const [activeDescendant, setActiveDescendant] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, activeDescendant, setActiveDescendant }}>
      <div className="relative inline-block" ref={ref}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}


export function DropdownMenuTrigger({ asChild = false, children, ...props }) {
  const { setOpen, open } = useContext(DropdownContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        setOpen((v) => !v);
        children.props.onClick?.(e);
        props.onClick?.(e);
      },
      ...props,
    });
  }

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      {...props}
    >
      {children}
    </button>
  );
}


export function DropdownMenuContent({ children, className, align = "left", sideOffset = 4, ...props }) {
  const { open, setOpen } = useContext(DropdownContext);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.12 }}
          className={cn(
            "z-50 min-w-[8rem] rounded-xl border shadow-2xl p-1",
            "bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          style={{ marginTop: `${sideOffset}px` }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export function DropdownMenuItem({ children, className, onSelect, ...props }) {
  const { setOpen } = useContext(DropdownContext);

  const handleSelect = (e) => {
    onSelect?.(e);
    setOpen(false);
  };

  return (
    <button
      type="button"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none",
        "text-gray-700 dark:text-gray-200",
        "hover:bg-gray-100 dark:hover:bg-white/10",
        "focus:bg-gray-100 dark:focus:bg-white/10",
        "transition-colors w-full text-left",
        className
      )}
      onMouseDown={handleSelect}
      {...props}
    >
      {children}
    </button>
  );
}


export function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-white/10", className)}
      {...props}
    />
  );
}


export function DropdownMenuLabel({ children, className, ...props }) {
  return (
    <div
      className={cn("px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </div>
  );
}
