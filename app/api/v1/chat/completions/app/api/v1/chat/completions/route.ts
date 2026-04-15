import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Force GLM-5 model (swap to z-ai/glm-5.1 once available)
    body.model = "z-ai/glm-5";

    const nimRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await nimRes.json();
    return NextResponse.json(data, { status: nimRes.status, headers: CORS });

  } catch (err) {
    return NextResponse.json(
      { error: "Proxy error", detail: String(err) },
      { status: 500, headers: CORS }
    );
  }
}
