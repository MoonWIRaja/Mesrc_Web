"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Loader2 } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Autoplay from "embla-carousel-autoplay";
import { DEFAULT_REVIEWS_SETTINGS } from "@/lib/data/defaults";

interface Review {
    id: string | number;
    name: string;
    rating: number;
    text: string;
    date: string;
    isActive?: boolean;
}

interface ReviewsSettings {
    subtitle: string;
    title: string;
    description: string;
}

export function Reviews() {
    const [reviewsList, setReviewsList] = useState<Review[]>([]);
    const [settings, setSettings] = useState<ReviewsSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Fetch reviews and settings from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/data?section=reviews");
                const data = await res.json();
                console.log("Fetched reviews data:", data);
                if (data.data) {
                    // Check if data.data is the reviews array or an object with reviews/settings
                    let fetchedReviews = [];
                    if (Array.isArray(data.data)) {
                        fetchedReviews = data.data;
                        setSettings(DEFAULT_REVIEWS_SETTINGS);
                    } else {
                        fetchedReviews = data.data.reviews || [];
                        setSettings(data.data.settings || DEFAULT_REVIEWS_SETTINGS);
                    }
                    
                    // Filter only active reviews
                    const activeReviews = fetchedReviews.filter((r: Review) => r.isActive !== false);
                    setReviewsList(activeReviews);
                    console.log("Reviews loaded:", fetchedReviews.length, "| Active:", activeReviews.length);
                }
            } catch (error) {
                console.error("Failed to load reviews:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Autoplay plugin with loop
    const autoplay = useCallback(
        () => Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
        []
    );

    // New Review Form State
    const [newReview, setNewReview] = useState({
        name: "",
        rating: 5,
        text: "",
    });

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Add new review to the list
            const newReviewItem = {
                id: Date.now().toString(),
                name: newReview.name,
                rating: newReview.rating,
                text: newReview.text,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                isActive: true,
            };

            console.log("Submitting review:", newReviewItem);

            // Save to API
            const res = await fetch("/api/data?section=reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviews: [newReviewItem, ...reviewsList],
                    settings: settings
                }),
            });

            console.log("Response status:", res.status);

            const data = await res.json();
            console.log("Response data:", data);

            if (data.success) {
                // Update local state
                setReviewsList([newReviewItem, ...reviewsList]);
                setIsModalOpen(false);
                setNewReview({ name: "", rating: 5, text: "" });
                setMessage({ type: "success", text: "Review submitted successfully! Refresh page to see saved review." });
            } else {
                console.error("API error:", data.error);
                throw new Error(data.error || "Failed to save review");
            }
        } catch (error: any) {
            console.error("Failed to submit review:", error);
            setMessage({ type: "error", text: `Failed to submit review: ${error.message || 'Unknown error'}` });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage({ type: "", text: "" }), 5000);
        }
    };

    if (isLoading) {
        return (
            <section id="reviews" className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-4 md:px-6 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </section>
        );
    }

    if (!settings) {
        return null;
    }

    return (
        <section id="reviews" className="py-24 bg-slate-50 border-t border-slate-100">
            <div className="container mx-auto px-4 md:px-6">
                {/* Message Display */}
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-8 p-4 rounded-xl max-w-2xl mx-auto ${
                            message.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">{settings.subtitle}</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                            {settings.title}
                        </h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {settings.description}
                        </p>
                    </motion.div>
                </div>

                {reviewsList.length === 0 ? (
                    /* No reviews - Show "Be the first" message */
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100">
                            <Quote className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h4 className="text-2xl font-bold text-slate-900 mb-4">Be the First to Review</h4>
                            <p className="text-slate-600 mb-8">
                                Your feedback helps us improve and serves others in making informed decisions.
                            </p>
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors">
                                        <Star className="w-5 h-5" />
                                        Write a Review
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-white">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-slate-900">Share Your Experience</DialogTitle>
                                        <DialogDescription className="text-slate-500">
                                            Share your treatment experience with us. Your feedback helps us improve.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleReviewSubmit} className="space-y-6 mt-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                                            <Input
                                                id="name"
                                                required
                                                value={newReview.name}
                                                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                                placeholder="Ali Bin Abu"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                                    >
                                                        <Star
                                                            size={28}
                                                            fill={star <= newReview.rating ? "#eab308" : "none"}
                                                            color={star <= newReview.rating ? "#eab308" : "#cbd5e1"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="review" className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                                            <Textarea
                                                id="review"
                                                required
                                                value={newReview.text}
                                                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                                placeholder="Tell us about your treatment experience..."
                                                className="min-h-[120px] bg-white"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </motion.div>
                ) : (
                    /* Has reviews - Show carousel */
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-6xl mx-auto"
                    >
                        <Carousel
                            opts={{ align: "start", loop: true }}
                            plugins={[autoplay()]}
                            className="w-full relative"
                        >
                            <CarouselContent className="-ml-4">
                                {reviewsList.map((review) => (
                                    <CarouselItem key={review.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col relative overflow-hidden group hover:shadow-lg transition-shadow">
                                            <Quote className="absolute -top-4 -right-4 text-slate-50 opacity-50 rotate-180" size={100} />
                                            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-6 relative z-10">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-200" : ""} />
                                                ))}
                                            </div>
                                            <p className="text-slate-700 leading-relaxed mb-8 flex-grow relative z-10 text-center">
                                                &quot;{review.text}&quot;
                                            </p>
                                            <div className="flex flex-col items-center justify-center border-t border-slate-50 pt-6 relative z-10 text-center">
                                                <h4 className="font-bold text-slate-900">{review.name}</h4>
                                                <p className="text-xs text-slate-400 mt-1">{review.date}</p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="flex items-center justify-center gap-4 mt-12">
                                <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-200" />
                                <CarouselNext className="static translate-y-0 h-12 w-12 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-200" />
                            </div>
                        </Carousel>
                    </motion.div>
                )}

                {/* "Leave a Review" button - Show only when there are reviews */}
                {reviewsList.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-center mt-12"
                    >
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <button className="inline-block text-blue-600 font-semibold hover:underline bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-full transition-colors">
                                    Leave Your Review &rarr;
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-white">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-slate-900">Share Your Experience</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                        Share your treatment experience with us. Your feedback helps us improve.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleReviewSubmit} className="space-y-6 mt-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                                        <Input
                                            id="name"
                                            required
                                            value={newReview.name}
                                            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                            placeholder="Ali Bin Abu"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                                >
                                                    <Star
                                                        size={28}
                                                        fill={star <= newReview.rating ? "#eab308" : "none"}
                                                        color={star <= newReview.rating ? "#eab308" : "#cbd5e1"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="review" className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                                        <Textarea
                                            id="review"
                                            required
                                            value={newReview.text}
                                            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                            placeholder="Tell us about your treatment experience..."
                                            className="min-h-[120px] bg-white"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
