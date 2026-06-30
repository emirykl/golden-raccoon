import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  walletAddress: z.string().min(1),
  summary: z.string().min(1),
  riskScore: z.number().min(0).max(100),
  decision: z.string().min(1),
  reasoning: z.array(z.string()),
  suggestedAction: z.object({
    type: z.string(),
    fromToken: z.string(),
    toToken: z.string(),
    percent: z.number().min(0).max(100),
  }),
  status: z.enum(["pending", "approved", "rejected", "executed"]).default("pending"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    id: crypto.randomUUID(),
    ...parsed.data,
    createdAt: new Date().toISOString(),
  });
}
