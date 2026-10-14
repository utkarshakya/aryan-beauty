import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AdminTabBar from "@/components/admin/AdminTabBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <AdminTabBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
