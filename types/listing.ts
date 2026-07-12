export type Listing = {
  id: string;
  title: string;
  city: string;
  state: string;
  address: string;
  monthlyRent: number;
  roomType: string;
  furnished: boolean;
  availableFrom: string;
  availableUntil: string;
  description: string;
  amenities: string[];
  commute: string;
  ownerName: string;
  imageUrl?: string;
};