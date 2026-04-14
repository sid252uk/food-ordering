"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants"

export function useUpload({ bucket, folder = "" }: { bucket: string; folder?: string }) {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File): Promise<string | null> => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Invalid file type. Use JPEG, PNG, or WebP.")
      return null
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Max 5MB.")
      return null
    }
    setIsUploading(true)
    setError(null)
    setProgress(0)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()
      const filename = `${folder ? folder + "/" : ""}${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filename, file)
      if (uploadError) throw uploadError
      setProgress(100)
      const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
      return data.publicUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      return null
    } finally {
      setIsUploading(false)
    }
  }, [bucket, folder])

  const reset = useCallback(() => { setProgress(0); setError(null); setIsUploading(false) }, [])
  return { upload, progress, isUploading, error, reset }
}
