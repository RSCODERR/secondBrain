import { Link } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-10">Last updated: October 2025</p>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">1. What we collect</h2>
            <p className="text-stone-600 dark:text-stone-400">
              When you create an account, we collect your username and password (hashed). When you save content, we store the data you submit including URLs, titles, notes, and tags you assign. We do not collect payment information as Second Brain is free to use.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">2. How we use your data</h2>
            <p className="text-stone-600 dark:text-stone-400">
              Your data is used solely to provide the Second Brain service: storing your saved content, enabling search and tag filtering, and generating public share links when you explicitly request one. We do not sell your data to third parties. We do not use your data to serve you advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">3. Data storage</h2>
            <p className="text-stone-600 dark:text-stone-400">
              Your content is stored on secure servers. Your vault is private by default. Content becomes publicly accessible only when you generate a share link. You can delete your account and all associated data at any time from the settings page.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">4. Cookies and local storage</h2>
            <p className="text-stone-600 dark:text-stone-400">
              We use browser local storage to keep you signed in across sessions and to remember your theme preference. We do not use tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">5. Third-party services</h2>
            <p className="text-stone-600 dark:text-stone-400">
              Second Brain uses Vercel for hosting and analytics (page views only, no personal data). When you save YouTube or Twitter content, those platforms are contacted to fetch metadata. We do not share your account information with those platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">6. Your rights</h2>
            <p className="text-stone-600 dark:text-stone-400">
              You have the right to access, export, or delete your data at any time. To delete your account, go to Settings. To request a data export or for any privacy-related questions, contact us via the contact page.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">7. Changes to this policy</h2>
            <p className="text-stone-600 dark:text-stone-400">
              If we make material changes to this policy, we will update the date at the top of this page. Continued use of Second Brain after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-3">8. Contact</h2>
            <p className="text-stone-600 dark:text-stone-400">
              For privacy-related questions, reach us through the <Link to="/contact" className="text-[#2d4a31] dark:text-emerald-400 hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-stone-200 dark:border-white/5 py-6 px-5 sm:px-8 text-center text-xs text-stone-400 dark:text-stone-500">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Home</Link>
          <Link to="/terms" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Contact</Link>
        </div>
        <p className="mt-3">&copy; {new Date().getFullYear()} Second Brain</p>
      </footer>
    </div>
  );
}
