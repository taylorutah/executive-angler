#!/usr/bin/env python3
"""Generate the Executive Angler Project Bible PDF using ReportLab."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
import os

# Brand colors
ABYSS = HexColor("#0D1117")
DEPTH = HexColor("#161B22")
STONE = HexColor("#1F2937")
COPPER = HexColor("#E8923A")
TEAL = HexColor("#0BA5C7")
CHALK = HexColor("#F0F6FC")
SLATE = HexColor("#8B949E")
RISE = HexColor("#2EA44F")
CUTTHROAT = HexColor("#DA3633")
WHITE = HexColor("#FFFFFF")
DARK_BG = HexColor("#0D1117")

OUTPUT_PATH = os.path.expanduser(
    "~/Dropbox/Business : Projects/Executive Angler/executive-angler-project-bible-v1.0.pdf"
)

# --- Styles ---
styles = {
    "cover_title": ParagraphStyle(
        "CoverTitle", fontName="Helvetica-Bold", fontSize=36,
        textColor=COPPER, alignment=TA_CENTER, spaceAfter=8,
    ),
    "cover_subtitle": ParagraphStyle(
        "CoverSubtitle", fontName="Helvetica", fontSize=14,
        textColor=SLATE, alignment=TA_CENTER, spaceAfter=40,
    ),
    "cover_version": ParagraphStyle(
        "CoverVersion", fontName="Courier", fontSize=10,
        textColor=SLATE, alignment=TA_CENTER, spaceAfter=6,
    ),
    "section_num": ParagraphStyle(
        "SectionNum", fontName="Courier", fontSize=10,
        textColor=COPPER, spaceBefore=24, spaceAfter=2,
    ),
    "h1": ParagraphStyle(
        "H1", fontName="Helvetica-Bold", fontSize=22,
        textColor=COPPER, spaceBefore=0, spaceAfter=12,
    ),
    "h2": ParagraphStyle(
        "H2", fontName="Helvetica-Bold", fontSize=14,
        textColor=TEAL, spaceBefore=16, spaceAfter=6,
    ),
    "h3": ParagraphStyle(
        "H3", fontName="Helvetica-Bold", fontSize=11,
        textColor=CHALK, spaceBefore=10, spaceAfter=4,
    ),
    "body": ParagraphStyle(
        "Body", fontName="Helvetica", fontSize=10,
        textColor=HexColor("#C9D1D9"), leading=14, spaceAfter=6,
        alignment=TA_JUSTIFY,
    ),
    "bullet": ParagraphStyle(
        "Bullet", fontName="Helvetica", fontSize=10,
        textColor=HexColor("#C9D1D9"), leading=14, spaceAfter=3,
        leftIndent=18, bulletIndent=6,
    ),
    "mono": ParagraphStyle(
        "Mono", fontName="Courier", fontSize=9,
        textColor=TEAL, leading=12, spaceAfter=4, leftIndent=18,
    ),
    "quote": ParagraphStyle(
        "Quote", fontName="Helvetica-Oblique", fontSize=10,
        textColor=COPPER, leading=14, spaceAfter=8,
        leftIndent=24, rightIndent=24, alignment=TA_CENTER,
    ),
    "footer": ParagraphStyle(
        "Footer", fontName="Courier", fontSize=7,
        textColor=SLATE, alignment=TA_CENTER,
    ),
}


def hr():
    return HRFlowable(width="100%", thickness=0.5, color=STONE, spaceAfter=12, spaceBefore=8)


def section(num, title):
    return [
        Paragraph(f"SECTION {num}", styles["section_num"]),
        Paragraph(title, styles["h1"]),
        hr(),
    ]


def h2(text):
    return Paragraph(text, styles["h2"])


def h3(text):
    return Paragraph(text, styles["h3"])


def body(text):
    return Paragraph(text, styles["body"])


def bullet(text):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", styles["bullet"])


def mono(text):
    return Paragraph(text, styles["mono"])


def quote(text):
    return Paragraph(f'"{text}"', styles["quote"])


def spacer(pts=12):
    return Spacer(1, pts)


def build_story():
    story = []

    # ---- COVER ----
    story.append(Spacer(1, 2.5 * inch))
    story.append(Paragraph("EXECUTIVE ANGLER", styles["cover_title"]))
    story.append(Paragraph("Project Bible v1.0", styles["cover_subtitle"]))
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph(
        "The definitive strategy, architecture, and design reference<br/>"
        "for the Executive Angler digital ecosystem.",
        ParagraphStyle("CoverDesc", fontName="Helvetica", fontSize=11,
                        textColor=SLATE, alignment=TA_CENTER, leading=16)
    ))
    story.append(Spacer(1, 1 * inch))
    story.append(Paragraph("Prepared by Aether Studio", styles["cover_version"]))
    story.append(Paragraph("March 2026", styles["cover_version"]))
    story.append(Paragraph("CONFIDENTIAL", ParagraphStyle(
        "Conf", fontName="Courier-Bold", fontSize=9, textColor=CUTTHROAT, alignment=TA_CENTER
    )))
    story.append(PageBreak())

    # ---- TABLE OF CONTENTS ----
    story.extend(section("00", "Table of Contents"))
    toc_items = [
        ("01", "Vision & Positioning"),
        ("02", "Target User Personas"),
        ("03", "Core User Journeys"),
        ("04", "Brand Personality & Visual Language"),
        ("05", "Technical Architecture"),
        ("06", "Data Sync & Unification Strategy"),
        ("07", "Performance, Accessibility & SEO"),
        ("08", "Monetization & Premium Strategy"),
        ("09", "Social Features & Gamification"),
        ("10", "Content & Photography Strategy"),
        ("11", "iOS App Store Launch Checklist"),
        ("12", "Roadmap & Sequencing"),
    ]
    for num, title in toc_items:
        story.append(body(f"<b>{num}</b>  {title}"))
    story.append(PageBreak())

    # ---- SECTION 1: VISION ----
    story.extend(section("01", "Vision & Positioning"))
    story.append(quote(
        "The easiest app to track fishing and catching data, wrapped in "
        "a world-class editorial experience."
    ))
    story.append(h2("Core Identity"))
    story.append(body(
        "Executive Angler sits at the intersection of two proven models: "
        "<b>Strava's activity-tracking engine</b> (effortless session logging, GPS routes, social feed, "
        "gamification) and <b>National Geographic's editorial soul</b> (cinematic photography, "
        "rich destination guides, authoritative content). The app is the product. "
        "The website amplifies it with SEO-driven editorial content that funnels organic traffic "
        "into app downloads."
    ))
    story.append(h2("Competitive Positioning"))
    story.append(body(
        "Fishbrain, Anglr, FishAngler, and TightLines are utility-first apps with dated UIs. "
        "Executive Angler differentiates on three axes:"
    ))
    story.append(bullet("<b>Ease of use:</b> Fastest path from pocket to logging a catch. One-tap session start, auto-detect river, auto-fetch weather."))
    story.append(bullet("<b>Premium design:</b> Dark-first, copper-accented brand that feels like a luxury product, not a tackle shop app."))
    story.append(bullet("<b>Editorial moat:</b> 200+ destination/river/species pages drive organic traffic. User session data enriches these pages in real time."))
    story.append(h2("Ecosystem Architecture"))
    story.append(bullet("<b>iOS App</b> (primary product): Session tracking, catch logging, GPS, Live Activity, social feed, gear management, fly box."))
    story.append(bullet("<b>watchOS App</b>: Standalone catch logging on wrist, LTE-capable."))
    story.append(bullet("<b>Website</b> (executiveangler.com): Editorial content, user journal (web mirror), real-time river intel, SEO engine."))
    story.append(bullet("<b>Supabase Backend</b>: Single source of truth for all user data, shared by iOS and web."))
    story.append(PageBreak())

    # ---- SECTION 2: PERSONAS ----
    story.extend(section("02", "Target User Personas"))
    story.append(h2("Primary: The Executive Angler"))
    story.append(bullet("Age 30-55, affluent, time-constrained professional"))
    story.append(bullet("Fly fishing 2-4x/month, mostly Western US tailwaters and freestones"))
    story.append(bullet("Values efficiency: wants to log data fast, not fiddle with complex UIs"))
    story.append(bullet("Tracks patterns over time: which flies, which rivers, which conditions produce"))
    story.append(bullet("Willing to pay for premium tools that save time and improve their fishing"))
    story.append(h2("Secondary: The Aspiring Angler"))
    story.append(bullet("Age 22-35, newer to fly fishing, learning-oriented"))
    story.append(bullet("Uses editorial content to discover destinations and techniques"))
    story.append(bullet("Social features matter: follows experienced anglers, learns from their sessions"))
    story.append(bullet("Converts from free editorial reader to app user"))
    story.append(h2("Tertiary: The Guide / Shop Owner"))
    story.append(bullet("Uses EA to track client sessions and demonstrate expertise"))
    story.append(bullet("Values river intel pages showing recent activity"))
    story.append(bullet("Potential future B2B tier for guide booking integration"))
    story.append(PageBreak())

    # ---- SECTION 3: USER JOURNEYS ----
    story.extend(section("03", "Core User Journeys"))
    story.append(h2("Journey 1: Session Tracking (Primary)"))
    story.append(body("Start Session > Auto-detect river + weather > Fish > Log catches (species, fly, size, photo) > End session > Post-session enrichment (notes, tags, gear, privacy) > Session appears in feed + river intel"))
    story.append(h2("Journey 2: Discovery > Conversion"))
    story.append(body("Google search > Land on river/destination page > Read editorial content > See real-time session data from EA users > Download app > Create account > Start first session"))
    story.append(h2("Journey 3: Social Engagement"))
    story.append(body("Open app > View following feed > See friend's session > Like/comment > View their catches and fly patterns > Add fly to own box > Head to same river"))
    story.append(h2("Journey 4: Pattern Analysis"))
    story.append(body("Open journal > Filter by river + season > See which flies produced across sessions > Identify patterns > Apply learnings on next trip"))
    story.append(PageBreak())

    # ---- SECTION 4: BRAND ----
    story.extend(section("04", "Brand Personality & Visual Language"))
    story.append(h2("Brand Pillars"))
    story.append(bullet("<b>Authoritative:</b> Expert-level content, precise data, professional tone"))
    story.append(bullet("<b>Premium:</b> Dark-first design, copper accents, luxury feel"))
    story.append(bullet("<b>Efficient:</b> Fastest path to action, no clutter, respect for user's time"))
    story.append(bullet("<b>Adventurous:</b> Cinematic photography, evocative storytelling, sense of place"))
    story.append(h2("Color System (Brand Spec v1.1)"))

    color_data = [
        ["Token", "Hex", "Usage"],
        ["Abyss", "#0D1117", "Primary background"],
        ["Depth", "#161B22", "Cards, panels, nav"],
        ["Stone", "#1F2937", "Elevated surfaces"],
        ["Dusk", "#2C1F14", "Warm surfaces, hover, selected"],
        ["Copper Dawn", "#E8923A", "Primary CTA, data accent"],
        ["River Teal", "#0BA5C7", "Text/labels (desaturated)"],
        ["Teal Pip", "#00B4D8", "Indicator dots, badges ONLY"],
        ["Chalk", "#F0F6FC", "Primary text"],
        ["Slate", "#8B949E", "Secondary text, labels"],
        ["Rise", "#2EA44F", "Success, confirmed"],
        ["Cutthroat", "#DA3633", "Delete, discard, error"],
        ["Tide", "#21262D", "Dividers, borders"],
    ]
    t = Table(color_data, colWidths=[1.2*inch, 1*inch, 3.5*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), STONE),
        ("TEXTCOLOR", (0, 0), (-1, 0), COPPER),
        ("TEXTCOLOR", (0, 1), (-1, -1), CHALK),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Courier"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, STONE),
        ("BACKGROUND", (0, 1), (-1, -1), DEPTH),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(spacer())

    story.append(h2("Typography"))
    story.append(bullet("<b>Aktiv Grotesk</b> (UI text) - falls back to SF Pro on iOS"))
    story.append(bullet("<b>DM Serif Display</b> (editorial/hero headlines)"))
    story.append(bullet("<b>IBM Plex Mono</b> (data, numbers, stats)"))
    story.append(h2("Component Rules"))
    story.append(bullet("Buttons: 8px border-radius (not pill)"))
    story.append(bullet("Spacing: 4px base grid"))
    story.append(bullet("Dark-first design, no light mode"))
    story.append(bullet("WCAG AA contrast minimums enforced"))
    story.append(PageBreak())

    # ---- SECTION 5: TECH ARCH ----
    story.extend(section("05", "Technical Architecture"))
    story.append(h2("iOS App"))
    story.append(bullet("SwiftUI (pure), iOS 17.0+ deployment target"))
    story.append(bullet("Swift concurrency: async/await, actors for thread safety"))
    story.append(bullet("ActivityKit for Live Activity (lock screen + Dynamic Island)"))
    story.append(bullet("MapKit for native maps, CoreLocation for GPS tracking"))
    story.append(bullet("StoreKit 2 for in-app purchases"))
    story.append(bullet("WatchConnectivity for watchOS companion"))
    story.append(bullet("Keychain for auth tokens, UserDefaults for session recovery"))
    story.append(h2("watchOS App"))
    story.append(bullet("watchOS 10.0+, standalone LTE-capable"))
    story.append(bullet("Independent Supabase auth, fly box sync from iPhone"))
    story.append(bullet("Pending catch queue for offline resilience"))
    story.append(h2("Web Platform"))
    story.append(bullet("Next.js 16 + React 19, App Router, TypeScript strict"))
    story.append(bullet("Tailwind CSS with brand design tokens"))
    story.append(bullet("ISR (Incremental Static Regeneration) for 200+ editorial pages"))
    story.append(bullet("Mapbox GL for interactive maps"))
    story.append(bullet("Supabase client for auth + data fetching"))
    story.append(h2("Backend"))
    story.append(bullet("Supabase (PostgreSQL + Auth + Storage + Realtime)"))
    story.append(bullet("Row Level Security (RLS) for data isolation"))
    story.append(bullet("Edge Functions for serverless compute"))
    story.append(bullet("Supabase Storage for photo uploads"))
    story.append(PageBreak())

    # ---- SECTION 6: DATA SYNC ----
    story.extend(section("06", "Data Sync & Unification Strategy"))
    story.append(h2("Current State"))
    story.append(body(
        "iOS and web share the same Supabase instance but have schema divergence: "
        "iOS uses <font name='Courier' color='#0BA5C7'>fish_catches</font> with "
        "<font name='Courier' color='#0BA5C7'>length</font> (numeric), while web uses "
        "<font name='Courier' color='#0BA5C7'>catches</font> with "
        "<font name='Courier' color='#0BA5C7'>length_inches</font> (string). "
        "This must be unified before launch."
    ))
    story.append(h2("Unification Plan"))
    story.append(bullet("1. Audit both schemas side-by-side, identify every divergent column"))
    story.append(bullet("2. Pick one canonical table name and schema (prefer iOS naming since app is primary)"))
    story.append(bullet("3. Create a Supabase migration to rename/alter columns"))
    story.append(bullet("4. Update web TypeScript types and queries to match"))
    story.append(bullet("5. Add database triggers for computed fields (total_fish, etc.)"))
    story.append(h2("Real-Time Strategy"))
    story.append(body(
        "River pages on the web should show near-real-time data from active sessions. "
        "Implementation: Supabase Realtime subscriptions on the "
        "<font name='Courier' color='#0BA5C7'>fishing_sessions</font> table, "
        "filtered by <font name='Courier' color='#0BA5C7'>river_id</font>. "
        "When a session ends or a catch is logged, the river page updates within seconds."
    ))
    story.append(PageBreak())

    # ---- SECTION 7: PERF/A11Y/SEO ----
    story.extend(section("07", "Performance, Accessibility & SEO"))
    story.append(h2("Performance Targets"))
    story.append(bullet("LCP < 800ms on mobile (Strava benchmark)"))
    story.append(bullet("Lighthouse 100 on all editorial pages"))
    story.append(bullet("Instant navigation via prefetching + partial prerendering"))
    story.append(bullet("Image optimization: WebP/AVIF, responsive srcset, lazy loading"))
    story.append(bullet("Skeleton states for all async data loads"))
    story.append(h2("Accessibility"))
    story.append(bullet("WCAG 2.2 AA+ compliance"))
    story.append(bullet("All interactive elements keyboard-navigable"))
    story.append(bullet("Screen reader labels on all icons and controls"))
    story.append(bullet("iOS: Dynamic Type support, VoiceOver labels"))
    story.append(h2("SEO Strategy"))
    story.append(bullet("Semantic HTML5 throughout"))
    story.append(bullet("JSON-LD structured data on all entity pages (River, Place, Article)"))
    story.append(bullet("Topical authority clusters: Destination > Rivers > Species"))
    story.append(bullet("Internal linking mesh between related entities"))
    story.append(bullet("Core Web Vitals as ranking signal"))
    story.append(PageBreak())

    # ---- SECTION 8: MONETIZATION ----
    story.extend(section("08", "Monetization & Premium Strategy"))
    story.append(h2("Pricing Model: Freemium"))
    story.append(body(
        "Free tier is generous enough to hook users. Premium unlocks the features "
        "that power users and pattern-obsessed anglers crave."
    ))
    story.append(h2("Free Tier"))
    story.append(bullet("Unlimited session tracking with GPS"))
    story.append(bullet("Basic catch logging (species, fly, size)"))
    story.append(bullet("3 fly patterns in fly box"))
    story.append(bullet("Public feed browsing"))
    story.append(bullet("Basic session history (last 30 days)"))
    story.append(h2("Premium Tier ($7.99/mo or $49.99/yr)"))
    story.append(body("Benchmarked against: Strava Summit ($7.99/mo), Fishbrain Pro ($9.99/mo), AllTrails+ ($3/mo)"))
    story.append(bullet("<b>Unlimited fly box</b> with search, categories, and pattern stats"))
    story.append(bullet("<b>Advanced analytics:</b> catch rate by fly/river/season, trend charts, personal bests"))
    story.append(bullet("<b>Full session history</b> with export (CSV, PDF trip reports)"))
    story.append(bullet("<b>Multi-photo catches</b> with photo gallery"))
    story.append(bullet("<b>Gear tracking</b> with leader builder and rig management"))
    story.append(bullet("<b>River intel:</b> real-time conditions, recent session data, hatch reports"))
    story.append(bullet("<b>Private sessions</b> (free tier = all public)"))
    story.append(bullet("<b>Priority support</b> + early access to new features"))
    story.append(h2("Future Revenue Streams"))
    story.append(bullet("Guide/shop directory listings (B2B)"))
    story.append(bullet("Sponsored editorial content (lodge partnerships)"))
    story.append(bullet("Marketplace for fly patterns and gear recommendations"))
    story.append(PageBreak())

    # ---- SECTION 9: SOCIAL + GAMIFICATION ----
    story.extend(section("09", "Social Features & Gamification"))
    story.append(h2("Strava-Style Social Feed"))
    story.append(body(
        "The social layer is the retention engine. Users who follow other anglers "
        "and receive engagement on their sessions return 3x more frequently (Strava data)."
    ))
    story.append(h3("Feed Architecture"))
    story.append(bullet("<b>Following feed:</b> Sessions from people you follow, chronological"))
    story.append(bullet("<b>Public feed:</b> Trending sessions across the platform"))
    story.append(bullet("<b>River feed:</b> All public sessions on a specific river"))
    story.append(h3("Engagement Primitives"))
    story.append(bullet("<b>Kudos</b> (like Strava): One-tap acknowledgment on any session"))
    story.append(bullet("<b>Comments:</b> Threaded discussion on sessions"))
    story.append(bullet("<b>Shares:</b> Deep-link sessions to Messages, iMessage, or social media"))
    story.append(h3("Messaging (Cross-Platform)"))
    story.append(bullet("Direct messaging between users, synced across iOS app and web"))
    story.append(bullet("Supabase Realtime for instant delivery"))
    story.append(bullet("Push notifications for new messages (APNs)"))
    story.append(h2("Gamification System"))
    story.append(h3("Streaks"))
    story.append(bullet("<b>Weekly streak:</b> Fish at least once per week to maintain streak"))
    story.append(bullet("<b>River streak:</b> Consecutive sessions on the same river"))
    story.append(bullet("Visual streak counter on profile card"))
    story.append(h3("Achievements / Badges"))
    story.append(bullet("<b>Species collector:</b> Bronze (5 species), Silver (15), Gold (30)"))
    story.append(bullet("<b>River explorer:</b> Based on unique rivers fished"))
    story.append(bullet("<b>Fly tier:</b> Based on unique fly patterns used"))
    story.append(bullet("<b>Session milestones:</b> 10, 50, 100, 500 sessions"))
    story.append(bullet("<b>Catch milestones:</b> 100, 500, 1000 fish"))
    story.append(bullet("<b>Seasonal:</b> First fish of the year, winter warrior, etc."))
    story.append(h3("Leaderboards"))
    story.append(bullet("Monthly leaderboards by river (most fish, biggest catch)"))
    story.append(bullet("Overall leaderboards (sessions, species diversity, rivers explored)"))
    story.append(bullet("Opt-in only, private sessions excluded"))
    story.append(h3("Challenges"))
    story.append(bullet("Monthly community challenges (e.g., 'Catch 10 species in March')"))
    story.append(bullet("River-specific challenges"))
    story.append(bullet("Personal goals with progress tracking"))
    story.append(PageBreak())

    # ---- SECTION 10: CONTENT ----
    story.extend(section("10", "Content & Photography Strategy"))
    story.append(h2("Content Pipeline"))
    story.append(bullet("LLM-assisted content generation for destination/river/species pages"))
    story.append(bullet("Human review and editorial polish on all published content"))
    story.append(bullet("User-generated session data enriches editorial pages automatically"))
    story.append(h2("Photography Strategy"))
    story.append(body("Current assets: Original photos by Taylor + open-license images. To scale:"))
    story.append(bullet("<b>Unsplash/Pexels curation:</b> Build a curated library of fly fishing photography under open licenses"))
    story.append(bullet("<b>Community submissions:</b> Feature user photos (with permission) on river/destination pages"))
    story.append(bullet("<b>AI upscaling:</b> Use Topaz or similar tools to enhance existing photos to hero resolution"))
    story.append(bullet("<b>Stock partnerships:</b> Negotiate bulk licensing with fly fishing photographers"))
    story.append(bullet("<b>Photo contests:</b> Monthly 'Photo of the Month' drives engagement and builds library"))
    story.append(bullet("<b>Commissioned shoots:</b> As revenue grows, commission original photography at key destinations"))
    story.append(PageBreak())

    # ---- SECTION 11: LAUNCH CHECKLIST ----
    story.extend(section("11", "iOS App Store Launch Checklist"))
    story.append(h2("P0 - Launch Blockers"))
    story.append(bullet("Schema unification (catches table)"))
    story.append(bullet("Onboarding flow (first-launch experience)"))
    story.append(bullet("App Store assets (screenshots, description, keywords)"))
    story.append(bullet("Privacy policy + terms of service"))
    story.append(bullet("Crash-free session lifecycle (kill/restore testing)"))
    story.append(bullet("App icon (final brand-spec version)"))
    story.append(h2("P1 - Launch Week Polish"))
    story.append(bullet("Empty states for all views (no sessions, no catches, no gear)"))
    story.append(bullet("Error states with retry actions"))
    story.append(bullet("Haptic feedback on key interactions"))
    story.append(bullet("Visual polish pass (spacing, typography, color consistency)"))
    story.append(bullet("Loading skeletons for async data"))
    story.append(h2("P2 - Post-Launch (Week 1-2)"))
    story.append(bullet("Premium paywall implementation"))
    story.append(bullet("Push notifications (APNs)"))
    story.append(bullet("Social polish (kudos, enhanced comments)"))
    story.append(bullet("Web real-time sync for river pages"))
    story.append(PageBreak())

    # ---- SECTION 12: ROADMAP ----
    story.extend(section("12", "Roadmap & Sequencing"))
    story.append(h2("Phase 1: iOS Launch (Current)"))
    story.append(body("Focus: Ship a polished, stable iOS app to the App Store."))
    story.append(bullet("Fix all P0 launch blockers"))
    story.append(bullet("Complete P1 polish items"))
    story.append(bullet("Submit to App Store review"))
    story.append(h2("Phase 2: Retention Engine (Post-Launch Weeks 1-4)"))
    story.append(bullet("Premium tier activation"))
    story.append(bullet("Social features (kudos, enhanced feed)"))
    story.append(bullet("Push notifications"))
    story.append(bullet("Web journal real-time sync"))
    story.append(h2("Phase 3: Growth (Months 2-3)"))
    story.append(bullet("Gamification (streaks, badges, leaderboards)"))
    story.append(bullet("Challenges system"))
    story.append(bullet("Editorial content expansion (50+ new pages)"))
    story.append(bullet("SEO optimization sprint"))
    story.append(h2("Phase 4: Platform (Months 4-6)"))
    story.append(bullet("Guide/shop profiles and booking"))
    story.append(bullet("Community features (clubs, groups)"))
    story.append(bullet("Android app (or cross-platform evaluation)"))
    story.append(bullet("API for third-party integrations"))
    story.append(spacer(24))
    story.append(hr())
    story.append(spacer(12))
    story.append(Paragraph(
        "Project Bible locked. All future responses will reference and stay faithful to this understanding.<br/>"
        "This document is the permanent shared context for the Executive Angler project.",
        ParagraphStyle("Lock", fontName="Helvetica-Bold", fontSize=10,
                        textColor=COPPER, alignment=TA_CENTER, leading=14)
    ))
    story.append(spacer(8))
    story.append(Paragraph("AETHER STUDIO  |  MARCH 2026  |  CONFIDENTIAL", styles["footer"]))

    return story


def on_page(canvas, doc):
    """Dark background + footer on every page."""
    canvas.saveState()
    canvas.setFillColor(ABYSS)
    canvas.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
    # Page number footer
    canvas.setFont("Courier", 7)
    canvas.setFillColor(SLATE)
    canvas.drawCentredString(letter[0] / 2, 0.4 * inch, f"Executive Angler Project Bible v1.0  |  Page {doc.page}")
    canvas.restoreState()


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.85 * inch,
        rightMargin=0.85 * inch,
        title="Executive Angler Project Bible v1.0",
        author="Aether Studio",
    )
    story = build_story()
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f"PDF generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
