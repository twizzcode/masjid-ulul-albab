"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import {
  IconCreditCard,
  IconLogin,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const NavUser = () => {
  const { user } = useUser();
  const router = useRouter();

  // Get user initials for fallback
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 bg-background h-full"
          aria-label="Profile"
        >
          <Avatar className="w-5 h-5">
            <AvatarImage
              src={user?.image || undefined}
              alt={user?.name || "User"}
            />
            <AvatarFallback className="text-[10px] transition-colors text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-medium transition-colors text-foreground">
            Profile
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        // side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={10}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={user?.image || undefined}
                alt={user?.name || "User"}
              />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.name || "User"}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email || "user@example.com"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconUserCircle />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconNotification />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={`${
            user?.name
              ? "hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
              : "hover:bg-green-500/10 focus:bg-green-500/10 cursor-pointer"
          }`}
          onClick={async () => {
            if (user?.name) {
              try {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      toast.success("Berhasil logout");
                      router.push("/login");
                      router.refresh();
                    },
                    onError: (ctx) => {
                      toast.error("Gagal logout");
                      console.error("Logout error:", ctx.error);
                    },
                  },
                });
              } catch (error) {
                console.error("Logout error:", error);
                toast.error("Gagal logout");
              }
            } else {
              router.push("/login");
            }
          }}
        >
          {user?.name ? (
            <>
              <IconLogout />
              Log out
            </>
          ) : (
            <>
              <IconLogin />
              Log in
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavUser;
