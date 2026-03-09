export default async function handler(req, res) {
  const { url } = req.query;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  const text = await response.text();
  res.status(200).send(text);
}