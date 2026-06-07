import { getStore } from "@netlify/blobs";

const BLOB_KEY = "content";

export default async (request) => {
  const store = getStore("pwb-site-content");

  if (request.method === "GET") {
    const data = await store.get(BLOB_KEY, { type: "json" });
    return Response.json(data || null);
  }

  if (request.method === "POST") {
    const password = request.headers.get("x-admin-password") || "";
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    await store.setJSON(BLOB_KEY, body);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/content",
};
