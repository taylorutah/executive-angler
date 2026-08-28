"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FOCUS_VISIBLE, MOTION_SAFE } from "@/components/layout/nav/links";
import { useModalChrome } from "@/components/layout/nav/useModalChrome";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Aperture,
  Timer,
  Gauge,
  User,
  Calendar,
} from "@/icons";

interface PhotoLightboxProps {
  photos: Array<{
    photoUrl: string;
    caption?: string;
    submitterName: string;
    cameraBody?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    submittedAt: string;
  }>;
  initialIndex: number;
  onClose: () => void;
}

export default function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const photo = photos[currentIndex];
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useModalChrome({
    open: true,
    containerRef: dialogRef,
    onClose,
  });

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrev]);

  const hasExifData =
    photo.cameraBody || photo.lens || photo.aperture || photo.shutterSpeed || photo.iso;

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={photo.caption || `Photo by ${photo.submitterName}`}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} absolute top-4 right-4 z-50 p-2 rounded-[var(--radius-md)] bg-white/10 hover:bg-white/20 text-white transition-colors`}
          data-autofocus
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" aria-hidden />
        </button>

        {/* Photo Counter */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-4 z-50 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className={`ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-[var(--radius-md)] bg-white/10 hover:bg-white/20 text-white transition-colors`}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className={`ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-[var(--radius-md)] bg-white/10 hover:bg-white/20 text-white transition-colors`}
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </>
        )}

        {/* Main Content */}
        <motion.div
          key={currentIndex}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className="relative flex flex-col items-center max-w-5xl w-full mx-4 max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative w-full" style={{ height: "70vh" }}>
            <Image
              src={photo.photoUrl}
              alt={photo.caption || `Photo by ${photo.submitterName}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>

          {/* Info Panel */}
          <div className="w-full mt-4 px-2">
            {/* Caption */}
            {photo.caption && (
              <p className="text-white text-base leading-relaxed text-center mb-3">
                {photo.caption}
              </p>
            )}

            {/* Photographer & Date */}
            <div className="flex items-center justify-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {photo.submitterName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(photo.submittedAt)}
              </span>
            </div>

            {/* Camera Info */}
            {hasExifData && (
              <div className="flex items-center justify-center flex-wrap gap-3 mt-3 text-xs text-white/50">
                {photo.cameraBody && (
                  <span className="flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    {photo.cameraBody}
                  </span>
                )}
                {photo.lens && (
                  <span className="flex items-center gap-1">
                    {photo.lens}
                  </span>
                )}
                {photo.aperture && (
                  <span className="flex items-center gap-1">
                    <Aperture className="h-3 w-3" />
                    {photo.aperture}
                  </span>
                )}
                {photo.shutterSpeed && (
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {photo.shutterSpeed}
                  </span>
                )}
                {photo.iso && (
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    ISO {photo.iso}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
