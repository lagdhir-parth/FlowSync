import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "MONGODB_URI",
  "DB_NAME",
  "ALLOWED_ORIGINS",
  "OPENROUTER_API_KEY",
  "SARVAM_API_KEY",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
  "GOOGLE_CLIENT_ID",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

if (isNaN(process.env.PORT)) {
  console.error("❌ PORT must be a number");
  process.exit(1);
}

const env = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim(),
  ),
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  SARVAM_API_KEY: process.env.SARVAM_API_KEY,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
};

export default env;
