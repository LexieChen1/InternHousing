import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAIKey = process.env.OPENAI_API_KEY;
const embeddingModel =
  process.env.OPENAI_EMBEDDING_MODEL ??
  "text-embedding-3-small";

if (!supabaseUrl || !serviceRoleKey || !openAIKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY before indexing.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
const openai = new OpenAI({ apiKey: openAIKey });

const { data: listings, error: listingError } =
  await supabase
    .from("listings")
    .select(
      "id,title,description,city,state,nearby_campus,monthly_rent,room_type,furnished,available_from,available_until",
    )
    .eq("status", "active");

if (listingError) {
  throw new Error(
    `Could not load listings: ${listingError.message}`,
  );
}

if (!listings?.length) {
  console.log("No active listings need indexing.");
  process.exit(0);
}

function buildDocument(listing) {
  return [
    `Title: ${listing.title}`,
    `Location: ${listing.city}, ${listing.state}`,
    listing.nearby_campus
      ? `Nearby campus: ${listing.nearby_campus}`
      : null,
    `Monthly rent: $${listing.monthly_rent}`,
    `Room type: ${listing.room_type}`,
    `Furnished: ${listing.furnished ? "yes" : "no"}`,
    `Available: ${listing.available_from} through ${listing.available_until}`,
    `Description: ${listing.description}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const documents = listings.map(buildDocument);
const embeddingResponse = await openai.embeddings.create({
  model: embeddingModel,
  input: documents,
  encoding_format: "float",
});

const embeddingsByIndex = embeddingResponse.data.sort(
  (first, second) => first.index - second.index,
);

const rows = listings.map((listing, index) => ({
  listing_id: listing.id,
  search_document: documents[index],
  embedding: embeddingsByIndex[index].embedding,
  embedding_model: embeddingModel,
  embedding_version: 1,
  updated_at: new Date().toISOString(),
}));

const { error: upsertError } = await supabase
  .from("listing_embeddings")
  .upsert(rows, { onConflict: "listing_id" });

if (upsertError) {
  throw new Error(
    `Could not save embeddings: ${upsertError.message}`,
  );
}

console.log(
  `Indexed ${rows.length} active listing${
    rows.length === 1 ? "" : "s"
  } with ${embeddingModel}.`,
);
