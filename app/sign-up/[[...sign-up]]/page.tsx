import { SignUp } from "@clerk/nextjs";
import { authFallbackRedirectUrl } from "@/lib/auth/redirect";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; returnTo?: string }>;
}) {
  // See app/sign-in/[[...sign-in]]/page.tsx — same return-target capture.
  const { redirect_url, returnTo } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center py-10 sm:py-16">
      <SignUp fallbackRedirectUrl={authFallbackRedirectUrl(redirect_url ?? returnTo)} />
    </div>
  );
}
