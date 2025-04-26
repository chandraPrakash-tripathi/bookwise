"use client";
import React, { useRef, useState } from "react";
import { IKImage, IKUpload, IKVideo, ImageKitProvider } from "imagekitio-next";
import config from "@/lib/config";
import { Button } from "./ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  onFileChange: (filePath: string) => void;
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  value?: string;
}

const authenticator = async () => {
  try {
    // Use window.location based check
    const endpoint =
      window.location.hostname === "localhost"
        ? config.env.apiEndpoint
        : config.env.prodApiEndpoint;

    console.log("Using endpoint:", endpoint);
    const response = await fetch(`${endpoint}/api/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Authentication Error: ${response.status} - ${errorText}`);
      throw new Error(`Error: ${errorText}`);
    }

    const data = await response.json();
    console.log("Auth data received:", data); // Log the auth data
    return data;
  } catch (error) {
    console.error("Authentication error:", error);
    toast.error("Failed to authenticate with ImageKit");
    throw error;
  }
};
//destructring env
const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const FileUpload = ({
  onFileChange,
  type,
  accept,
  placeholder,
  folder,
  variant,
  value,
}: Props) => {
  const ikUploadRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<{ filePath: string | null }>({
    filePath: value ?? null,
  });
  //status of the upload
  const [progress, setProgress] = useState(0);

  //variants and placeholder
  const styles = {
    dark: "bg-black",
    light: "bg-white-500",
    placeholder: variant === "dark" ? "text-white" : "text-black",
    text: variant === "dark" ? "text-white" : "text-black",
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",
  };

  const onError = (error: unknown) => {
    console.log(error);
    toast.success(`${type} upload failed`, {
      description: ` Try Again and reload the page`,
    });
  };
  const onSuccess = (res: { filePath: string }) => {
    setFile(res);
    onFileChange(res.filePath);
    toast.success(`${type} upload success`, {
      description: ` ${res.filePath}File uploaded successfully!`,
    });
  };

  //with image kit we can also provide validation to the files being uploaded
  const onValidate = (file: File) => {
    if (type === "image") {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size should be less than 20MB", {
          description: ` ${file.name} is too large`,
        });
        return false;
      }
    } else if (type === "video") {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size should be less than 100MB", {
          description: ` ${file.name} is too large`,
        });
        return false;
      }
    }
    return true;
  };

  return (
    <ImageKitProvider
      urlEndpoint={urlEndpoint}
      publicKey={publicKey}
      authenticator={authenticator}
    >
      <IKUpload
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        className="hidden"
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => {
          setProgress(0);
        }}
        folder={folder}
        accept={accept}
        onUploadProgress={({ loaded, total }) => {
          const percent = Math.floor((loaded / total) * 100);
          setProgress(percent);
        }}
      />

      <Button
        className={cn(
          "upload-btn flex min-h-14 w-full items-center justify-center gap-1.5 rounded-md",
          styles.button
        )}
        onClick={(e) => {
          e.preventDefault();
          if (ikUploadRef.current) {
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className={cn("text-base text-white", styles.placeholder)}>
          {placeholder}
        </p>

        {file && (
          <p
            className={cn(
              "upload-filename  mt-1 text-center text-xs",
              styles.text
            )}
          >
            {file.filePath}
          </p>
        )}
      </Button>

      {progress > 0 && progress !== 100 && (
        <div className="w-full rounded-full bg-green-400">
          <div
            className="progress rounded-full bg-green-800 p-0.5 text-center font-bebas-neue text-[8px] font-bold leading-none text-white"
            style={{ width: `${progress}%` }}
          >
            {progress} %
          </div>
        </div>
      )}

      {file &&
        (type === "image" ? (
          <IKImage
            alt={file.filePath || ""}
            path={file.filePath || ""}
            width={500}
            height={300}
          />
        ) : type === "video" ? (
          <IKVideo
            path={file.filePath || undefined}
            controls={true}
            className="h-96 w-full rounded-xl"
          />
        ) : null)}
    </ImageKitProvider>
  );
};

export default FileUpload;
