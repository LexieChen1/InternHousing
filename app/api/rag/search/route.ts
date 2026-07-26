import { ragSearchSchema } from "@/lib/rag/types";
import { searchHousing } from "@/lib/rag/search";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.error("RAG search failed:", error);

    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = ragSearchSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid search request.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    return Response.json(await searchHousing(parsed.data));
  } catch {
    return Response.json(
      {
        error:
          "Search is temporarily unavailable. Please try again.",
      },
      { status: 503 },
    );
  }
}
