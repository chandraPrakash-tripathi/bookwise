import React, { useRef, useState } from "react";
import { IKImage, IKUpload, ImageKitProvider } from "imagekitio-next";
import config from "@/lib/config";
import { Button } from "./ui/button";
import Image from "next/image";
import { toast } from "sonner";

//destructring env
const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);

  const onError = (error: any) => {
    console.log(error);
    toast.success("File not uploaded", {
      description: ` Try Again`,
    })
  };
  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);
    toast.success("File uploaded successfully!", {
      description: ` ${res.filePath}File uploaded successfully!`,
    });
  };

  const authenticator = async () => {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${errorText}`);
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
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
        fileName="test-upload.png"
      />

      <Button
        className="upload-btn flex min-h-14 w-full items-center justify-center gap-1.5 rounded-md"
        onClick={(e) => {
          e.preventDefault();
          if (ikUploadRef.current) {
             // @ts-ignore
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
        <p className="text-base text-white">Upload a File</p>
        
      </Button>
      {file && (
          <IKImage
            alt={file.filePath}
            path={file.filePath}
            width={500}
            height={300}
          />
        )}

    </ImageKitProvider>
  );
};

export default ImageUpload;
