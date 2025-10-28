import axios from "axios";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing ?code from YouCan");
  }

  try {
    // 1️⃣ Exchange the authorization code for tokens
    const tokenResponse = await axios.post("https://api.youcan.shop/oauth/token", {
      grant_type: "authorization_code",
      client_id: process.env.YOUCAN_CLIENT_ID,
      client_secret: process.env.YOUCAN_CLIENT_SECRET,
      redirect_uri: process.env.YOUCAN_REDIRECT_URI,
      code
    });

    const tokens = tokenResponse.data;

    // 2️⃣ Optionally store or forward tokens
    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(process.env.N8N_WEBHOOK_URL, tokens);
    }

    // 3️⃣ Friendly success page
    res.send(`
      <html>
        <body style="font-family:sans-serif;text-align:center;padding:50px">
          <h2>✅ YouCan store connected successfully!</h2>
          <p>You can close this window now.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("OAuth Error:", err.response?.data || err.message);
    res.status(500).send("OAuth token exchange failed");
  }
}
