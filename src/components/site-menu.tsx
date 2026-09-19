import { Mail, Users } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarSeparator,
  MenubarTrigger,
} from "./ui/menubar";

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
      className="size-6"
      aria-hidden="true"
    >
      <path d="M6.5 8h11" />
      <path d="M6.5 15h11" />
    </svg>
  );
}

export function SiteMenu() {
  return (
    <Menubar className="border-0 bg-transparent p-0 shadow-none">
      <MenubarMenu>
        <MenubarTrigger className="flex size-11 select-none items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground">
          <DoubleLineIcon />
          <span className="sr-only">Open menu</span>
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent
            align="end"
            alignOffset={0}
            sideOffset={10}
            className="w-64 rounded-2xl border bg-popover/95 p-2 shadow-xl backdrop-blur-md"
          >
            <div className="px-2.5 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Menu
            </div>
            <MenubarItem
              asChild
              className="gap-3.5 rounded-xl py-2.5 pl-2.5 pr-3 text-[15px] focus:bg-accent/60"
            >
              <a href="/about">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Users className="size-4" />
                </span>
                About us
              </a>
            </MenubarItem>
            <MenubarSeparator className="-mx-1 my-1" />
            <MenubarItem
              asChild
              className="gap-3.5 rounded-xl py-2.5 pl-2.5 pr-3 text-[15px] focus:bg-accent/60"
            >
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Mail className="size-4" />
                </span>
                Contact us
              </a>
            </MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>
  );
}
