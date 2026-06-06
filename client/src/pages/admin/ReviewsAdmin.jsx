import { MessageCircle, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { productReviewsApi } from "../../api/productReviews.js";

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Number(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-neutral-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    if (!reviews.length) return { average: 0, total: 0 };
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return { average: total / reviews.length, total: reviews.length };
  }, [reviews]);

  async function loadReviews() {
    setLoading(true);
    setError("");
    try {
      setReviews(await productReviewsApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function removeReview(review) {
    try {
      await productReviewsApi.remove(review._id);
      setReviews((current) => current.filter((item) => item._id !== review._id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Avaliações</h1>
          <p className="mt-0.5 text-sm text-neutral-400">
            Comentários deixados pelos clientes na loja.
          </p>
        </div>

        <button type="button" onClick={loadReviews} className="btn-ghost">
          Atualizar
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm font-medium text-neutral-400">Total de avaliações</p>
          <p className="mt-2 text-3xl font-black text-neutral-900">{stats.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-neutral-400">Nota média</p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-3xl font-black text-neutral-900">
              {stats.average ? stats.average.toFixed(1) : "0.0"}
            </p>
            <RatingStars rating={Math.round(stats.average)} />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <MessageCircle className="mb-3 h-10 w-10 text-neutral-300" />
          <p className="font-semibold text-neutral-700">Nenhuma avaliação ainda</p>
          <p className="mt-1 max-w-md text-sm text-neutral-400">
            Quando um cliente avaliar um produto, a avaliação aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
              <div key={review._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-neutral-900">{review.customerName}</p>
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                        {review.product?.name ?? "Produto removido"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleString("pt-BR")
                        : "Sem data"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <RatingStars rating={review.rating} />
                    <button
                      type="button"
                      onClick={() => removeReview(review)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Excluir avaliação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-neutral-600">{review.comment}</p>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
