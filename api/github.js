export default async function handler(req, res) {
  const { url } = req.query;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json"
    }
  });

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    res.status(response.status).json(data);
  } else {
    const text = await response.text();
    res.status(response.status).send(text);
  }
}