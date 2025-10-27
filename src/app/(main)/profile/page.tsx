"use client";

import React from "react";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const ProfilePage = () => {
  const { user } = useUser();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "G";
  return (
    <section className="w-full h-full p-4 lg:p-6">
      <div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
        <div className="p-4 lg:p-6 flex flex-col gap-2 items-center justify-start">
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

export default ProfilePage;
