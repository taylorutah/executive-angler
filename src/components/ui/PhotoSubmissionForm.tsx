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
  ImageIcon,
} from "@/icons";
import Image from "next/image";
import { compressImage } from "@/lib/image-compress";
import ImageEditor, { validateImageFile } from "@/components/ui/ImageEditor";
import { Button } from "@/components/ui/Button";

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
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
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
    try {
      validateImageFile(selectedFile, {
        maxSizeBytes: MAX_FILE_SIZE,
        acceptedTypes: ACCEPTED_TYPES,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid image");
      return;
    }
    setRawImageSrc(URL.createObjectURL(selectedFile));
  }, []);

  const handleEditorApply = useCallback(
    (blob: Blob) => {
      if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
      setRawImageSrc(null);
      const cropped = new File([blob], "photo.jpg", { type: "image/jpeg" });
      setFile(cropped);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(blob));
    },
    [rawImageSrc, preview],
  );

  const handleEditorCancel = useCallback(() => {
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
  }, [rawImageSrc]);

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
    <div className={hideHeader ? "" : "bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden"}>
      {/* Collapsible Header — hidden when parent provides its own */}
      {!hideHeader && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--paper-deep)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center">
              <Camera className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-[var(--text-1)]">
                Submit Your Photo
              </h3>
              <p className="text-sm text-[var(--text-2)] mt-0.5">
                Share your {entityName} fishing photos with the community
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[var(--text-3)]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[var(--text-3)]" />
          )}
        </button>
      )}

      {/* Collapsible Content */}
      {isOpen && (
        <div className="border-t border-[var(--border)] p-6">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-[var(--radius-md)] bg-[var(--paper-deep)] flex items-center justify-center mx-auto mb-4">
                <Camera className="h-7 w-7 text-[var(--text-3)]" />
              </div>
              <p className="text-[var(--text-2)] mb-4">
                Sign in to submit your photos
              </p>
              <Button
                href={`/login?redirect=${typeof window !== "undefined" ? window.location.pathname : ""}`}
                variant="solid"
                size="md"
               
              >
                Sign In
              </Button>
            </div>
          ) : (
            <>
              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-3 p-4 bg-[color-mix(in_srgb,var(--success)_8%,var(--surface))] border border-[var(--success)] rounded-[var(--radius-md)] mb-6">
                  <CheckCircle className="h-5 w-5 text-[var(--success)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-1)]">
                      Photo submitted successfully!
                    </p>
                    <p className="text-xs text-[var(--text-2)] mt-0.5">
                      Your photo will be reviewed and published shortly.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] border border-[var(--danger)] rounded-[var(--radius-md)] mb-6">
                  <AlertCircle className="h-5 w-5 text-[var(--danger)] shrink-0" />
                  <p className="text-sm text-[var(--text-1)]">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Drag & Drop Upload */}
                <div>
                  <label className="ea-label">
                    Photo <span className="text-[var(--danger)]">*</span>
                  </label>
                  {!preview ? (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload photo — click or drag and drop a JPEG or PNG file"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
                      className={`relative border-2 border-dashed rounded-[var(--radius-card)] p-10 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--paper-deep)]"
                      }`}
                    >
                      <Upload
                        className={`h-10 w-10 mx-auto mb-3 ${
                          isDragging ? "text-[var(--accent)]" : "text-[var(--text-3)]"
                        }`}
                      />
                      <p className="text-sm text-[var(--text-2)]">
                        <span className="font-medium text-[var(--accent)]">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      {showQualityGuidance && (
                        <p className="text-xs text-[var(--text-2)] mt-1">
                          For best results: minimum 2000px wide, JPEG or PNG, under 20MB. Landscape orientation preferred for river shots.
                        </p>
                      )}
                      <p className="text-xs text-[var(--text-3)] mt-1">
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
                    <div className="relative rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)]">
                      <div className="relative h-64 w-full bg-[var(--paper-deep)]">
                        <Image
                          src={preview}
                          alt="Photo preview"
                          fill
                          className="object-contain"
                          // blob: object-URL from the file picker — optimizer cannot fetch it
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        aria-label="Remove selected photo"
                        className="absolute top-3 right-3 p-1.5 rounded-[var(--radius-sm)] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <div className="p-3 bg-[var(--paper-deep)] border-t border-[var(--border)] flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-[var(--text-3)]" />
                        <span className="text-xs text-[var(--text-2)] truncate">
                          {file?.name}
                        </span>
                        <span className="num text-xs text-[var(--text-3)] ml-auto">
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
                    className="ea-label"
                  >
                    Caption{" "}
                    <span className="text-[var(--text-3)] font-normal">
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
                    className="ea-input resize-none"
                  />
                  <p className="num text-xs text-[var(--text-3)] mt-1 text-right">
                    {caption.length}/300
                  </p>
                </div>

                {/* Camera Details */}
                <div>
                  <p className="ea-label">
                    Camera Details{" "}
                    <span className="text-[var(--text-3)] font-normal">
                      (optional)
                    </span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="cameraBody"
                        className="ea-label"
                      >
                        Camera Body
                      </label>
                      <input
                        id="cameraBody"
                        type="text"
                        value={cameraBody}
                        onChange={(e) => setCameraBody(e.target.value)}
                        placeholder="e.g., Canon EOS R5"
                        className="ea-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lens"
                        className="ea-label"
                      >
                        Lens
                      </label>
                      <input
                        id="lens"
                        type="text"
                        value={lens}
                        onChange={(e) => setLens(e.target.value)}
                        placeholder="e.g., 24-70mm f/2.8"
                        className="ea-input"
                      />
                    </div>
                  </div>

                  {/* Exposure Settings Row */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="aperture"
                        className="ea-label"
                      >
                        Aperture
                      </label>
                      <input
                        id="aperture"
                        type="text"
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        placeholder="f/2.8"
                        className="ea-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="shutterSpeed"
                        className="ea-label"
                      >
                        Shutter Speed
                      </label>
                      <input
                        id="shutterSpeed"
                        type="text"
                        value={shutterSpeed}
                        onChange={(e) => setShutterSpeed(e.target.value)}
                        placeholder="1/500"
                        className="ea-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="iso"
                        className="ea-label"
                      >
                        ISO
                      </label>
                      <input
                        id="iso"
                        type="text"
                        value={iso}
                        onChange={(e) => setIso(e.target.value)}
                        placeholder="200"
                        className="ea-input"
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
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <label htmlFor="rights" className="text-sm text-[var(--text-2)]">
                    I confirm I own the rights to this photo and grant Executive
                    Angler permission to display it on the site.{" "}
                    <span className="text-[var(--danger)]">*</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !file || !rightsConfirmed}
                  loading={submitting}
                  variant="solid"
                  size="lg"
                  icon={!submitting ? Upload : undefined}
                  fullWidth
                 
                >
                  {submitting ? "Uploading..." : "Submit Photo"}
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      <ImageEditor
        open={!!rawImageSrc}
        imageSrc={rawImageSrc ?? ""}
        aspect="free"
        maxOutputPx={1600}
        title="Crop your photo"
        onCancel={handleEditorCancel}
        onApply={handleEditorApply}
      />
    </div>
  );
}
