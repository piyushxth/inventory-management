export async function GET() {
  const token = process.env.INSTAGRAM_KEY;
  if (!token) {
    console.error(
      "Instagram access token is not set in environment variables.",
    );
    return new Response(
      JSON.stringify({ error: "Instagram access token not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink&access_token=${token}`,
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching Instagram data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Instagram data" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
