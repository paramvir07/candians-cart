"use client";

import {
  createReferalCodeAction,
  updateReferalCodeAction,
} from "@/actions/admin/referalCode.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Pencil, Plus, Wand2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ReferralCode } from "@/types/admin/referralCode";

type ReferralCodeDialogFormProps = {
  usage: "create" | "update";
  data: ReferralCode | null;
};
const initialState = {
  success: false,
  message: "",
};

function generateReferalCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function ReferralCodeDialogForm({
  usage,
  data,
}: ReferralCodeDialogFormProps) {
  const create = usage === "create";
  const update = usage === "update";
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  if (usage === "update" && !data?._id) {
    throw new Error("Missing referral code ID for update");
  }

  const action = update
    ? updateReferalCodeAction.bind(null, data!._id)
    : createReferalCodeAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
      setOpen(false);
      setCode("");
      router.refresh();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {usage === "create" ? (
          <Button className="hover:cursor-pointer">
            <Plus />
            <div>Add Code</div>
          </Button>
        ) : usage === "update" ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <div></div>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{create ? "Create" : "Edit"} Referal Code</DialogTitle>
            <DialogDescription className="text-center">
              {create
                ? "Create a new referral code. You can set max uses and an optional expiry date."
                : "Update this referral code’s settings. The code itself can’t be changed."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="pt-5">
            <Field>
              <Label htmlFor="code">Code *</Label>
              <div className="relative">
                <Input
                  id="code"
                  name={create ? "code" : "code_display"}
                  placeholder="e.g. WELCOME2024"
                  required
                  minLength={10}
                  maxLength={12}
                  disabled={update}
                  defaultValue={create ? code : data?.code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="pr-10"
                />

                {/* Hidden field that actually gets submitted */}
                {update && (
                  <input
                    type="hidden"
                    name="code"
                    value={create ? code : data?.code}
                  />
                )}
                {create && (
                  <button
                    type="button"
                    onClick={() => setCode(generateReferalCode())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
                  >
                    <Wand2 size={18} />
                  </button>
                )}
              </div>
            </Field>

            <Field>
              <Label htmlFor="maxUses">
                Max Uses (leave empty for unlimited)
              </Label>
              <Input
                id="maxUses"
                name="maxUses"
                defaultValue={create ? 100 : (data?.maxUses ?? undefined)}
                type="number"
                min={1}
              />
            </Field>

            <Field>
              <Label htmlFor="expiresAt">Expires At (optional)</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="date"
                defaultValue={
                  update && data?.expiresAt
                    ? new Date(data.expiresAt).toISOString().split("T")[0]
                    : undefined
                }
              />
            </Field>
          </FieldGroup>

          <div className="flex items-center gap-3 mt-4">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={create || data?.isActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Spinner />
              ) : create ? (
                "Create"
              ) : update ? (
                "Save"
              ) : (
                <div></div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
