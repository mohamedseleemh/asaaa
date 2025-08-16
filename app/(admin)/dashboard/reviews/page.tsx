"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Check, X, Clock } from "lucide-react"

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  moderated_at?: string
  moderated_by?: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const url = filter === "all" ? "/api/admin/reviews" : `/api/admin/reviews?status=${filter}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const moderateReview = async (reviewId: string, status: "approved" | "rejected") => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewId,
          status,
          moderatorId: "admin", // In a real app, get from auth context
        }),
      })

      if (response.ok) {
        fetchReviews() // Refresh the list
      }
    } catch (error) {
      console.error("Error moderating review:", error)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage customer reviews and feedback</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-500">No reviews found</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{review.name}</CardTitle>
                    {getStatusBadge(review.status)}
                  </div>
                  <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                </div>
                <CardDescription>
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>

                {review.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => moderateReview(review.id, "approved")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => moderateReview(review.id, "rejected")}>
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {review.moderated_at && (
                  <div className="mt-2 text-sm text-gray-500">
                    Moderated on {new Date(review.moderated_at).toLocaleDateString()}
                    {review.moderated_by && ` by ${review.moderated_by}`}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
