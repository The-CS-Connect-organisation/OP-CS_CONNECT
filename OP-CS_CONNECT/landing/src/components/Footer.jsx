export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="border-t border-white/[0.05] py-10 px-6 bg-[#0a0a0a]"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff6b9d] to-[#c44dff] flex items-center justify-center">
            <span className="text-white font-black text-xs">C</span>
          </div>
          <span className="text-sm font-bold text-white/60">
            Cornerstone <span className="text-[#ff6b9d]">SchoolSync</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-white/25 font-medium">
          <a
            href="/OP-CS_CONNECT/academics/"
            className="hover:text-white/50 transition-colors"
          >
            Academic Portal
          </a>
          <a
            href="/OP-CS_CONNECT/management/"
            className="hover:text-white/50 transition-colors"
          >
            Management Portal
          </a>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-white/20 font-medium">
          © {new Date().getFullYear()} Cornerstone SchoolSync
        </p>
      </div>
    </footer>
  );
}
