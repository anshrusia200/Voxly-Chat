"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, DoorOpen, Loader2, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export const LeaveServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  // const origin = useOrigin();
  const router = useRouter();
  const isModalOpen = isOpen && type === "leaveServer";
  const { server } = data;
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onLeave = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/servers/${server?.id}/leave`);
      onClose();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setConfirmText("");
  }, [isModalOpen]);

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Leave Server
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Type <span className="text-red-500">{server?.name}</span> to confirm
            exiting the server
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 "
              disabled={isLoading}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <div className="flex">
            <Button
              variant="destructive"
              className="mt-5 w-[50%] mx-auto"
              onClick={onLeave}
              disabled={isLoading || confirmText !== server?.name}
            >
              {isLoading ? (
                <>
                  Leaving
                  <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                </>
              ) : (
                <>
                  Leave
                  <DoorOpen className="h-4 w-4 ml-2 " />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
