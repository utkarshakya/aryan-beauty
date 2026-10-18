import Link from "next/link";
import { Button, Input, filterSegmentClasses } from "@/components/ui";

export default function AdminDateFilter({
  dateMode,
  todayHref,
  allDatesHref,
  customDate,
  todayInputValue,
  status,
  search,
}: {
  dateMode: "today" | "date" | "all";
  todayHref: string;
  allDatesHref: string;
  customDate?: string;
  todayInputValue: string;
  status?: string;
  search?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex overflow-hidden rounded-control border border-border">
        <Link
          href={todayHref}
          aria-current={dateMode === "today" ? "page" : undefined}
          className={filterSegmentClasses(dateMode === "today")}
        >
          Today
        </Link>
        <Link
          href={allDatesHref}
          aria-current={dateMode === "all" ? "page" : undefined}
          className={`border-l border-border ${filterSegmentClasses(dateMode === "all")}`}
        >
          All dates
        </Link>
      </div>

      <form action="/admin" method="GET" className="flex items-end gap-2">
        <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
          <label
            htmlFor="appointment-date"
            className="mb-1 block text-body font-medium text-foreground"
          >
            Custom date
          </label>
          <Input
            id="appointment-date"
            name="date"
            type="date"
            autoComplete="off"
            defaultValue={customDate ?? todayInputValue}
          />
        </div>
        {status && <input type="hidden" name="status" value={status} />}
        {search && <input type="hidden" name="search" value={search} />}
        <Button type="submit" variant="outline">
          View date
        </Button>
      </form>
    </div>
  );
}
