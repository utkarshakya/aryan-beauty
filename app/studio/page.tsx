import { auth } from "@clerk/nextjs/server";

export default async function StudioPage() {
  const { userId } = await auth.protect();

  return (
    <div className="flex m-3 p-3 justify-center items-center">
      <h1>This is the user id: {userId}</h1>
    </div>
  );
}
