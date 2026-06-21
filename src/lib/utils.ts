
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function normalizeAcademicPercentage(value: number): number {
  const numeric = Number(value || 0)
  if (Number.isNaN(numeric)) return 0
  if (numeric <= 4) return Math.round(Math.max(0, numeric) * 25)
  return Math.round(Math.min(Math.max(numeric, 0), 100))
}

export function formatPercentage(value: number): string {
  return `${normalizeAcademicPercentage(value)}%`
}

export function formatAcademicPercentage(value: number): string {
  return formatPercentage(value)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}
