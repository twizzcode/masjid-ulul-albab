"use client";

import React from "react";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const profilepage = () => {
  const { user } = useUser();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "G";
  return (
    <section className="flex flex-1 w-full p-4">
      <div className="flex flex-1 border rounded-xl p-4">
        <div className="flex flex-col gap-2 w-full items-center justify-start">
          <Avatar className="h-30 w-30">
            <AvatarImage
              src={user?.image || undefined}
              alt={user?.name || "User"}
            />
            <AvatarFallback
              className={cn("text-[10px] transition-colors", "text-foreground")}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-t-primary">{user?.name || "User"}</h2>
          <Separator className="w-full my-2" />
        </div>
      </div>
    </section>
  );
};

export default profilepage;
