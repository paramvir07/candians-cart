"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { logoutAction } from "@/actions/auth/login-logout.actions";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();
  
  const handleLogout = async () => {
    const response = await logoutAction();
    if (response.success) {
      router.push("/");
    }
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      <LogOut /> Logout
    </Button>
  );
};

export default LogoutButton;
