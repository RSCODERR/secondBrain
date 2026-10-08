import { Link } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#070b08] text-stone-800 dark:text-stone-200 transition-colors duration-300">
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-[#070b08]/95 backdrop-blur-md border-b border-stone-200 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2d4a31] dark:bg-emerald-700/80 flex items-center justify-center text-white">
              <BrainIcon />
            </div>
            <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-white">Second Brain</span>
          </Link>
          <Link to="/" className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">Back to home</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-10">Last updated: October 2025</p>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">1. Acceptance of terms</h2>
            <p className="text-stone-600 dark:text-stone-400">
              By creating an account or using Second Brain, you agree to these Terms of Service. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">2. Description of service</h2>
            <p className="text-stone-600 dark:text-stone-400">
              Second Brain is a personal knowledge management tool that allows you to save, organize, and search YouTube videos, tweets, web links, and personal notes. The service is provided free of charge.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">3. Your account</h2>
            <p className="text-stone-600 dark:text-stone-400">
              You are responsible for keeping your account credentials secure. You are responsible for all activity that occurs under your account. Do not share your password. Notify us immediately if you suspect unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">4. Acceptable use</h2>
            <p className="text-stone-600 dark:text-stone-400">
              You may use Second Brain to save content for your personal knowledge management. You may not use the service to store or distribute illegal content, infringe on third-party intellectual property, attempt to access other users' private data, or conduct automated attacks against the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">5. Your content</h2>
            <p className="text-stone-600 dark:text-stone-400">
              You own the content you save to Second Brain. By using the public sharing feature, you grant other users the ability to view your shared vault. You can revoke public access at any time by disabling the share link.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">6. Service availability</h2>
            <p className="text-stone-600 dark:text-stone-400">
              We aim to keep Second Brain available but do not guarantee uninterrupted access. We may perform maintenance, upgrades, or experience outages. We are not liable for any loss of data or access resulting from downtime.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">7. Account termination</h2>
            <p className="text-stone-600 dark:text-stone-400">
              You may delete your account at any time from the Settings page. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your data will be deleted from our servers within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">8. Limitation of liability</h2>
            <p className="text-stone-600 dark:text-stone-400">
              Second Brain is provided as-is without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including loss of data.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">9. Changes to these terms</h2>
            <p className="text-stone-600 dark:text-stone-400">
              We may update these terms. We will update the date at the top of this page when changes are made. Continued use of the service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">10. Contact</h2>
            <p className="text-stone-600 dark:text-stone-400">
              For questions about these terms, reach us through the <Link to="/contact" className="text-[#2d4a31] dark:text-emerald-400 hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-stone-200 dark:border-white/5 py-6 px-5 sm:px-8 text-center text-xs text-stone-400 dark:text-stone-500">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Home</Link>
          <Link to="/privacy-policy" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Contact</Link>
        </div>
        <p className="mt-3">&copy; {new Date().getFullYear()} Second Brain</p>
      </footer>
    </div>
  );
}
