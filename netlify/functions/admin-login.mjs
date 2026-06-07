export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const password = request.headers.get("x-admin-password") || "";
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({ ok: true });
};

export const config = {
  path: "/api/admin-login",
};
