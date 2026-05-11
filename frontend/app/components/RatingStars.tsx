"use client";

interface RatingStarsProps {
  rating: number;
  onRate: (rating: number) => void;
}

export default function RatingStars({ rating, onRate }: RatingStarsProps) {
  return (
    <div className="flex gap-1 justify-center my-2 items-center px-4">
      <span className="text-xl px-2">👎</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={`text-2xl px-2 transition-transform hover:scale-110 ${
            star <= rating ? "text-purple-300" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
      <span className="text-xl px-2">👍</span>
    </div>
  );
}