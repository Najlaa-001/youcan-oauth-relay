import axios from "axios";

export default async function handler(req, res) {
  const { code, store_id, state } = req.query;

  if (!code) return res.status(400).send("Missing code");

  try {
    // ✅ Encode form body using URLSearchParams (no external lib needed)
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.YOUCAN_CLIENT_ID,
      client_secret: process.env.YOUCAN_CLIENT_SECRET,
      redirect_uri: process.env.YOUCAN_REDIRECT_URI,
      code,
    });

    const tokenResponse = await axios.post(
      "https://api.youcan.shop/oauth/token",
      body.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokens = tokenResponse.data;
    const payload = {
      code,
      store_id: store_id || null,
      state: state || null,
      ...tokens,
    };

    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(process.env.N8N_WEBHOOK_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });
    }

    res.send("✅ YouCan store connected successfully!");
  } catch (err) {
    console.error("Error during OAuth:", err.response?.data || err.message);
    res.status(500).send("OAuth token exchange failed");
  }
}
