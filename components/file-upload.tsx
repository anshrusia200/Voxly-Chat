"use client";
import "@uploadthing/react/styles.css";
import { FileIcon, X } from "lucide-react";
import { UploadDropzone, UploadButton } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";
import Image from "next/image";
import { cn } from "@/lib/utils";
// import { fileDelete } from "@/app/api/uploadthing/core";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
  className?: string;
}

const FileUpload = ({
  onChange,
  value,
  endpoint,
  className,
}: FileUploadProps) => {
  const fileType = value?.split(".").pop();
  console.log(value);
  const temp = value?.split("/")[4]?.split(".")[0];
  const lastHyphenIndex = temp?.lastIndexOf("-");
  var temp2 = "";
  if (lastHyphenIndex !== -1) {
    temp2 = temp?.substring(0, lastHyphenIndex);
  }
  const fileKey = `${temp2}_${endpoint}.${fileType}`;
  console.log(fileKey);

  if (value && fileType !== "pdf") {
    return (
      <div className={cn("relative h-20 w-20", className)}>
        <Image
          fill
          src={value}
          alt="Upload"
          className={cn("rounded-full", className)}
        />
        <button
          onClick={() => {
            // fileDelete(fileKey);
            onChange("");
          }}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value}
        </a>
        <button
          onClick={() => {
            // fileDelete(fileKey);
            onChange("");
          }}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-[-10px] right-[-10px] shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};

export default FileUpload;
