"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  searchCustomersForNotification,
  createPrivateNotification,
} from "@/actions/common/notification.action";
import { Bell, Send, Loader2, X, User, Search } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  message: z.string().min(1, "Message is required").max(500),
});

type FormValues = z.infer<typeof schema>;

interface CustomerResult {
  id: string;
  name: string;
  email: string;
}

export function CreatePrivateNotificationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", message: "" },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || selectedCustomer) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchCustomersForNotification(searchQuery.trim());
      if (res.success && res.data) {
        setSearchResults(res.data);
        setDropdownOpen(res.data.length > 0);
      }
      setIsSearching(false);
    }, 350);
  }, [searchQuery, selectedCustomer]);

  function selectCustomer(customer: CustomerResult) {
    setSelectedCustomer(customer);
    setSearchQuery(customer.name);
    setDropdownOpen(false);
    setSearchResults([]);
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setSearchQuery("");
    setSearchResults([]);
  }

  function onSubmit(values: FormValues) {
    if (!selectedCustomer) {
      toast.error("Please select a customer first.");
      return;
    }
    startTransition(async () => {
      const res = await createPrivateNotification(
        selectedCustomer.id,
        values.title,
        values.message,
      );
      if (res.success) {
        toast.success(res.message ?? "Notification sent.");
        form.reset();
        clearCustomer();
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to send.");
      }
    });
  }

  const messageValue = form.watch("message");
  const charCount = messageValue?.length ?? 0;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
          <Bell className="h-4 w-4 text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-foreground">Private Notification</p>
          <p className="text-xs text-muted-foreground">Send a message to one customer</p>
        </div>
      </div>

      <Separator />

      {/* Customer search */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">
          Recipient <span className="text-muted-foreground font-normal">(Required)</span>
        </label>

        <div ref={searchRef} className="relative">
          {/* Search input */}
          <div className={`flex items-center gap-2 h-9 rounded-md border px-3 text-sm transition-colors ${
            selectedCustomer
              ? "bg-violet-50 border-violet-200 dark:bg-violet-950/20 dark:border-violet-800"
              : "bg-background border-input"
          }`}>
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : selectedCustomer ? (
              <User className="h-3.5 w-3.5 shrink-0 text-violet-600" />
            ) : (
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}

            <input
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50 text-sm"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => {
                if (selectedCustomer) clearCustomer();
                setSearchQuery(e.target.value);
              }}
            />

            {(searchQuery || selectedCustomer) && (
              <button
                type="button"
                onClick={clearCustomer}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Selected customer chip */}
          {selectedCustomer && (
            <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 dark:bg-violet-950/20 dark:border-violet-800">
              <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0 text-xs font-black text-violet-600">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {selectedCustomer.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {selectedCustomer.email}
                </p>
              </div>
            </div>
          )}

          {/* Dropdown */}
          {dropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
              {searchResults.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => selectCustomer(customer)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0 text-xs font-black text-violet-600">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {customer.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {customer.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {dropdownOpen && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-popover shadow-lg px-4 py-3">
              <p className="text-xs text-muted-foreground text-center">
                No customers found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Message form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-medium">Title</FormLabel>
                  <span className="text-xs text-muted-foreground">Required</span>
                </div>
                <FormControl>
                  <Input
                    placeholder="e.g. Your order has been updated"
                    className="h-9 text-sm placeholder:text-muted-foreground/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-medium">Message</FormLabel>
                  <span className={`text-xs tabular-nums transition-colors ${
                    charCount > 400 ? "text-destructive" : charCount > 300 ? "text-amber-500" : "text-muted-foreground"
                  }`}>
                    {charCount} chars
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Write your message here…"
                    className="min-h-[100px] resize-none text-sm leading-relaxed placeholder:text-muted-foreground/50"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Only this customer will see this message.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { form.reset(); clearCustomer(); }}
              disabled={isPending}
            >
              Clear
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !selectedCustomer}
              className="flex h-8 items-center gap-1.5 px-4 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send to Customer
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}