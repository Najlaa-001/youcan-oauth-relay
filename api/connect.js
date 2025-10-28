export default async function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.YOUCAN_CLIENT_ID,
    redirect_uri: process.env.YOUCAN_REDIRECT_URI,
    response_type: 'code',
    scope: 'read-orders read-customers',
    state: 'secure_random_state' // optional but recommended
  });

  const url = `https://seller-area.youcan.shop/admin/oauth/authorize?${params.toString()}`;
  return res.redirect(url);
}
