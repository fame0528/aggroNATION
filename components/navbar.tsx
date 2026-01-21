import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";

const navItems = [
  { label: "RSS", href: "/rss", icon: "📰" },
  { label: "Reddit", href: "/reddit", icon: "🔴" },
  { label: "YouTube", href: "/youtube", icon: "▶️" },
  { label: "X", href: "/x", icon: "✕" },
];

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="full" position="sticky" className="border-b border-divider">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <svg
              className="w-8 h-8"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="6" fill="currentColor" className="text-primary" />
              <path
                d="M16 8L20 12L16 16L12 12L16 8Z"
                fill="white"
              />
              <path
                d="M16 16L20 20L16 24L12 20L16 16Z"
                fill="white"
                fillOpacity="0.7"
              />
            </svg>
            <p className="font-bold text-xl">Aggronation</p>
          </NextLink>
        </NavbarBrand>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex gap-4 justify-start ml-8">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium flex items-center gap-2"
                )}
                href={item.href}
              >
                <span>{item.icon}</span>
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Navigation */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <Link
                className="flex items-center gap-2"
                href={item.href}
                size="lg"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
