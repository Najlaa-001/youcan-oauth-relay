import axios from "axios";
import qs from "qs";

export default async function handler(req, res) {
  const { code, store_id, state } = req.query;

  if (!code) return res.status(400).send("Missing code");

  try {
    // 1️⃣ Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://api.youcan.shop/oauth/token",
      qs.stringify({
        grant_type: "authorization_code",
        client_id: process.env.YOUCAN_CLIENT_ID,
        client_secret: process.env.YOUCAN_CLIENT_SECRET,
        redirect_uri: process.env.YOUCAN_REDIRECT_URI,
        code
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    // 2️⃣ Combine tokens with code + store info
    const tokens = tokenResponse.data;
    const payload = {
      code,
      store_id: store_id || null,
      state: state || null,
      ...tokens,
    };

    // 3️⃣ Forward everything to your n8n webhook
    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(process.env.N8N_WEBHOOK_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4️⃣ Optional: redirect to success page
    res.send("✅ YouCan store connected successfully!");
  } catch (err) {
    console.error("Error during OAuth:", err.response?.data || err.message);
    res.status(500).send("OAuth token exchange failed");
  }
}
