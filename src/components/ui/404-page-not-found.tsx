import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <section className="bg-white min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400" />

      {/* Branding */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
          CS
        </div>
        <span className="text-lg font-bold text-gray-800 tracking-tight">CS Connect</span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 max-w-lg text-center">
            {/* 404 Number */}
            <div className="relative mb-8">
              <div className="text-[10rem] sm:text-[12rem] font-black text-gray-100 select-none leading-none tracking-tighter">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center shadow-inner">
                  <span className="text-4xl sm:text-5xl font-bold text-orange-400">?</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Page not found
              </h3>
              <p className="text-base sm:text-lg text-gray-500 max-w-sm mx-auto leading-relaxed">
                The page you're looking for doesn't exist or has been moved.
                Check the URL or head back to your dashboard.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button
                  variant="default"
                  onClick={() => window.location.href = import.meta.env.BASE_URL}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-6 rounded-xl text-base font-semibold shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 min-w-[180px]"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-6 py-6 rounded-xl text-base font-semibold min-w-[180px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-12 text-sm text-gray-400">
              CS Connect &mdash; School Management Platform
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
