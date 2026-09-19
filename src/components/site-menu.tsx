import { Heart, Mail, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const CONTACT_EMAIL = "admin.dropoff@gmail.com";

function DoubleLineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function SiteMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <DoubleLineIcon />
          <span className="hidden sm:inline">Menu</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] rounded-2xl border bg-background p-1.5 shadow-2xl"
      >
        <DropdownMenuItem asChild className="rounded-lg">
          <a href="/about" className="gap-2.5">
            <Users className="size-4 text-muted-foreground" /> About us
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg">
          <a href={`mailto:${CONTACT_EMAIL}`} className="gap-2.5">
            <Mail className="size-4 text-muted-foreground" /> Contact us
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem
          disabled
          className="gap-2 rounded-lg justify-center bg-foreground font-semibold text-background"
          aria-disabled="true"
        >
          <Heart className="size-4" /> DONATE
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
