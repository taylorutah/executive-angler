"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";
import HeroImageEditor from "./HeroImageEditor";

type Props = {
  entityType: string;
  entityId: string;
  currentImageUrl: string;
  currentAlt?: string;
  currentCredit?: string;
  currentCreditUrl?: string;
  aspectRatio?: number;
};

/**
 * Client-only admin gate so public entity pages never call cookies()
 * and can stay in the ISR/CDN cache.
 */
export default function AdminHeroEditor(props: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (isAdmin(data.user?.email)) setShow(true);
    });
  }, []);

  if (!show) return null;
  return <HeroImageEditor {...props} />;
}
