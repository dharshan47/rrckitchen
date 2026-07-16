"use client"

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

interface CloudinaryResult {
  secure_url: string
  public_id: string
}

interface CloudinaryUploadProps {
  onUpload: (result: CloudinaryResult) => void
  children: (props: { uploading: boolean; startUpload: () => void; cancelUpload: () => void }) => ReactNode
}

async function getCloudinarySignature(params: Record<string, string>) {
  const res = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign: params }),
  })
  if (!res.ok) throw new Error("Failed to get upload signature")
  const { signature } = await res.json()
  return signature as string
}

export function CloudinaryUpload({ onUpload, children }: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [clickTick, setClickTick] = useState(0)
  const [cancelTick, setCancelTick] = useState(0)
  const pendingFileRef = useRef<File | null>(null)
  const [uploadTick, setUploadTick] = useState(0)

  useEffect(() => {
    if (clickTick > 0) {
      inputRef.current?.click()
    }
  }, [clickTick])

  useEffect(() => {
    if (cancelTick > 0) {
      abortRef.current?.abort()
      abortRef.current = null
    }
  }, [cancelTick])

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!

  const signatureQuery = useQuery({
    queryKey: ["cloudinary-signature", uploadTick],
    queryFn: async () => {
      const timestamp = Math.round(Date.now() / 1000).toString()
      const paramsToSign = { timestamp, upload_preset: uploadPreset }
      const signature = await getCloudinarySignature(paramsToSign)
      return { signature, timestamp }
    },
    enabled: uploadTick > 0,
  })

  const mutation = useMutation({
    mutationFn: async ({
      file,
      signature,
      timestamp,
    }: {
      file: File
      signature: string
      timestamp: string
    }) => {
      const controller = new AbortController()
      abortRef.current = controller

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)
      formData.append("timestamp", timestamp)
      formData.append("api_key", apiKey)
      formData.append("signature", signature)

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData, signal: controller.signal }
        )

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error?.message ?? "Upload failed")
        }

        const result: CloudinaryResult = await res.json()
        onUpload(result)
        return result
      } finally {
        abortRef.current = null
      }
    },
    onError: (error) => {
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    },
    onSettled: () => {
      if (inputRef.current) inputRef.current.value = ""
    },
  })

  useEffect(() => {
    if (pendingFileRef.current && signatureQuery.data) {
      mutation.mutate({ file: pendingFileRef.current, ...signatureQuery.data })
      pendingFileRef.current = null
    }
  }, [uploadTick, signatureQuery.data, mutation])

  const startUpload = useCallback(() => {
    setClickTick((c) => c + 1)
  }, [])

  const cancelUpload = useCallback(() => {
    setCancelTick((c) => c + 1)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || mutation.isPending) return
    pendingFileRef.current = file
    setUploadTick((c) => c + 1)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {children({
        uploading: mutation.isPending,
        startUpload,
        cancelUpload,
      })}
    </>
  )
}
