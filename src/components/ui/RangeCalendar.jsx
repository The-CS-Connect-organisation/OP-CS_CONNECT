"use client"

import { cn } from "@/lib/utils"
import { getLocalTimeZone, today } from "@internationalized/date"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import {
  Button,
  Calendar as CalendarRac,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Calendar as CalendarRac_,
  Heading,
  RangeCalendar as RangeCalendarRac,
  composeRenderProps,
} from "react-aria-components"


const CalendarHeader = () => (
  <header className="flex w-full items-center gap-1 pb-1">
    <Button
      slot="previous"
      className="flex size-9 items-center justify-center rounded-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
    >
      <ChevronLeft size={16} strokeWidth={2} />
    </Button>
    <Heading className="grow text-center text-sm font-medium" />
    <Button
      slot="next"
      className="flex size-9 items-center justify-center rounded-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
    >
      <ChevronRight size={16} strokeWidth={2} />
    </Button>
  </header>
)


const CalendarGridComponent = ({ isRange = false }) => {
  const now = today(getLocalTimeZone())

  return (
    <CalendarGrid>
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className="size-9 rounded-lg p-0 text-xs font-medium text-muted-foreground/80">
            {day}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody className="[&_td]:px-0">
        {(date) => (
          <CalendarCell
            date={date}
            className={cn(
              "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg border border-transparent p-0 text-sm font-normal text-foreground outline-offset-2 duration-150 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
              "data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none",
              "data-[hovered]:bg-accent data-[selected]:bg-primary data-[selected]:text-primary-foreground",
              "data-[unavailable]:line-through data-[disabled]:opacity-30",
              isRange && [
                "data-[selected]:rounded-none",
                "data-[selection-end]:rounded-e-lg data-[selection-start]:rounded-s-lg",
                "data-[selection-end]:bg-primary data-[selection-start]:bg-primary",
                "data-[selection-end]:text-primary-foreground data-[selection-start]:text-primary-foreground",
              ],
              date.compare(now) === 0 && [
                "after:pointer-events-none after:absolute after:bottom-1 after:start-1/2 after:z-10 after:size-[3px] after:-translate-x-1/2 after:rounded-full after:bg-primary",
                isRange
                  ? "data-[selection-end]:[&:not([data-hover])]:after:bg-background data-[selection-start]:[&:not([data-hover])]:after:bg-background"
                  : "data-[selected]:after:bg-background",
              ],
            )}
          />
        )}
      </CalendarGridBody>
    </CalendarGrid>
  )
}


export function Calendar({ className, ...props }) {
  return (
    <CalendarRac
      {...props}
      className={composeRenderProps(className, (c) => cn("w-fit", c))}
    >
      <CalendarHeader />
      <CalendarGridComponent />
    </CalendarRac>
  )
}


export function RangeCalendar({ className, value, onChange, ...props }) {
  const now = today(getLocalTimeZone())
  const [internalValue, setInternalValue] = useState(value || {
    start: now,
    end: now.add({ days: 3 }),
  })

  const handleChange = (newValue) => {
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <RangeCalendarRac
      {...props}
      value={value || internalValue}
      onChange={handleChange}
      className={composeRenderProps(className, (c) => cn("w-fit", c))}
    >
      <CalendarHeader />
      <CalendarGridComponent isRange />
    </RangeCalendarRac>
  )
}
