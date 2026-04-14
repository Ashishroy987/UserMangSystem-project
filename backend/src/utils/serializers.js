export function serializeUser(userDoc) {
  if (!userDoc) {
    return null;
  }

  const raw = typeof userDoc.toObject === "function" ? userDoc.toObject() : { ...userDoc };
  delete raw.password;
  delete raw.__v;
  return raw;
}
