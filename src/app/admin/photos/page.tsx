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
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

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

const ADMIN_EMAILS = [
  "taylor@executiveangler.com",
  "taylor.warnick@gmail.com",
].filter(Boolean);

export default function AdminPhotosPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAndFetch() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await fetchPhotos();
    }

    checkAdminAndFetch();
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

  // Loading state
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#E8923A] animate-spin" />
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#E8923A] mb-2">
            Access Denied
          </h1>
          <p className="text-[#8B949E] mb-6">
            You do not have permission to access the admin dashboard. Please
            sign in with an admin account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-5 py-2.5 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#E8923A]-light transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
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
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: "approved",
      label: "Approved",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      key: "rejected",
      label: "Rejected",
      icon: <XCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-[#1F2937] transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5 text-[#8B949E]" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-[#E8923A]">
                Photo Submissions
              </h1>
              <p className="text-sm text-[#8B949E] mt-0.5">
                Review and manage community photo submissions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[#E8923A] text-white shadow-sm"
                  : "bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:bg-[#0D1117]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                    activeTab === tab.key
                      ? "bg-[#161B22]/20 text-white"
                      : tab.key === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[#1F2937] text-[#8B949E]"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#E8923A] animate-spin" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="h-12 w-12 text-[#484F58] mx-auto mb-4" />
            <p className="text-[#8B949E]">
              No {activeTab} photo submissions yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-[#161B22] rounded-xl shadow-sm border border-[#21262D] overflow-hidden"
              >
                {/* Photo Thumbnail */}
                <div className="relative h-56 bg-[#1F2937]">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || "Photo submission"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        photo.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : photo.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {photo.status.charAt(0).toUpperCase() +
                        photo.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  {/* Submitter */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-[#E8923A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#E8923A] truncate">
                        {photo.submitter_name}
                      </p>
                      <p className="text-xs text-[#8B949E] truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {photo.submitter_email}
                      </p>
                    </div>
                  </div>

                  {/* Entity Info */}
                  <div className="flex items-center gap-1.5 text-xs text-[#8B949E]">
                    <MapPin className="h-3 w-3" />
                    <span className="capitalize">{photo.entity_type}</span>
                    <span className="text-[#484F58]">|</span>
                    <span className="truncate font-mono text-[#484F58]">
                      {photo.entity_id.substring(0, 8)}...
                    </span>
                  </div>

                  {/* Caption */}
                  {photo.caption && (
                    <p className="text-sm text-[#8B949E] line-clamp-2 italic">
                      &ldquo;{photo.caption}&rdquo;
                    </p>
                  )}

                  {/* Camera Details */}
                  {(photo.camera_body || photo.lens) && (
                    <div className="flex items-center gap-1.5 text-xs text-[#484F58]">
                      <Camera className="h-3 w-3" />
                      {[photo.camera_body, photo.lens]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                  {(photo.aperture || photo.shutter_speed || photo.iso) && (
                    <div className="flex items-center gap-1.5 text-xs text-[#484F58]">
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
                  <div className="flex items-center gap-1.5 text-xs text-[#484F58]">
                    <Calendar className="h-3 w-3" />
                    Submitted {formatDate(photo.submitted_at)}
                  </div>

                  {/* View full image link */}
                  <a
                    href={photo.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#E8923A] hover:text-[#E8923A]-light transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View full image
                  </a>

                  {/* Action Buttons */}
                  {photo.status === "pending" && (
                    <div className="flex gap-3 pt-2 border-t border-[#21262D]">
                      <button
                        onClick={() => handleAction(photo.id, "approve")}
                        disabled={actionLoading === photo.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#E8923A]-light transition-colors disabled:opacity-50"
                      >
                        {actionLoading === photo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(photo.id, "reject")}
                        disabled={actionLoading === photo.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#161B22] text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === photo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Reverse action for already-reviewed photos */}
                  {photo.status === "approved" && (
                    <div className="pt-2 border-t border-[#21262D]">
                      <button
                        onClick={() => handleAction(photo.id, "reject")}
                        disabled={actionLoading === photo.id}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-red-500 text-sm font-medium rounded-lg border border-[#21262D] hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === photo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Revoke Approval
                      </button>
                    </div>
                  )}

                  {photo.status === "rejected" && (
                    <div className="pt-2 border-t border-[#21262D]">
                      <button
                        onClick={() => handleAction(photo.id, "approve")}
                        disabled={actionLoading === photo.id}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-[#E8923A] text-sm font-medium rounded-lg border border-[#21262D] hover:bg-green-50 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === photo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approve Instead
                      </button>
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
