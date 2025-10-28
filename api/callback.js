import axios from "axios";

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code");

  try {
    const tokenResponse = await axios.post("https://api.youcan.shop/oauth/token", {
      grant_type: "authorization_code",
      client_id: process.env.YOUCAN_CLIENT_ID,
      client_secret: process.env.YOUCAN_CLIENT_SECRET,
      redirect_uri: process.env.YOUCAN_REDIRECT_URI,
      code
    });

    const tokens = tokenResponse.data;

    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(process.env.N8N_WEBHOOK_URL, tokens);
    }

    res.send("✅ YouCan store connected successfully!");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("OAuth token exchange failed");
  }
}
