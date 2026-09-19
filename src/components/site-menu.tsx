import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const CONTACT_EMAIL = "admin.dropoff@gmail.com";

export function SiteMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <Menu className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <a href="/manifesto">Manifesto</a>
        </DropdownMenuItem>
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
