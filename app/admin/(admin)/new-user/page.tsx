"use client";

import Link from "next/link";
import { Monitor, ShieldCheck, Store, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const cards = [
  {
    id: "cashier",
    title: "New Cashier",
    description:
      "Add a cashier with POS access and transaction handling permissions.",
    href: "/admin/new-user/cashier",
    badge: "POS Access",
    Icon: Monitor,
  },
  {
    id: "admin",
    title: "New Admin",
    description:
      "Create an admin account with full system access and user management.",
    href: "/admin/new-user/admin",
    badge: "Full Access",
    Icon: ShieldCheck,
  },
  {
    id: "store",
    title: "New Store",
    description:
      "Register a store location with inventory tracking and staff assignment.",
    href: "/admin/new-user/store",
    badge: "Location",
    Icon: Store,
  },
];

export default function NewUserPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-4 py-16 bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Register New User
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose the type of account you want to create.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {cards.map(({ id, title, description, href, badge, Icon }) => (
          <Card
            key={id}
            className="flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-md bg-muted">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <Badge variant="secondary">{badge}</Badge>
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {description}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href={href}>
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
