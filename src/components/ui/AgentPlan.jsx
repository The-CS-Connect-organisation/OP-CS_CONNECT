"use client";


import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
} from "lucide-react";


const defaultTasks = [
  {
    id: "1",
    title: "Research Project Requirements",
    description: "Gather all necessary information about project scope",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "1.1",
        title: "Interview stakeholders",
        description: "Conduct interviews with key stakeholders",
        status: "completed",
        priority: "high",
      },
      {
        id: "1.2",
        title: "Review existing documentation",
        description: "Go through all available documentation",
        status: "in-progress",
        priority: "medium",
      },
      {
        id: "1.3",
        title: "Compile findings report",
        description: "Create a comprehensive report of all gathered information",
        status: "need-help",
        priority: "medium",
      },
    ],
  },
  {
    id: "2",
    title: "Design System Architecture",
    description: "Create the overall system architecture",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "2.1",
        title: "Define component structure",
        description: "Map out all required components",
        status: "pending",
        priority: "high",
      },
      {
        id: "2.2",
        title: "Create data flow diagrams",
        description: "Design how data will flow through the system",
        status: "pending",
        priority: "medium",
      },
      {
        id: "2.3",
        title: "Document API specifications",
        description: "Write detailed specifications for all APIs",
        status: "pending",
        priority: "high",
      },
    ],
  },
  {
    id: "3",
    title: "Implementation Planning",
    description: "Create a detailed plan for implementing the system",
    status: "pending",
    priority: "medium",
    level: 1,
    dependencies: ["1", "2"],
    subtasks: [
      {
        id: "3.1",
        title: "Resource allocation",
        description: "Determine required resources",
        status: "pending",
        priority: "medium",
      },
      {
        id: "3.2",
        title: "Timeline development",
        description: "Create a timeline with milestones",
        status: "pending",
        priority: "high",
      },
      {
        id: "3.3",
        title: "Risk assessment",
        description: "Identify potential risks and strategies",
        status: "pending",
        priority: "medium",
      },
    ],
  },
  {
    id: "4",
    title: "Development Environment Setup",
    description: "Set up all necessary tools and environments",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "4.1",
        title: "Install development tools",
        description: "Set up IDEs and version control",
        status: "pending",
        priority: "high",
      },
      {
        id: "4.2",
        title: "Configure CI/CD pipeline",
        description: "Set up continuous integration",
        status: "pending",
        priority: "medium",
      },
      {
        id: "4.3",
        title: "Set up testing framework",
        description: "Configure automated testing",
        status: "pending",
        priority: "high",
      },
    ],
  },
];


const StatusIcon = ({ status, size = "md" }) => {
  const s = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  const props = { className: s };
  switch (status) {
    case "completed": return <CheckCircle2 {...props} className={cn(s, "text-green-500")} />;
    case "in-progress": return <CircleDotDashed {...props} className={cn(s, "text-blue-500")} />;
    case "need-help": return <CircleAlert {...props} className={cn(s, "text-yellow-500")} />;
    case "failed": return <CircleX {...props} className={cn(s, "text-red-500")} />;
    default: return <Circle {...props} className={cn(s, "text-muted-foreground")} />;
  }
};


const getStatusBadgeClass = (status) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "in-progress": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "need-help": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "failed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
};


