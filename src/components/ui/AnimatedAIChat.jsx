"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedText } from "@/components/ui/AnimatedText";
import {
    Paperclip,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";


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
                Math.min(
                    textarea.scrollHeight,
                    maxHeight || Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}


const Textarea = React.forwardRef(({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-white/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
});
Textarea.displayName = "Textarea";


export function AnimatedAIChat({ onEnter, theme = "dark" }) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef(null);

    const isDark = theme === "dark";

    const commandSuggestions = [
        { icon: <Sparkles className="w-4 h-4" />, label: "Study Help", description: "Get help with any subject", prefix: "/study" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Explain Topic", description: "Understand any concept", prefix: "/explain" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Practice Quiz", description: "Test your knowledge", prefix: "/quiz" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Summarize", description: "Quick summary of any text", prefix: "/summarize" },
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            const matchingIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            setActiveSuggestion(matchingIndex >= 0 ? matchingIndex : -1);
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            const commandButton = document.querySelector('[data-command-button]');
            if (commandPaletteRef.current &&
                !commandPaletteRef.current.contains(target) &&
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev =>
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev =>
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selected = commandSuggestions[activeSuggestion];
                    setValue(selected.prefix + ' ');
                    setShowCommandPalette(false);
                    setRecentCommand(selected.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = () => {
        if (value.trim()) {
            startTransition(() => {
                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    setValue("");
                    adjustHeight(true);
                    onEnter?.(value.trim());
                }, 2000);
            });
        }
    };

    const handleAttachFile = () => {
        const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
        setAttachments(prev => [...prev, mockFileName]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const selectCommandSuggestion = (index) => {
        const selected = commandSuggestions[index];
        setValue(selected.prefix + ' ');
        setShowCommandPalette(false);
        setRecentCommand(selected.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    const bgSubtle = isDark ? "bg-white/[0.02]" : "bg-gray-50";
    const borderColor = isDark ? "border-white/[0.05]" : "border-gray-200";

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-2xl mx-auto relative z-10">
                <motion.div
                    className="relative z-10 space-y-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block"
                        >
                            <AnimatedText
                                text="Namaste World!"
                                textClassName={cn(
                                    "text-3xl",
                                    isDark
                                        ? "text-transparent bg-gradient-to-r from-white/90 to-white/40"
                                        : "text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
                                )}
                                underlineClassName={isDark ? "text-white/40" : "text-gray-400"}
                            />
                        </motion.div>
                        <motion.p
                            className={cn("text-sm", isDark ? "text-white/40" : "text-gray-500")}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Ask anything about your studies
                        </motion.p>
                    </div>

                    <motion.div
                        className={cn(
                            "relative backdrop-blur-2xl rounded-2xl border shadow-2xl overflow-hidden",
                            isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-white border-gray-200"
                        )}
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div
                                    ref={commandPaletteRef}
                                    className={cn(
                                        "absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl rounded-lg z-50 shadow-lg overflow-hidden",
                                        isDark ? "bg-black/90 border-white/10" : "bg-white border-gray-200"
                                    )}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className={cn("py-1", isDark ? "bg-black/95" : "bg-gray-50")}>
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                                                    activeSuggestion === index
                                                        ? isDark ? "bg-white/10 text-white" : "bg-blue-50 text-gray-900"
                                                        : isDark ? "text-white/70 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center text-white/60">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="font-medium">{suggestion.label}</div>
                                                <div className={cn("text-xs ml-1", isDark ? "text-white/30" : "text-gray-400")}>
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Ask CSAI a question..."
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-4 py-3 resize-none border-none focus:outline-none",
                                    "min-h-[60px]",
                                    isDark ? "bg-transparent text-white/90 placeholder:text-white/20" : "bg-transparent text-gray-900 placeholder:text-gray-400"
                                )}
                                style={{ overflow: "hidden" }}
                                showRing={false}
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div
                                    className="px-4 pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            className={cn(
                                                "flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg",
                                                isDark ? "bg-white/[0.03] text-white/70" : "bg-gray-100 text-gray-700"
                                            )}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <span>{file}</span>
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className={cn(
                                                    "transition-colors",
                                                    isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"
                                                )}
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 border-t flex items-center justify-between gap-4"
                            style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                        >
                            <div className="flex items-center gap-3">
                                <motion.button
                                    type="button"
                                    onClick={handleAttachFile}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors relative group",
                                        isDark ? "text-white/40 hover:text-white/90" : "text-gray-400 hover:text-gray-700"
                                    )}
                                >
                                    <Paperclip className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors relative group",
                                        showCommandPalette
                                            ? isDark ? "bg-white/10 text-white/90" : "bg-blue-50 text-blue-600"
                                            : isDark ? "text-white/40 hover:text-white/90" : "text-gray-400 hover:text-gray-700"
                                    )}
                                >
                                    <Command className="w-4 h-4" />
                                </motion.button>
                            </div>

                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    value.trim() && !isTyping
                                        ? isDark
                                            ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                            : "bg-gray-900 text-white shadow-lg"
                                        : isDark ? "bg-white/[0.05] text-white/40" : "bg-gray-100 text-gray-400"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span>Send</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {commandSuggestions.map((suggestion, index) => (
                            <motion.button
                                key={suggestion.prefix}
                                onClick={() => selectCommandSuggestion(index)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all relative group",
                                    isDark
                                        ? "bg-white/[0.02] hover:bg-white/[0.05] text-white/60 hover:text-white/90 border border-white/[0.05]"
                                        : "bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
                                )}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {suggestion.icon}
                                <span>{suggestion.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isTyping && (
                    <motion.div
                        className={cn(
                            "fixed bottom-8 mx-auto transform -translate-x-1/2 backdrop-blur-2xl rounded-full px-4 py-2 shadow-lg",
                            isDark ? "bg-white/[0.02] border " + borderColor : "bg-white border-gray-200"
                        )}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-8 h-7 rounded-full flex items-center justify-center text-center text-xs font-medium",
                                isDark ? "bg-white/[0.05] text-white/90" : "bg-gray-100 text-gray-700"
                            )}>
                                CSAI
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <span>Thinking</span>
                                <TypingDots />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {inputFocused && (
                <motion.div
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}


function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{ boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)" }}
                />
            ))}
        </div>
    );
}
