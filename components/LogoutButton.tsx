"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <Button type="submit" variant="ghost" size="sm" title="Sign out">
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </Button>
    </form>
  );
}
