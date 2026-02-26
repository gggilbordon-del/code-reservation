import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col items-center gap-5 md:flex-row md:justify-center md:gap-10",
        month: "w-full max-w-[340px] space-y-4 rounded-xl",
        caption: "relative flex h-10 items-start justify-start pr-24 pt-1",
        caption_label: "text-base font-semibold text-slate-800",
        nav: "absolute right-0 top-0 flex items-center gap-1",
        nav_button:
          "h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100",
        nav_button_previous: "static",
        nav_button_next: "static",
        table: "w-full border-collapse",
        head_row: "mb-1 flex w-full justify-between",
        head_cell:
          "h-10 w-10 rounded-md text-[0.75rem] font-medium uppercase tracking-wide text-slate-400",
        row: "mt-1 flex w-full justify-between",
        cell: "relative h-10 w-10 p-0 text-center text-sm",
        day: "h-10 w-10 p-0 text-center",
        day_button:
          "inline-flex h-10 w-10 items-center justify-center rounded-lg p-0 text-center font-medium text-slate-700 transition hover:bg-[#fef3c7]",
        selected:
          "border border-amber-300 bg-amber-200 text-amber-900 shadow-sm hover:bg-amber-200 focus:bg-amber-200",
        today: "border border-cyan-300 text-cyan-700",
        outside: "text-slate-300 opacity-50",
        disabled:
          "cursor-not-allowed text-slate-300 opacity-70 line-through decoration-slate-300",
        range_start:
          "rounded-l-lg rounded-r-none border border-amber-300 bg-amber-200 text-amber-900 hover:bg-amber-200",
        range_end:
          "rounded-r-lg rounded-l-none border border-amber-300 bg-amber-200 text-amber-900 hover:bg-amber-200",
        range_middle:
          "rounded-none bg-[#fef3c7] text-amber-900 hover:bg-[#fef3c7]",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
