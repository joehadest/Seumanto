function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isAdminSession(session) {
  if (!session?.user || !session?.access_token) return false;
  const claims = decodeJwtPayload(session.access_token);

  return (
    claims?.role === "admin" ||
    claims?.app_metadata?.role === "admin" ||
    session.user.app_metadata?.role === "admin"
  );
}
