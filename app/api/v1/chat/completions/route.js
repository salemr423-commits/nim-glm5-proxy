export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    body.model = "deepseek-ai/deepseek-v3.2";

    const apiKey = process.env.NVIDIA_NIM_API_KEY;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const nimRes = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const text = await nimRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: "NVIDIA returned invalid response", raw: text };
    }

    return new Response(JSON.stringify(data), {
      status: nimRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    const isTimeout = err.name === "AbortError";
    return new Response(
      JSON.stringify({
        error: isTimeout
          ? "NVIDIA took too long to respond, try again"
          : String(err),
      }),
      {
        status: isTimeout ? 504 : 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
