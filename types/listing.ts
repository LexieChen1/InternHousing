export type Listing = {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  nearbyCampus: string | null;
  monthlyRent: number;
  roomType: string;
  furnished: boolean;
  availableFrom: string;
  availableUntil: string;

  // Temporary fallback fields until their
  // database tables/columns are added.
  address: string;
  commute: string;
  ownerName: string;
  amenities: string[];
  imageUrl?: string;
};