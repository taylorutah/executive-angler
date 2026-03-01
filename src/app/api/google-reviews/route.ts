import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "Missing placeId parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    // Gracefully return empty when API key is not configured
    return NextResponse.json({
      rating: null,
      reviewCount: 0,
      reviews: [],
      message: "Google Places API key not configured",
    });
  }

  try {
    // Fetch place details from Google Places API
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json"
    );
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "rating,user_ratings_total,reviews,url");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Google API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json({
        rating: null,
        reviewCount: 0,
        reviews: [],
        message: `Google Places API error: ${data.status}`,
      });
    }

    const result = data.result;

    const reviews = (result.reviews || []).slice(0, 3).map(
      (review: {
        author_name: string;
        rating: number;
        text: string;
        relative_time_description: string;
        profile_photo_url?: string;
        time: number;
      }) => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
        relativeTimeDescription: review.relative_time_description,
        profilePhotoUrl: review.profile_photo_url,
        time: review.time,
      })
    );

    return NextResponse.json({
      rating: result.rating || null,
      reviewCount: result.user_ratings_total || 0,
      reviewsUrl: result.url || null,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching Google Reviews:", error);
    return NextResponse.json(
      {
        rating: null,
        reviewCount: 0,
        reviews: [],
        message: "Failed to fetch Google Reviews",
      },
      { status: 500 }
    );
  }
}
