"use client";
import { useState, useEffect, useRef } from "react";
import { Member, MemberRole, Profile } from "@prisma/client";
import UserAvatar from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import {
  ShieldAlert,
  ShieldCheck,
  FileIcon,
  Edit,
  Trash,
  DownloadCloud,
  Download,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter, useParams } from "next/navigation";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  type: string;
}
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
  type,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();
  const router = useRouter();
  const params = useParams();

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });
      await axios.patch(url, values);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [content]);

  // Attach an event listener when the component mounts
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const icon = roleIconMap[member.role];

  const fileType = fileUrl?.split(".").pop();
  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage =
    !deleted &&
    (isAdmin || isModerator || isOwner) &&
    (type === "channel" || (type === "conversation" && isOwner));
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  const downloadFile = (fileUrl: string) => {
    fetch(fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);

        const strings = fileUrl.split("/");
        const fileName = strings[strings.length - 1];
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error("Error downloading the file:", error);
      });
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full ">
      <div
        className={cn(
          "flex gap-x-2 items-start w-full",
          isOwner && "flex-row-reverse"
        )}
      >
        <div
          className="cursor-pointer hover:drop-shadow-empty"
          onClick={onMemberClick}
        >
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div
          className={cn("flex flex-col max-w-[80%]", isOwner && "items-end")}
        >
          <div className="flex items-center gap-x-2">
            {!isOwner && (
              <div className="flex items-center" onClick={onMemberClick}>
                <p className="text-sm hover:underline cursor-pointer">
                  {member.profile.name}
                </p>
                <ActionTooltip label={member.role}>{icon}</ActionTooltip>
              </div>
            )}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          <div
            className={cn(
              "bg-zinc-200 shadow-md shadow-zinc-400/40 dark:shadow-none dark:bg-zinc-800 break-words p-2 min-w-[70px] rounded-[8px]",
              isOwner && "rounded-tr-none",
              !isOwner && "rounded-tl-none"
            )}
          >
            {isImage && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-sqaure rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48 "
              >
                <Image
                  src={fileUrl}
                  alt={content}
                  fill
                  className="object-cover"
                />
              </a>
            )}
            {isPDF && (
              <div className="relative flex items-center p-2 mt-2 rounded-md">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  PDF File
                </a>
              </div>
            )}
            {!fileUrl && !isEditing && (
              <p
                className={cn(
                  "text-sm text-zinc-600 dark:text-zinc-300",
                  deleted &&
                    "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
                )}
              >
                {content}
                {isUpdated && !deleted && (
                  <span className="tetx-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                    (edited)
                  </span>
                )}
              </p>
            )}
            {!fileUrl && isEditing && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex items-center w-full pt-2 gap-x-2"
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className={cn("flex-1")}>
                        <FormControl>
                          <div className="relative w-full">
                            <Input
                              disabled={isLoading}
                              className={cn(
                                "p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                              )}
                              placeholder="Edited message"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button size="sm" variant={"primary"} disabled={isLoading}>
                    Save
                  </Button>
                </form>
                <span className="text-[11px] mt-1 text-zinc-400">
                  Press escape to cancel and, enter to save
                </span>
              </Form>
            )}
          </div>
        </div>
        {canDeleteMessage && (
          <div
            className={cn(
              "hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 bg-white dark:bg-zinc-800 border rounded-sm ",
              isOwner && "left-10",
              !isOwner && "right-10"
            )}
          >
            {canEditMessage && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => {
                    setIsEditing(true);
                  }}
                  className="cursor-pointer ml-auto h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition "
                />
              </ActionTooltip>
            )}
            <ActionTooltip label="Delete">
              <Trash
                onClick={() => {
                  onOpen("deleteMessage", {
                    apiUrl: `${socketUrl}/${id}`,
                    query: socketQuery,
                  });
                }}
                className="cursor-pointer ml-auto h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition "
              />
            </ActionTooltip>
            {(isImage || isPDF) && (
              <ActionTooltip label="Download">
                <button onClick={() => downloadFile(fileUrl)}>
                  <Download className="cursor-pointer ml-auto h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition " />
                </button>
              </ActionTooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
