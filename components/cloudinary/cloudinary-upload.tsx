"use client"

import { useRef, useEffect, useState, useCallback, type ReactNode } from "react"
import { useMutation } from "@tanstack/react-query"
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
  return signature
}

async function uploadToCloudinary(file: File, signal?: AbortSignal): Promise<CloudinaryResult> {
  const timestamp = Math.round(Date.now() / 1000).toString()
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  const paramsToSign = { timestamp, upload_preset: uploadPreset }

  const signature = await getCloudinarySignature(paramsToSign)

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)
  formData.append("timestamp", timestamp)
  formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
  formData.append("signature", signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData, signal }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error?.message ?? "Upload failed")
  }

  return res.json()
}

export function CloudinaryUpload({ onUpload, children }: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setInputEl(inputRef.current)
  }, [])

  const startUpload = useCallback(() => {
    inputEl?.click()
  }, [inputEl])

  const cancelUpload = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const result = await uploadToCloudinary(file, controller.signal)
        onUpload(result)
        return result
      } finally {
        abortRef.current = null
      }
    },
    onError: (error) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    },
    onSettled: () => {
      if (inputRef.current) inputRef.current.value = ""
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    mutation.mutate(file)
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
      {children({ uploading: mutation.isPending, startUpload, cancelUpload })}
    </>
  )
}
