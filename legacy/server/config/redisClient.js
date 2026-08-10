import { createClient } from "redis";
import config from "./env.js";

export default createClient({
  username: config.redis.username,
  password: config.redis.password,
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});
