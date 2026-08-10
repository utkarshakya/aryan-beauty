import jwt from "jsonwebtoken";
import config from "../config/env.js";
import client from "../config/redisClient.js";

// Generate A New JWT Token
export function getJwtToken(payload, expire) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: expire });
}

export async function isInvalidToken(token) {
  return await client.get(`token:${token}`);
}
