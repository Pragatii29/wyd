import "server-only";
import { GoogleGenAI, type ContentListUnion } from "@google/genai";
import { z } from "zod";
import { TAGS } from "@/lib/tags";
import { fallbackProfile } from "@/lib/fallback";

const TIMEOUT_MS = 5000;
const TAG_LIST = TAGS.join(", ");

export type AiPath = "ai" | "fallback";

// Calls Gemini for JSON output. Returns null on any failure so callers can fall back.
async function generateJson<T>(opts: {
  schema: z.ZodType<T>;
  jsonSchema: object;
  systemInstruction: string;
  contents: ContentListUnion;
}): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!apiKey || !model) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model,
      contents: opts.contents,
      config: {
        systemInstruction: opts.systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema: opts.jsonSchema,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      },
    });
    const parsed = opts.schema.safeParse(JSON.parse(res.text ?? ""));
    if (!parsed.success) {
      console.warn("[ai] invalid JSON shape", parsed.error.issues);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn("[ai] call failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

// 1. Profile extraction

const tagSchema = z.enum(TAGS);

const profileSchema = z.object({
  interests: z.array(z.string()).transform((tags) =>
    tags.filter((t): t is z.infer<typeof tagSchema> => tagSchema.safeParse(t).success).slice(0, 10),
  ),
  area: z.string().nullable(),
  missing_fields: z.array(z.enum(["interests", "area"])),
});

const PROFILE_PROMPT = `You build a short social profile for WYD?, an app where young people in Indian cities find
company for everyday plans. From the user's paragraph, return JSON only:
{"interests": string[], "area": string | null, "missing_fields": string[]}
- interests: only tags from this list: ${TAG_LIST}. Map meaning, not exact words
  ("gigs" -> concerts, "coffee spots" -> coffee_cafes). Max 10.
- area: the Bengaluru area if mentioned, else null.
- missing_fields: any of ["interests", "area"] that you could not find.
Do not invent anything the user did not say.`;

export async function extractProfile(bio: string) {
  const result = await generateJson({
    schema: profileSchema,
    jsonSchema: {
      type: "object",
      properties: {
        interests: { type: "array", items: { type: "string", enum: [...TAGS] } },
        area: { type: ["string", "null"] },
        missing_fields: { type: "array", items: { type: "string", enum: ["interests", "area"] } },
      },
      required: ["interests", "area", "missing_fields"],
    },
    systemInstruction: PROFILE_PROMPT,
    contents: bio,
  });
  const path: AiPath = result ? "ai" : "fallback";
  console.log(`[ai] profile extract path=${path}`);
  return { ...(result ?? fallbackProfile(bio)), path };
}

// 2. Photo pre-check (a helper for the admin, never auto-approves)

const photoSchema = z.object({ one_real_face: z.boolean(), reason: z.string() });

const PHOTO_PROMPT = `You pre-check profile photos for WYD?, a social app for adults. Return JSON only:
{"one_real_face": boolean, "reason": string}
- one_real_face is true only if the photo shows exactly one real human face, clearly visible.
- false for cartoons, drawings, AI art, celebrities, group photos, blank or face-less images.
- reason: one short sentence for the admin.`;

export async function checkPhoto(image: { mimeType: string; data: string }) {
  const result = await generateJson({
    schema: photoSchema,
    jsonSchema: {
      type: "object",
      properties: { one_real_face: { type: "boolean" }, reason: { type: "string" } },
      required: ["one_real_face", "reason"],
    },
    systemInstruction: PHOTO_PROMPT,
    contents: [{ inlineData: image }, { text: "Check this profile photo." }],
  });
  const path: AiPath = result ? "ai" : "fallback";
  console.log(`[ai] photo check path=${path}`);
  return result ? { ...result, path } : { skipped: true, path };
}
