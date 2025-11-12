"use client";

import { useEffect, useState } from "react";

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url?: string;
  relative_time_description?: string;
}

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/google-reviews");
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Failed to fetch Google reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="reviews">
      <h3 className="fw-bold mb-3">What Our Customers Say</h3>

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length > 0 ? (
        reviews.map((review, idx) => (
          <div key={idx} className="border rounded p-3 mb-3 shadow-sm">
            <div className="d-flex align-items-center mb-2">
              {review.profile_photo_url && (
                <img
                  src={review.profile_photo_url}
                  alt={review.author_name}
                  className="rounded-circle me-2"
                  width={40}
                  height={40}
                />
              )}
              <div>
                <strong>{review.author_name}</strong>
                <div>
                  {"⭐".repeat(review.rating)}{" "}
                  <small className="text-muted">{review.relative_time_description}</small>
                </div>
              </div>
            </div>
            <p className="mb-0 text-muted">{review.text}</p>
          </div>
        ))
      ) : (
        <p>No reviews found.</p>
      )}
    </div>
  );
}
