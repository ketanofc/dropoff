import { Mail, Users } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
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
      className="size-5"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function SiteMenu() {
  return (
    <>
      <Menubar className="border-0 bg-transparent p-0 shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="flex size-9 select-none items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground">
            <DoubleLineIcon />
            <span className="sr-only">Open menu</span>
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent
              align="end"
              alignOffset={0}
              sideOffset={10}
              className="w-48 rounded-2xl p-1.5"
            >
              <MenubarItem asChild className="gap-2.5 rounded-lg">
                <a href="/about">
                  <Users className="size-4 text-muted-foreground" /> About us
                </a>
              </MenubarItem>
              <MenubarItem asChild className="gap-2.5 rounded-lg">
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail className="size-4 text-muted-foreground" /> Contact us
                </a>
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    </>
  );
}
