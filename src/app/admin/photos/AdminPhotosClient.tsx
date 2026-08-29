"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  MapPin,
  Calendar,
  Aperture,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "@/icons";
import { Button } from "@/components/ui/Button";

type TabKey = "pending" | "approved" | "rejected";

interface PhotoRow {
  id: string;
  entity_type: string;
  entity_id: string;
  submitter_name: string;
  submitter_email: string;
  photo_url: string;
  caption: string | null;
  camera_body: string | null;
  lens: string | null;
  aperture: string | null;
  shutter_speed: string | null;
  iso: string | null;
  status: string;
  submitted_at: string;
  approved_at: string | null;
}

function statusPillCls(status: string): string {
  if (status === "pending") {
    return "bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)]";
  }
  if (status === "approved") {
    return "bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)]";
  }
  return "bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)]";
}

export default function AdminPhotosClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("photo_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch photos:", error);
    } else {
      setPhotos(data || []);
    }
    setLoading(false);
  }, []);

  async function handleAction(photoId: string, action: "approve" | "reject") {
    setActionLoading(photoId);

    try {
      const supabase = createClient();
      const newStatus = action === "approve" ? "approved" : "rejected";
      const updateData: Record<string, string> = { status: newStatus };
      if (action === "approve") {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("photo_submissions")
        .update(updateData)
        .eq("id", photoId);

      if (error) {
        console.error("Action error:", error);
        alert(`Failed to ${action} photo: ${error.message}`);
      } else {
        // Update local state
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId
              ? {
                  ...p,
                  status: newStatus,
                  approved_at:
                    action === "approve"
                      ? new Date().toISOString()
                      : p.approved_at,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  const filteredPhotos = photos.filter((p) => p.status === activeTab);

  const counts = {
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    rejected: photos.filter((p) => p.status === "rejected").length,
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: "pending",
      label: "Pending",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    {
      key: "approved",
      label: "Approved",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    {
      key: "rejected",
      label: "Rejected",
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <div className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-[var(--radius-md)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)] transition-colors duration-150 ease-standard"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">
                Photo Submissions
              </h1>
              <p className="text-sm text-[var(--text-2)] mt-0.5">
                Review and manage community photo submissions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={`inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 ease-standard ${
                activeTab === tab.key
                  ? "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="ml-1 num opacity-60">
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="ea-card ea-empty">
            <Camera className="h-10 w-10 text-[var(--text-3)]" />
            <p>No {activeTab} photo submissions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              >
                {/* Photo Thumbnail */}
                <div className="relative h-56 bg-[var(--paper-deep)]">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || "Photo submission"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  {/* Entity + status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-2)] min-w-0">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="capitalize">{photo.entity_type}</span>
                      <span className="text-[var(--text-3)]">|</span>
                      <span className="truncate num text-[var(--text-3)]">
                        {photo.entity_id.substring(0, 8)}...
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusPillCls(photo.status)}`}
                    >
                      {photo.status.charAt(0).toUpperCase() +
                        photo.status.slice(1)}
                    </span>
                  </div>

                  {/* Submitter */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-1)] truncate">
                        {photo.submitter_name}
                      </p>
                      <p className="text-xs text-[var(--text-2)] truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {photo.submitter_email}
                      </p>
                    </div>
                  </div>

                  {/* Caption */}
                  {photo.caption && (
                    <p className="text-sm text-[var(--text-2)] line-clamp-2 italic">
                      &ldquo;{photo.caption}&rdquo;
                    </p>
                  )}

                  {/* Camera Details */}
                  {(photo.camera_body || photo.lens) && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)]">
                      <Camera className="h-3 w-3" />
                      {[photo.camera_body, photo.lens]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                  {(photo.aperture || photo.shutter_speed || photo.iso) && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)]">
                      <Aperture className="h-3 w-3" />
                      {[
                        photo.aperture,
                        photo.shutter_speed,
                        photo.iso ? `ISO ${photo.iso}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)]">
                    <Calendar className="h-3 w-3" />
                    Submitted {formatDate(photo.submitted_at)}
                  </div>

                  {/* View full image link */}
                  <a
                    href={photo.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View full image
                  </a>

                  {/* Action Buttons */}
                  {photo.status === "pending" && (
                    <div className="flex gap-3 pt-2 border-t border-[var(--border)]">
                      <Button
                        onClick={() => handleAction(photo.id, "approve")}
                        disabled={actionLoading === photo.id}
                        variant="brand"
                        size="sm"
                        icon={CheckCircle}
                        loading={actionLoading === photo.id}
                        fullWidth
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleAction(photo.id, "reject")}
                        disabled={actionLoading === photo.id}
                        variant="destructive"
                        size="sm"
                        icon={XCircle}
                        loading={actionLoading === photo.id}
                        fullWidth

                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Reverse action for already-reviewed photos */}
                  {photo.status === "approved" && (
                    <div className="pt-2 border-t border-[var(--border)]">
                      <Button
                        onClick={() => handleAction(photo.id, "reject")}
                        disabled={actionLoading === photo.id}
                        variant="destructive"
                        size="sm"
                        icon={XCircle}
                        loading={actionLoading === photo.id}
                        fullWidth

                      >
                        Revoke Approval
                      </Button>
                    </div>
                  )}

                  {photo.status === "rejected" && (
                    <div className="pt-2 border-t border-[var(--border)]">
                      <Button
                        onClick={() => handleAction(photo.id, "approve")}
                        disabled={actionLoading === photo.id}
                        variant="outline"
                        size="sm"
                        icon={CheckCircle}
                        loading={actionLoading === photo.id}
                        fullWidth

                      >
                        Approve Instead
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
