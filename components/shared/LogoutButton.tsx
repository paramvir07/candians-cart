"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { logoutAction } from "@/actions/auth/login-logout.actions";

const LogoutButton = () => {
  return (
    <Button variant="ghost" onClick={() => logoutAction()}>
      <LogOut />
    </Button>
  );
};

export default LogoutButton;
