"use client";

/**
 * Name-first "add inventory" trigger for the fly box / workspace.
 * Opens QuickAddToBoxSheet without a catalog fly so buyers can type a name.
 */
import { useState } from "react";
import { Plus } from "@/icons";
import QuickAddToBoxSheet from "./QuickAddToBoxSheet";
import AddToBoxToast, { type ToastInfo } from "./AddToBoxToast";
import { Button } from "@/components/ui/Button";

export default function AddInventoryButton({
  initialBoxId,
  label = "Add to box",
  className,
}: {
  initialBoxId?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        icon={Plus}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <QuickAddToBoxSheet
        open={open}
        fly={null}
        defaultQtySource="bought"
        initialBoxId={initialBoxId}
        onClose={() => setOpen(false)}
        onSaved={(result) => {
          setToast({
            flyName: result.variantLabel,
            variantLabel: result.variantLabel,
            boxNames: result.boxNames,
            firstBoxId: result.boxIds[0],
          });
        }}
      />
      <AddToBoxToast info={toast} onDone={() => setToast(null)} />
    </>
  );
}
