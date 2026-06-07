export default function StarRating({ rating }) {
  // ✅ Pas de valeur par défaut forcée — affiche 0 étoiles si pas de note
  const note = typeof rating === 'number' && !isNaN(rating)
    ? Math.floor(rating) 
    : 0;

  return (
    <div className="flex text-yellow-500 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= note ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}