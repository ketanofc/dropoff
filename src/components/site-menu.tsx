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
          className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <DoubleLineIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <a href="/about">About us</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact us</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled
          className="justify-center font-semibold text-primary"
          aria-disabled="true"
        >
          Donate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
