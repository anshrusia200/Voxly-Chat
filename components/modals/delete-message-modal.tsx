"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Check,
  Copy,
  DoorOpen,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  // const origin = useOrigin();
  const router = useRouter();
  const isModalOpen = isOpen && type === "deleteMessage";
  const { apiUrl, query } = data;
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });
      await axios.delete(url);
      onClose();
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
        <DialogHeader className="pt-8 px-4">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this message? This action is
            permanent.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-2">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button variant="destructive" className="mt-3" onClick={onDelete}>
              {isLoading ? (
                <>
                  Deleting
                  <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                </>
              ) : (
                <>
                  Delete
                  <Trash2 className="h-4 w-4 ml-2 " />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
