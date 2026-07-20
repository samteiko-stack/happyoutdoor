"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DesignerLeaveDialogProps {
  open: boolean;
  saving: boolean;
  onStay: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export function DesignerLeaveDialog({
  open,
  saving,
  onStay,
  onDiscard,
  onSave,
}: DesignerLeaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onStay()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Unsaved changes</DialogTitle>
          <DialogDescription>Save before leaving?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onStay} disabled={saving}>
            Stay
          </Button>
          <Button type="button" variant="ghost" onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
