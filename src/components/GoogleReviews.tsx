"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

interface GoogleReviewsProps {
  apiUrl?: string;
}

export default function GoogleReviews({
  apiUrl = "/api/google-reviews",
}: GoogleReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(apiUrl);
        const json = await res.json();
        setReviews(json.reviews || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [apiUrl]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) return <p>Loading reviews...</p>;
  if (reviews.length === 0) return <p>No reviews available</p>;

  return (
    <>
    <section className="info bg-brand-light">
      <div className="container">
        <h2 className="text-center fw-bold mb-4">
          What Our Guests are Saying
        </h2>

        <Slider {...settings}>
          {reviews.map((review, index) => (
            <div key={index} className="p-2">
              <div className="card bg-dark text-light rounded-4 shadow-lg h-100">
                <div className="card-body d-flex flex-column">
                  {/* Rating stars */}
                  <div className="mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="text-warning fs-6 me-1">
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="card-text flex-grow-1 small text-white mb-3">
                    {review.text.length > 150
                      ? review.text.substring(0, 150) + "..."
                      : review.text}
                  </p>

                  {/* View more */}
                  {review.text.length > 150 && (
                    <button className="btn btn-sm btn-brand-orange small mb-3 w-auto"
                      onClick={() => setSelectedReview(review)}
                      data-bs-toggle="modal"
                      data-bs-target="#reviewModal"
                    >
                      View more
                    </button>
                  )}

                  {/* Author */}
                  <div className="d-flex align-items-center mt-auto">
                      <div className="rounded-circle overflow-hidden me-2" style={{ width: 48, height: 48 }}>
                        <Image
                          src={review.profile_photo_url}
                          alt={review.author_name}
                          width={48}
                          height={48}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div>
                        <p className="mb-0 fw-semibold text-white">
                          {review.author_name}
                        </p>
                        <small className="text-secondary">
                          {review.relative_time_description}
                        </small>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
      

      {/* Review Modal */}
      <div className="modal fade"
        id="reviewModal"
        tabIndex={-1}
        aria-labelledby="reviewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-light rounded-4">
            <div className="modal-header border-0">
              <h5 className="modal-title" id="reviewModalLabel">
                {`${selectedReview?.author_name}'s Review`}
              </h5>

              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedReview && (
                <>
                  <div className="mb-2">
                    {Array.from({ length: selectedReview.rating }).map(
                      (_, i) => (
                        <span key={i} className="text-warning fs-6 me-1">
                          ★
                        </span>
                      )
                    )}
                  </div>
                  <p className="small">{selectedReview.text}</p>
                  <div className="d-flex align-items-center mt-3">
                  
                    <div className="rounded-circle overflow-hidden" style={{ width: 48, height: 48 }}>
                        <Image
                         src={selectedReview.profile_photo_url || "/default-avatar.svg"}
                      alt={selectedReview.author_name}
                      className="rounded-circle me-2"
                      width={40}
                      height={40}
                      onError={(e) => {
                          e.currentTarget.src = "/default-avatar.svg";
                        }}
                        />
                      </div>
                    
                    <div>
                      <p className="mb-0 fw-semibold text-white">
                        {selectedReview.author_name}
                      </p>
                      <small className="text-secondary">
                        {selectedReview.relative_time_description}
                      </small>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
