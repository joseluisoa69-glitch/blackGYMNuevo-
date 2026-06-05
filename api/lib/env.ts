import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  port: parseInt(process.env.PORT || "3000", 10),
};
