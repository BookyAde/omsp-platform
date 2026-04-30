import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-ocean-950 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* Large 404 */}
          <p className="font-display text-[8rem] lg:text-[10rem] font-bold leading-none
                         text-gradient-teal opacity-20 select-none">
            404
          </p>

          <h1 className="font-display text-3xl font-bold text-white -mt-6 mb-4">
            Page Not Found
          </h1>
          <p className="text-slate-400 leading-relaxed mb-8">
            The page you are looking for does not exist or may have been moved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="btn-primary px-6 py-3">
              Back to Homepage
            </Link>
            <Link href="/opportunities" className="btn-ghost px-6 py-3">
              View Opportunities
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
