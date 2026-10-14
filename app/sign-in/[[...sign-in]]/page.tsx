import { SignIn } from "@clerk/nextjs";
import { authFallbackRedirectUrl } from "@/lib/auth/redirect";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; returnTo?: string }>;
}) {
  // Clerk sets `redirect_url` when a guard (e.g. requireActiveUser) already
  // captured a return target; `returnTo` is our own explicit fallback. Either
  // way only the path survives — the full URL is handed to /auth/redirect.
  const { redirect_url, returnTo } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center py-10 sm:py-16">
      <SignIn fallbackRedirectUrl={authFallbackRedirectUrl(redirect_url ?? returnTo)} />
    </div>
  );
}
