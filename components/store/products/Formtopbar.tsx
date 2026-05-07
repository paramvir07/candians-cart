import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FormTopBarProps {
  isEditMode: boolean;
  loading: boolean;
  buttonText: string;
  productName?: string;
  isDeleting?: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

export function FormTopBar({
  isEditMode,
  loading,
  buttonText,
  productName,
  isDeleting,
  onBack,
  onSubmit,
  onDelete,
}: FormTopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">
              {isEditMode ? "Edit Product" : "New Product"}
            </h1>
            {isEditMode && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                Editing
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          

          <Button
            variant="outline"
            size="sm"
            className="text-sm hidden sm:flex"
            onClick={onBack}
          >
            Cancel
          </Button>
          {/* Delete — only in edit mode, desktop only (mobile has its own bar) */}
          {isEditMode && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  className="text-sm hidden sm:flex gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? "Deleting…" : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{productName}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The product will be permanently
                    removed along with all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Product
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            size="sm"
            disabled={loading}
            onClick={onSubmit}
            className="text-sm bg-primary hover:bg-primary/90 gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{buttonText}</span>
            <span className="sm:hidden">{loading ? "…" : "Save"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}