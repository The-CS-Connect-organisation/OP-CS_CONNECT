"use client";


import { ArrowRight, Bot, Check, ChevronDown, Paperclip } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";


function useAutoResizeTextarea({ minHeight, maxHeight }) {
    const textareaRef = useRef(null);


    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;


            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }


            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );


    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);


    return { textareaRef, adjustHeight };
}


const AI_MODELS = [
    "o3-mini",
    "Gemini 2.5 Flash",
    "Claude 3.5 Sonnet",
    "GPT-4.1 Mini",
    "GPT-4.1",
];


const MODEL_ICONS = {
    "o3-mini": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    "Gemini 2.5 Flash": (
        <svg width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" fill="url(#gem)"/>
            <defs>
                <linearGradient id="gem" x1="0%" y1="100%" x2="68.73%" y2="30.395%">
                    <stop offset="0%" stopColor="#1C7DFF"/>
                    <stop offset="100%" stopColor="#1C69FF"/>
                </linearGradient>
            </defs>
        </svg>
    ),
    "Claude 3.5 Sonnet": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z"/>
        </svg>
    ),
    "GPT-4.1 Mini": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    "GPT-4.1": (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
};


export function AIPromptBar({
    value = "",
    onChange,
    onSend,
    selectedModel,
    onModelChange,
    theme = "dark",
    placeholder = "What can I do for you?",
    disabled = false,
}) {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    });
    const internalValueRef = useRef(value || "");
    const [isFocused, setIsFocused] = useState(false);

    const isDark = theme === "dark";

    const bgSubtle = isDark ? "bg-white/5" : "bg-gray-50";
    const bgSubtleHover = isDark ? "hover:bg-white/10" : "hover:bg-gray-100";
    const borderColor = isDark ? "border-white/10" : "border-gray-200";
    const textPrimary = isDark ? "text-white" : "text-gray-900";
    const textMuted = isDark ? "text-white/40" : "text-gray-400";
    const textSecondary = isDark ? "text-white/70" : "text-gray-600";
    const dropdownBg = isDark ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200";

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const current = internalValueRef.current;
            if (current.trim()) {
                onSend?.(current);
                onChange?.("");
                internalValueRef.current = "";
                if (textareaRef.current) textareaRef.current.value = "";
                adjustHeight(true);
            }
        }
    };


    const handleChange = (e) => {
        const val = e.target.value;
        internalValueRef.current = val;
        onChange?.(val);
        adjustHeight();
    };


    const handleSend = () => {
        const current = internalValueRef.current;
        if (!current.trim()) return;
        onSend?.(current);
        onChange?.("");
        internalValueRef.current = "";
        if (textareaRef.current) textareaRef.current.value = "";
        adjustHeight(true);
    };


    return (
        <div className="w-full">
            <div className={cn("rounded-2xl p-1.5 border transition-colors", bgSubtle, borderColor)}>
                <div className="relative">
                    <div className="flex flex-col">
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            <textarea
                                id="ai-prompt-input"
                                defaultValue={value}
                                placeholder={placeholder}
                                className={cn(
                                    "w-full rounded-xl rounded-b-none px-4 py-3 border-none resize-none",
                                    "focus:outline-none focus:ring-0",
                                    "min-h-[72px]",
                                    isDark
                                        ? "bg-transparent text-white placeholder:text-white/30"
                                        : "bg-transparent text-gray-900 placeholder:text-gray-400"
                                )}
                                ref={textareaRef}
                                onKeyDown={handleKeyDown}
                                onChange={handleChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                disabled={disabled}
                            />
                        </div>


                        <div className="h-14 rounded-b-xl flex items-center">
                            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md font-medium",
                                                    "focus-visible:ring-1 focus-visible:ring-offset-0",
                                                    isDark ? "text-white/70 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
                                                )}
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedModel}
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {MODEL_ICONS[selectedModel] || <Bot className="w-4 h-4 opacity-50" />}
                                                        <span className="hidden sm:inline">{selectedModel}</span>
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className={cn("min-w-[10rem]", dropdownBg)}>
                                            {AI_MODELS.map((model) => (
                                                <DropdownMenuItem
                                                    key={model}
                                                    onSelect={() => onModelChange?.(model)}
                                                    className="flex items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {MODEL_ICONS[model] || <Bot className="w-4 h-4 opacity-50" />}
                                                        <span className={textPrimary}>{model}</span>
                                                    </div>
                                                    {selectedModel === model && (
                                                        <Check className={cn("w-4 h-4", isDark ? "text-violet-400" : "text-blue-500")} />
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <div className={cn("h-4 w-px mx-0.5", isDark ? "bg-white/10" : "bg-gray-200")} />
                                    <label
                                        className={cn(
                                            "rounded-lg p-2 cursor-pointer transition-colors",
                                            bgSubtleHover,
                                            textMuted
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" />
                                        <Paperclip className="w-4 h-4" />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded-lg p-2 transition-colors",
                                        bgSubtleHover,
                                        internalValueRef.current.trim() ? "text-primary" : textMuted
                                    )}
                                    aria-label="Send message"
                                    disabled={!internalValueRef.current.trim() || disabled}
                                    onClick={handleSend}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
