"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { StarRating } from "./star-rating"
import { MessageCircle, User, Calendar } from "lucide-react"
import { useCMS } from "@/lib/store"
import { paletteGrad } from "@/lib/palette"

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  service: string
  createdAt: string
  verified: boolean
}

export function ReviewsSection() {
  const { locale, design } = useCMS()
  const isRTL = locale === "ar"
  const palette = paletteGrad(design.palette)
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
    service: "",
  })

  // Load reviews on component mount
  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const response = await fetch("/api/reviews")
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      })

      if (response.ok) {
        setNewReview({ name: "", rating: 5, comment: "", service: "" })
        setShowForm(false)
        loadReviews() // Reload reviews
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Sample reviews if none loaded
  const sampleReviews: Review[] = [
    {
      id: "1",
      name: isRTL ? "أحمد محمد" : "Ahmed Mohamed",
      rating: 5,
      comment: isRTL
        ? "خدمة ممتازة وسريعة، حصلت على حساب PayPal مفعل خلال يوم واحد"
        : "Excellent and fast service, got my PayPal account activated within one day",
      service: "PayPal Account",
      createdAt: "2024-01-15",
      verified: true,
    },
    {
      id: "2",
      name: isRTL ? "فاطمة علي" : "Fatima Ali",
      rating: 5,
      comment: isRTL
        ? "أفضل موقع للحصول على الحسابات المصرفية الإلكترونية، أنصح به بشدة"
        : "Best website for electronic bank accounts, highly recommend it",
      service: "Wise Account",
      createdAt: "2024-01-10",
      verified: true,
    },
    {
      id: "3",
      name: isRTL ? "محمود حسن" : "Mahmoud Hassan",
      rating: 4,
      comment: isRTL
        ? "دعم فني ممتاز وأسعار معقولة، تعاملت معهم أكثر من مرة"
        : "Excellent technical support and reasonable prices, dealt with them multiple times",
      service: "Skrill Account",
      createdAt: "2024-01-05",
      verified: true,
    },
  ]

  const displayReviews = reviews.length > 0 ? reviews : sampleReviews

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {enable ? (
          <ScrollReveal y={30 * k}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                  {isRTL ? "تقييمات العملاء" : "Customer Reviews"}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isRTL ? "اقرأ تجارب عملائنا الحقيقية" : "Read real experiences from our customers"}
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                {isRTL ? "تقييمات العملاء" : "Customer Reviews"}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL ? "اقرأ تجارب عملائنا الحقيقية" : "Read real experiences from our customers"}
            </p>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayReviews.map((review, index) => (
            <div key={review.id}>
              {enable ? (
                <ScrollReveal y={20 * k} delay={index * 0.1}>
                  <ReviewCard review={review} isRTL={isRTL} formatDate={formatDate} />
                </ScrollReveal>
              ) : (
                <ReviewCard review={review} isRTL={isRTL} formatDate={formatDate} />
              )}
            </div>
          ))}
        </div>

        {/* Add Review Button */}
        <div className="text-center mb-8">
          {enable ? (
            <ScrollReveal y={20 * k} delay={0.3}>
              <Button
                onClick={() => setShowForm(!showForm)}
                className={`bg-gradient-to-r ${palette.primary} hover:opacity-90 text-white`}
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {isRTL ? "أضف تقييمك" : "Add Your Review"}
              </Button>
            </ScrollReveal>
          ) : (
            <Button
              onClick={() => setShowForm(!showForm)}
              className={`bg-gradient-to-r ${palette.primary} hover:opacity-90 text-white`}
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {isRTL ? "أضف تقييمك" : "Add Your Review"}
            </Button>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto">
            {enable ? (
              <ScrollReveal y={20 * k}>
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">{isRTL ? "شاركنا تجربتك" : "Share Your Experience"}</h3>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{isRTL ? "الاسم" : "Name"}</label>
                        <Input
                          value={newReview.name}
                          onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                          placeholder={isRTL ? "اسمك الكريم" : "Your name"}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{isRTL ? "الخدمة" : "Service"}</label>
                        <Input
                          value={newReview.service}
                          onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                          placeholder={isRTL ? "الخدمة التي حصلت عليها" : "Service you received"}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{isRTL ? "التقييم" : "Rating"}</label>
                        <StarRating
                          rating={newReview.rating}
                          interactive
                          onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                          size="lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{isRTL ? "التعليق" : "Comment"}</label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder={isRTL ? "شاركنا تجربتك مع خدماتنا" : "Share your experience with our services"}
                          rows={4}
                          required
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={loading}
                          className={`bg-gradient-to-r ${palette.primary} hover:opacity-90 text-white flex-1`}
                        >
                          {loading
                            ? isRTL
                              ? "جاري الإرسال..."
                              : "Submitting..."
                            : isRTL
                              ? "إرسال التقييم"
                              : "Submit Review"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                          {isRTL ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ) : (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{isRTL ? "شاركنا تجربتك" : "Share Your Experience"}</h3>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{isRTL ? "الاسم" : "Name"}</label>
                      <Input
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        placeholder={isRTL ? "اسمك الكريم" : "Your name"}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">{isRTL ? "الخدمة" : "Service"}</label>
                      <Input
                        value={newReview.service}
                        onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                        placeholder={isRTL ? "الخدمة التي حصلت عليها" : "Service you received"}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">{isRTL ? "التقييم" : "Rating"}</label>
                      <StarRating
                        rating={newReview.rating}
                        interactive
                        onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                        size="lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">{isRTL ? "التعليق" : "Comment"}</label>
                      <Textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder={isRTL ? "شاركنا تجربتك مع خدماتنا" : "Share your experience with our services"}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className={`bg-gradient-to-r ${palette.primary} hover:opacity-90 text-white flex-1`}
                      >
                        {loading
                          ? isRTL
                            ? "جاري الإرسال..."
                            : "Submitting..."
                          : isRTL
                            ? "إرسال التقييم"
                            : "Submit Review"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        {isRTL ? "إلغاء" : "Cancel"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function ReviewCard({
  review,
  isRTL,
  formatDate,
}: {
  review: Review
  isRTL: boolean
  formatDate: (date: string) => string
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-semibold">{review.name}</div>
              <div className="text-sm text-muted-foreground">{review.service}</div>
            </div>
          </div>
          {review.verified && (
            <div className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded">
              {isRTL ? "موثق" : "Verified"}
            </div>
          )}
        </div>

        <div className="mb-4">
          <StarRating rating={review.rating} size="sm" />
        </div>

        <blockquote className="text-muted-foreground mb-4 leading-relaxed">"{review.comment}"</blockquote>

        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(review.createdAt)}
        </div>
      </CardContent>
    </Card>
  )
}
