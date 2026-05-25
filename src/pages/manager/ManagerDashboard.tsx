import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  LayoutDashboard, Users, GraduationCap, CreditCard, Bus,
  Calendar, FileText, BarChart3, Bell, Settings, Shield,
  TrendingUp, UserCheck, DollarSign, BookOpen, Megaphone,
  AlertTriangle, Activity, Clock, Star, Target, Zap,
  Building, Wallet, PieChart, Globe, Lock, Eye
} from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ students: 0, teachers: 0, revenue: 0, attendance: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          apiFetch("/students"),
          apiFetch("/teachers"),
        ]);
        const studentCount = Array.isArray(studentsRes.data) ? studentsRes.data.length : 0;
        const teacherCount = Array.isArray(teachersRes.data) ? teachersRes.data.length : 0;
        setStats({ students: studentCount, teachers: teacherCount, revenue: 850000, attendance: 91 });
      } catch {
        setStats({ students: 4, teachers: 2, revenue: 850000, attendance: 91 });
      }
    })();
  }, []);

  const quickStats = [
    { label: "Total Students", value: stats.students, icon: GraduationCap, color: "from-orange-500 to-amber-500", change: "+12" },
    { label: "Total Teachers", value: stats.teachers, icon: Users, color: "from-orange-500 to-amber-500", change: "+3" },
    { label: "Revenue (YTD)", value: `Rs ${(stats.revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "from-emerald-500 to-teal-500", change: "+18%" },
    { label: "Avg Attendance", value: `${stats.attendance}%`, icon: UserCheck, color: "from-orange-500 to-amber-500", change: "+2%" },
  ];

  const recentActivity = [
    { action: "New student enrolled", detail: "Kavya Nair - Class 10-A", time: "2h ago", icon: GraduationCap, color: "text-orange-500" },
    { action: "Fee payment received", detail: "Rs 25,000 - Aarav Sharma", time: "3h ago", icon: CreditCard, color: "text-emerald-500" },
    { action: "Circular published", detail: "Annual Sports Day", time: "5h ago", icon: Megaphone, color: "text-orange-500" },
    { action: "Attendance alert", detail: "3 students absent - 10-B", time: "6h ago", icon: AlertTriangle, color: "text-amber-500" },
    { action: "Teacher leave request", detail: "Prof. Sunita Verma - May 28", time: "8h ago", icon: Calendar, color: "text-rose-500" },
    { action: "Library book overdue", detail: "2 books - Physics Lab Manual", time: "1d ago", icon: BookOpen, color: "text-orange-500" },
  ];

  const pendingActions = [
    { title: "Review fee installment requests", count: 5, priority: "high", icon: Wallet },
    { title: "Approve teacher leave applications", count: 3, priority: "medium", icon: Calendar },
    { title: "Verify new student enrollments", count: 2, priority: "high", icon: UserCheck },
    { title: "Update bus route assignments", count: 1, priority: "low", icon: Bus },
    { title: "Review anonymous reports", count: 4, priority: "medium", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200">Management</div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Full Access
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-orange-500" size={32} />
          Manager Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Complete oversight of all school operations</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Actions */}
        <div className="lg:col-span-5">
          <Card className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" /> Pending Actions
            </h3>
            <div className="space-y-3">
              {pendingActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      action.priority === "high" ? "bg-rose-50 text-rose-500" :
                      action.priority === "medium" ? "bg-amber-50 text-amber-500" : "bg-orange-50 text-orange-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-orange-500 transition-colors">{action.title}</p>
                      <p className="text-[10px] text-muted-foreground">{action.count} pending</p>
                    </div>
                    <Badge className={`text-[9px] ${
                      action.priority === "high" ? "bg-rose-100 text-rose-600" :
                      action.priority === "medium" ? "bg-amber-100 text-amber-600" : "bg-orange-100 text-orange-600"
                    }`}>{action.priority}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-7">
          <Card className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" /> Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all">
                    <Icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Access Grid */}
      <Card className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-500" /> Management Access
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "User Management", icon: Users, path: "/manager/users" },
            { label: "Academics", icon: GraduationCap, path: "/manager/academics" },
            { label: "Finance", icon: Wallet, path: "/manager/finance" },
            { label: "Transport", icon: Bus, path: "/manager/transport" },
            { label: "Analytics", icon: BarChart3, path: "/manager/analytics" },
            { label: "Circulars", icon: FileText, path: "/manager/circulars" },
            { label: "Announcements", icon: Megaphone, path: "/manager/announcements" },
            { label: "Events", icon: Calendar, path: "/manager/events" },
            { label: "Exams", icon: BookOpen, path: "/manager/exams" },
            { label: "Timetable", icon: Clock, path: "/manager/timetable" },
            { label: "Notifications", icon: Bell, path: "/manager/notifications" },
            { label: "Comms Hub", icon: Globe, path: "/manager/comms-hub" },
            { label: "AI Lab", icon: Zap, path: "/manager/ai" },
            { label: "Payroll", icon: DollarSign, path: "/manager/payroll" },
            { label: "Security", icon: Lock, path: "/manager/security" },
            { label: "Reports", icon: PieChart, path: "/manager/reports" },
            { label: "Settings", icon: Settings, path: "/manager/settings" },
            { label: "Audit Log", icon: Eye, path: "/manager/audit-log" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.label} href={item.path} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 hover:shadow-md transition-all group border border-transparent hover:border-orange-200">
                <div className="w-10 h-10 rounded-xl bg-accent group-hover:bg-orange-50 flex items-center justify-center group-hover:text-orange-500 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-center uppercase tracking-wider text-muted-foreground group-hover:text-orange-600 transition-colors">{item.label}</span>
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
