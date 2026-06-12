import { supabase } from "./supabase";
import { Experience, Provider, Review } from "./types";

function mapProvider(p: Record<string, unknown>): Provider {
  return {
    id: p.id as string,
    name: p.name as string,
    bio: p.bio as string,
    imageUrl: p.image_url as string,
    category: p.category as Provider["category"],
    location: p.location as string,
    instagram: p.instagram as string | undefined,
    yearsActive: p.years_active as number | undefined,
    totalParticipants: p.total_participants as number | undefined,
    tags: p.tags as string[] | undefined,
  };
}

function mapExperience(e: Record<string, unknown>): Experience {
  const provider = mapProvider(e.providers as Record<string, unknown>);
  return {
    id: e.id as string,
    providerId: e.provider_id as string,
    provider,
    title: e.title as string,
    description: e.description as string,
    date: e.date as string,
    timeStart: e.time_start as string,
    timeEnd: e.time_end as string,
    location: e.location as string,
    priceMember: e.price_member as number,
    priceRegular: e.price_regular as number,
    capacity: e.capacity as number,
    currentBookings: e.current_bookings as number,
    imageUrl: e.image_url as string,
    category: e.category as Experience["category"],
    tags: e.tags as string[],
  };
}

function mapReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string,
    experienceId: r.experience_id as string,
    reviewerName: r.reviewer_name as string,
    reviewerAvatar: r.reviewer_avatar as string,
    childAge: r.child_age as string,
    rating: r.rating as number,
    comment: r.comment as string,
    date: r.date as string,
  };
}

export async function getExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*, providers(*)")
    .order("date", { ascending: true });

  if (error || !data) return [];
  return data.map(mapExperience);
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*, providers(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapExperience(data);
}

export async function getReviewsByExperienceId(experienceId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("experience_id", experienceId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapReview);
}

export async function createBooking(booking: {
  experienceId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childrenCount: number;
  adultsCount: number;
  message?: string;
}): Promise<boolean> {
  const { error } = await supabase.from("bookings").insert({
    experience_id: booking.experienceId,
    parent_name: booking.parentName,
    parent_email: booking.parentEmail,
    parent_phone: booking.parentPhone,
    children_count: booking.childrenCount,
    adults_count: booking.adultsCount,
    message: booking.message,
  });
  return !error;
}
