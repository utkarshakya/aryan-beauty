import client from "../config/redisClient.js";

// Middleware to implement rate limiting using the Sliding Window Algorithm
export default async function rateLimiter(req, res, next) {
  // Define the time window size (1 hour in milliseconds)
  const windowSize = 60 * 60 * 1000;

  // Define the maximum number of requests allowed within the time window
  const maxRequestLimit = 100;

  try {
    // Generate a unique key for the client based on their IP address
    const key = `IP:${req.ip}`;

    // Get the current timestamp
    const currentTime = Date.now();

    // Calculate the earliest allowed timestamp for requests within the window
    const allowedSize = currentTime - windowSize;

    // Remove all requests from the sorted set that are outside the time window
    await client.zRemRangeByScore(key, 0, allowedSize);

    // Get the total number of requests made by the client within the time window
    const totalRequests = await client.zCard(key);

    // If the total requests exceed the maximum allowed limit, block the request
    if (totalRequests >= maxRequestLimit) {
      throw new Error("Sorry, Your Request Limit Reached");
    }

    // Add the current request to the sorted set with the current timestamp as the score
    await client.zAdd(key, [
      {
        score: currentTime,
        value: `${currentTime}:${Math.random()}`, // Use a unique value to avoid collisions
      },
    ]);

    // Set an expiration time for the key to automatically clean up old data
    await client.expire(key, windowSize / 1000); // Convert milliseconds to seconds

    // Allow the request to proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Send an error message if the request limit is exceeded or any other error occurs
    res.send(error.message);
  }
}
