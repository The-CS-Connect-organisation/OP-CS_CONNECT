import Navbar from '@/components/ui/Navbar';

export default function PhotosPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Photos</h1>
        <p className="text-white/50 mb-8">Our school memories, captured forever.</p>
        <div className="flex items-center justify-center h-[60vh] border border-white/10 rounded-2xl bg-white/5">
          <p className="text-white/30 text-lg">Photo gallery coming soon...</p>
        </div>
      </div>
    </main>
  );
}
