'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, BadgeCheck, MessageSquare } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { reviewApi, Review } from '@/lib/api/reviewApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useForm } from 'react-hook-form';

interface ProductReviewsProps {
  productId: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  body: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getByProduct(productId),
  });

  const { data: stats } = useQuery({
    queryKey: ['review-stats', productId],
    queryFn: () => reviewApi.getStats(productId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ReviewFormData>({ defaultValues: { rating: 5 } });

  const selectedRating = watch('rating');

  const createReview = useMutation({
    mutationFn: reviewApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', productId] });
      reset();
      setShowForm(false);
      alert('Review submitted for moderation. Thank you!');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? 'Failed to submit review');
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: reviewApi.markHelpful,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReview.mutate({ ...data, product: productId });
  };

  const maxCount = stats
    ? Math.max(...Object.values(stats.ratingDistribution), 1)
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 bg-white rounded-2xl p-8 luxury-border"
    >
      <h2 className="text-2xl font-serif font-bold text-black mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-rose-gold" />
        Customer Reviews
      </h2>

      {stats && (
        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-black mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5',
                    i < Math.round(stats.averageRating)
                      ? 'fill-rose-gold text-rose-gold'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <p className="text-gray-500">{stats.totalReviews} reviews</p>
          </div>

          <div className="space-y-2">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = stats.ratingDistribution[star] ?? 0;
              const pct = (count / maxCount) * 100;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-gold rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isAuthenticated ? (
        <div className="mb-8">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} variant="outline">
              Write a Review
            </Button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 rounded-xl p-6">
              <h3 className="font-medium text-black">Share your experience</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          'w-6 h-6',
                          star <= selectedRating ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('rating', { required: true, min: 1, max: 5 })} />
              </div>

              <Input
                label="Title"
                {...register('title', { required: 'Title is required', minLength: 3 })}
                error={errors.title?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea
                  {...register('body', { required: 'Review body is required', minLength: 10 })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/30 focus:outline-none"
                  placeholder="Tell us about your experience with this product..."
                />
                {errors.body && <p className="mt-1 text-sm font-medium text-red-600">{errors.body.message}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={createReview.isPending}>
                  Submit Review
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">
          <a href="/login" className="text-rose-gold hover:underline">Sign in</a> to write a review.
        </p>
      )}

      {reviewsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: Review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-black">
                      {review.user?.firstName} {review.user?.lastName?.[0]}.
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i < review.rating ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'
                        )}
                      />
                    ))}
                    <span className="text-sm text-gray-400 ml-2">
                      {review.createdAt ? formatDate(review.createdAt) : ''}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  <p className="text-gray-600">{review.body}</p>
                </div>
              </div>

              {isAuthenticated && user && (
                <button
                  onClick={() => helpfulMutation.mutate(review._id)}
                  className={cn(
                    'mt-3 inline-flex items-center gap-1 text-sm transition-colors',
                    review.helpfulVoters?.includes(user._id)
                      ? 'text-rose-gold'
                      : 'text-gray-500 hover:text-rose-gold'
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulVotes ?? 0})
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