export function AgentPlan({ tasks = defaultTasks, theme = "dark" }) {
  const shouldReduceMotion = useReducedMotion();
  const [expandedTasks, setExpandedTasks] = useState(["1"]);
  const [expandedSubtasks, setExpandedSubtasks] = useState({});
  const isDark = theme === "dark";


  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };


  const toggleSubtaskExpansion = (taskId, subtaskId) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };


  const toggleTaskStatus = (taskId) => {
    const statuses = ["completed", "in-progress", "pending", "need-help", "failed"];
    // cycle through for demo purposes
  };


  const toggleSubtaskStatus = (taskId, subtaskId) => {
    // demo toggle
  };


  const cardBg = isDark ? "bg-zinc-900/50 border-white/5" : "bg-white border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/70" : "text-gray-600";
  const textMuted = isDark ? "text-white/40" : "text-gray-400";
  const hoverBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";


  const taskVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -5 },
    visible: {
      opacity: 1, y: 0,
      transition: {
        type: shouldReduceMotion ? "tween" : "spring",
        stiffness: 500, damping: 30,
      }
    },
  };


  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
      height: "auto", opacity: 1, overflow: "visible",
      transition: {
        duration: 0.25, staggerChildren: shouldReduceMotion ? 0 : 0.05,
        when: "beforeChildren",
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
    exit: { height: 0, opacity: 0, overflow: "hidden", transition: { duration: 0.2 } }
  };


  const subtaskVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -10 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 500, damping: 25 } },
    exit: { opacity: 0, x: shouldReduceMotion ? 0 : -10, transition: { duration: 0.15 } }
  };


  const subtaskDetailsVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: { opacity: 1, height: "auto", overflow: "visible", transition: { duration: 0.25 } }
  };


  return (
    <div className={cn("h-full overflow-auto p-2 rounded-xl", isDark ? "bg-black/20" : "bg-gray-50/50")}>
      <LayoutGroup>
        <motion.div
          className={cn("rounded-xl border shadow overflow-hidden", cardBg)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] } }}
        >
          <div className="p-4 overflow-hidden">
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";


                return (
                  <motion.li
                    key={task.id}
                    className={index !== 0 ? "mt-1 pt-2" : ""}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    <motion.div
                      className="flex items-center px-3 py-1.5 rounded-md cursor-pointer"
                      whileHover={{ backgroundColor: hoverBg, transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        className="mr-2 flex-shrink-0 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); }}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <StatusIcon status={task.status} />
                      </motion.div>


                      <motion.div
                        className="flex min-w-0 flex-grow cursor-pointer items-center justify-between"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="mr-2 flex-1 truncate">
                          <span className={cn(isCompleted && "line-through", textSecondary, "text-sm font-medium")}>
                            {task.title}
                          </span>
                        </div>


                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                          {task.dependencies.length > 0 && (
                            <div className="flex items-center mr-2">
                              <div className="flex flex-wrap gap-1">
                                {task.dependencies.map((dep, idx) => (
                                  <motion.span
                                    key={idx}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px] font-medium shadow-sm",
                                      isDark ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-600"
                                    )}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -1, transition: { duration: 0.2 } }}
                                  >
                                    {dep}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          )}


                          <motion.span
                            className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", getStatusBadgeClass(task.status))}
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                            key={task.status}
                          >
                            {task.status}
                          </motion.span>
                        </div>
                      </motion.div>
                    </motion.div>


                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          <div
                            className="absolute top-0 bottom-0 left-5 border-l-2 border-dashed"
                            style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
                          />
                          <ul className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];


                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="group flex flex-col py-0.5 pl-6 cursor-pointer"
                                  onClick={() => toggleSubtaskExpansion(task.id, subtask.id)}
                                  variants={subtaskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  layout
                                >
                                  <motion.div
                                    className="flex flex-1 items-center rounded-md p-1"
                                    whileHover={{ backgroundColor: hoverBg }}
                                    layout
                                  >
                                    <motion.div
                                      className="mr-2 flex-shrink-0 cursor-pointer"
                                      onClick={(e) => { e.stopPropagation(); }}
                                      whileTap={{ scale: 0.9 }}
                                      whileHover={{ scale: 1.1 }}
                                      layout
                                    >
                                      <StatusIcon status={subtask.status} size="sm" />
                                    </motion.div>


                                    <span className={cn(
                                      "cursor-pointer text-sm",
                                      subtask.status === "completed" ? "line-through text-muted-foreground" : textSecondary
                                    )}>
                                      {subtask.title}
                                    </span>
                                  </motion.div>


                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div
                                        className={cn(
                                          "mt-1 ml-1.5 border-l border-dashed pl-5 text-xs overflow-hidden",
                                          isDark ? "border-white/10 text-white/60" : "border-gray-300 text-gray-500"
                                        )}
                                        variants={subtaskDetailsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        layout
                                      >
                                        <p className="py-1">{subtask.description}</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
