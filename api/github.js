export default async function handler(req, res) {
  const { url } = req.query;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  const data = await response.json();
  res.status(response.status).json(data);
}