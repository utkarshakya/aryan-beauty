export const GENERIC_FORM_ERROR =
  "Something went wrong. Please try again.";

export function logServerError(scope: string, error: unknown) {
  console.error(`[server:${scope}]`, error);
}

export function logClientError(scope: string, error: unknown) {
  console.error(`[client:${scope}]`, error);
}
