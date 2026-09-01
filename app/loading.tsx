import Container from "./components/ui/Container";

export default function Loading() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="flex justify-center" role="status" aria-label="Loading">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="h-7 w-7 animate-spin text-primary sm:h-8 sm:w-8"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-25"
          />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </Container>
  );
}
