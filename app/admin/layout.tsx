import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
