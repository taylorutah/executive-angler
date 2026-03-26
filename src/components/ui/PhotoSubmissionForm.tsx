"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Camera,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { compressImage } from "@/lib/image-compress";

interface PhotoSubmissionFormProps {
  entityType: string;
  entityId: string;
  entityName: string;
  defaultOpen?: boolean;
  showQualityGuidance?: boolean;
  hideHeader?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

export default function PhotoSubmissionForm({
  entityType,
  entityId,
  entityName,
  defaultOpen,
  showQualityGuidance,
  hideHeader,
}: PhotoSubmissionFormProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [caption, setCaption] = useState("");
  const [cameraBody, setCameraBody] = useState("");
  const [lens, setLens] = useState("");
  const [aperture, setAperture] = useState("");
  const [shutterSpeed, setShutterSpeed] = useState("");
  const [iso, setIso] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, []);

  const handleFile = useCallback((selectedFile: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError("Please upload a JPEG or PNG image.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be under 10MB.");
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    removeFile();
    setCaption("");
    setCameraBody("");
    setLens("");
    setAperture("");
    setShutterSpeed("");
    setIso("");
    setRightsConfirmed(false);
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a photo to upload.");
      return;
    }
    if (!rightsConfirmed) {
      setError("Please confirm you own the rights to this photo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be signed in to submit photos.");
        setSubmitting(false);
        return;
      }

      // Compress image before upload
      const compressed = await compressImage(file);

      // Generate a unique filename
      const fileName = `${entityType}/${entityId}/${user.id}-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("photo-submissions")
        .upload(fileName, compressed, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("photo-submissions").getPublicUrl(fileName);

      // Submit metadata to API
      const response = await fetch("/api/photos/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrl: publicUrl,
          entityType,
          entityId,
          entityName,
          caption: caption.trim() || undefined,
          cameraBody: cameraBody.trim() || undefined,
          lens: lens.trim() || undefined,
          aperture: aperture.trim() || undefined,
          shutterSpeed: shutterSpeed.trim() || undefined,
          iso: iso.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Submission failed.");
      }

      setSuccess(true);
      resetForm();

      // Hide success after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (isAuthenticated === null) return null;

  return (
    <div className={hideHeader ? "" : "bg-[#161B22] rounded-xl border border-[#21262D] shadow-sm overflow-hidden"}>
      {/* Collapsible Header — hidden when parent provides its own */}
      {!hideHeader && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-[#1F2937] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8923A]/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-[#E8923A]" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-[#E8923A]">
                Submit Your Photo
              </h3>
              <p className="text-sm text-[#A8B2BD] mt-0.5">
                Share your {entityName} fishing photos with the community
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[#6E7681]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#6E7681]" />
          )}
        </button>
      )}

      {/* Collapsible Content */}
      {isOpen && (
        <div className="border-t border-[#21262D] p-6">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#1F2937] flex items-center justify-center mx-auto mb-4">
                <Camera className="h-7 w-7 text-[#6E7681]" />
              </div>
              <p className="text-[#A8B2BD] mb-4">
                Sign in to submit your photos
              </p>
              <Link
                href={`/login?redirect=${typeof window !== "undefined" ? window.location.pathname : ""}`}
                className="inline-flex items-center px-5 py-2.5 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0F6FC] hover:text-[#E8923A] transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Photo submitted successfully!
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Your photo will be reviewed and published shortly.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Drag & Drop Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#F0F6FC] mb-2">
                    Photo <span className="text-red-500">*</span>
                  </label>
                  {!preview ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-[#E8923A] bg-[#E8923A]/5"
                          : "border-[#21262D] hover:border-[#E8923A]/50 hover:bg-[#1F2937]"
                      }`}
                    >
                      <Upload
                        className={`h-10 w-10 mx-auto mb-3 ${
                          isDragging ? "text-[#E8923A]" : "text-[#6E7681]"
                        }`}
                      />
                      <p className="text-sm text-[#A8B2BD]">
                        <span className="font-medium text-[#E8923A]">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      {showQualityGuidance && (
                        <p className="text-xs text-[#A8B2BD] mt-1">
                          For best results: minimum 2000px wide, JPEG or PNG, under 20MB. Landscape orientation preferred for river shots.
                        </p>
                      )}
                      <p className="text-xs text-[#6E7681] mt-1">
                        JPEG or PNG, max 10MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-[#21262D]">
                      <div className="relative h-64 w-full bg-[#0D1117]">
                        <Image
                          src={preview}
                          alt="Photo preview"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-3 right-3 p-1.5 bg-[#161B22]/90 rounded-full shadow-sm hover:bg-[#161B22] transition-colors"
                      >
                        <X className="h-4 w-4 text-[#A8B2BD]" />
                      </button>
                      <div className="p-3 bg-[#1F2937] border-t border-[#21262D] flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-[#6E7681]" />
                        <span className="text-xs text-[#A8B2BD] truncate">
                          {file?.name}
                        </span>
                        <span className="text-xs text-[#6E7681] ml-auto">
                          {file
                            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                            : ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div>
                  <label
                    htmlFor="caption"
                    className="block text-sm font-medium text-[#F0F6FC] mb-2"
                  >
                    Caption{" "}
                    <span className="text-[#6E7681] font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={300}
                    rows={3}
                    placeholder="Describe your catch, the conditions, or the moment..."
                    className="w-full px-4 py-3 border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] bg-[#0D1117] placeholder:text-[#6E7681] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/20 focus:border-[#E8923A] resize-none"
                  />
                  <p className="text-xs text-[#6E7681] mt-1 text-right">
                    {caption.length}/300
                  </p>
                </div>

                {/* Camera Details */}
                <div>
                  <p className="text-sm font-medium text-[#F0F6FC] mb-3">
                    Camera Details{" "}
                    <span className="text-[#6E7681] font-normal">
                      (optional)
                    </span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="cameraBody"
                        className="block text-xs text-[#A8B2BD] mb-1"
                      >
                        Camera Body
                      </label>
                      <input
                        id="cameraBody"
                        type="text"
                        value={cameraBody}
                        onChange={(e) => setCameraBody(e.target.value)}
                        placeholder="e.g., Canon EOS R5"
                        className="w-full px-3 py-2 border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] bg-[#0D1117] placeholder:text-[#6E7681] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/20 focus:border-[#E8923A]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lens"
                        className="block text-xs text-[#A8B2BD] mb-1"
                      >
                        Lens
                      </label>
                      <input
                        id="lens"
                        type="text"
                        value={lens}
                        onChange={(e) => setLens(e.target.value)}
                        placeholder="e.g., 24-70mm f/2.8"
                        className="w-full px-3 py-2 border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] bg-[#0D1117] placeholder:text-[#6E7681] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/20 focus:border-[#E8923A]"
                      />
                    </div>
                  </div>

                  {/* Exposure Settings Row */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="aperture"
                        className="block text-xs text-[#A8B2BD] mb-1"
                      >
                        Aperture
                      </label>
                      <input
                        id="aperture"
                        type="text"
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        placeholder="f/2.8"
                        className="w-full px-3 py-2 border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] bg-[#0D1117] placeholder:text-[#6E7681] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/20 focus:border-[#E8923A]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="shutterSpeed"
                        className="block text-xs text-[#A8B2BD] mb-1"
                      >
                        Shutter Speed
                      </label>
                      <input
                        id="shutterSpeed"
                        type="text"
                        value={shutterSpeed}
                        onChange={(e) => setShutterSpeed(e.target.value)}
                        placeholder="1/500"
                        className="w-full px-3 py-2 border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] bg-[#0D1117] placeholder:text-[#6E7681] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/20 focus:border-[#E8923A]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="iso"
                        className="block text-xs text-[#A8B2BD] mb-1"
                      >
                        ISO
                      </label>
                      <input
                        id="iso"
                        type="text"
                        value={iso}
                        onChange={(e) => setIso(e.target.value)}
                        placeholder="200"
                        className="w-full px-3 py-2 border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] bg-[#0D1117] placeholder:text-[#6E7681] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/20 focus:border-[#E8923A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Rights Confirmation */}
                <div className="flex items-start gap-3">
                  <input
                    id="rights"
                    type="checkbox"
                    checked={rightsConfirmed}
                    onChange={(e) => setRightsConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#21262D] text-[#E8923A] focus:ring-[#E8923A]"
                  />
                  <label htmlFor="rights" className="text-sm text-[#A8B2BD]">
                    I confirm I own the rights to this photo and grant Executive
                    Angler permission to display it on the site.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !file || !rightsConfirmed}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#E8923A] text-white font-medium rounded-lg hover:bg-[#F0F6FC] hover:text-[#E8923A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit Photo
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
