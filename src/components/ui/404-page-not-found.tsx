import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <section className="bg-white min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.07]" />

      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-3 z-10">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Cornerstone" className="h-10 w-10 object-contain" />
        <span className="text-lg font-bold text-gray-800 tracking-tight">Cornerstone</span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div className="relative">
              <div className="text-[10rem] sm:text-[14rem] md:text-[18rem] font-black text-gray-100 select-none leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl sm:text-8xl md:text-9xl">🤦‍♂️</span>
              </div>
            </div>

            <div className="mt-[-20px] sm:mt-[-40px]">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
                u dum dum 🤡
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-2 max-w-md mx-auto leading-relaxed">
                The page you're looking for either doesn't exist, got yeeted into the void, or your navigation skills need some work.
              </p>
              <p className="text-sm text-gray-400 mb-8 italic">
                (this ain't some corporate ERP — we're students, we break things)
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="default"
                  onClick={() => window.location.href = import.meta.env.BASE_URL}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
                >
                  🏠 Take me home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 rounded-xl text-base font-semibold"
                >
                  🔙 Go back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
