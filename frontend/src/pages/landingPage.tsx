import { Link } from "react-router-dom"
import { BrainIcon } from "../icons/brainIcon"
import { Button } from "../components/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3 text-2xl font-semibold">
          <div className="text-purple-600">
            <BrainIcon />
          </div>
          Second Brain
        </div>

        <div className="flex gap-4">
          <Link to="/signin">
            <Button text="Login" size="md" varient="secondary" />
          </Link>
          <Link to="/signup">
            <Button text="Get Started" size="md" varient="primary" />
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to from-purple-50 via-white to-indigo-50" />

        <div className="relative flex flex-col items-center text-center px-6 py-28">
          <h1 className="text-5xl md:text-6xl font-bold max-w-4xl leading-tight">
            Save anything.<br />
            <span className="text-purple-600">Remember everything.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            Second Brain helps you store YouTube videos, tweets, links,
            and notes all in one fast, searchable place.
          </p>

          <div className="mt-10 flex gap-4">
            <Link to="/signup">
              <Button text="Create Your Brain" size="lg" varient="primary" />
            </Link>
            <Link to="/signin">
              <Button text="I Already Have One" size="lg" varient="secondary" />
            </Link>
          </div>

          <div className="mt-20 w-full max-w-5xl">
            <div className="bg-white rounded-xl shadow-xl border p-6 text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">All Notes</span>
                <span className="text-sm text-gray-400">Preview</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PreviewCard title="tweet" />
                <PreviewCard title="YouTube Tutorial" />
                <PreviewCard title="My Ideas" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-24 px-8">
        <h2 className="text-3xl font-semibold text-center mb-12">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Step
            title="Save Content"
            desc="Add YouTube videos, tweets, links, or notes in seconds."
          />
          <Step
            title="Organize Automatically"
            desc="Everything is grouped by type and easy to filter."
          />
          <Step
            title="Recall Instantly"
            desc="Your Second Brain is always one click away."
          />
        </div>
      </section>

      <section className="py-24 px-8">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Why Second Brain?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <Feature text="Store tweets, videos, links, and notes together" />
          <Feature text="Minimal, distraction-free interface" />
          <Feature text="Secure cookie-based authentication" />
          <Feature text="Share your brain with a single link" />
        </div>
      </section>

      <section className="bg-purple-600 text-white py-24 text-center">
        <h2 className="text-4xl font-bold">
          Build your Second Brain today
        </h2>
        <p className="mt-4 text-purple-100">
          It takes less than a minute to get started.
        </p>

        <div className="mt-8 flex justify-center">
          <Link to="/signup">
            <Button text="Get Started Free" size="lg" varient="primary" />
          </Link>
        </div>
      </section>
    </div>
  )
}


function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      {text}
    </div>
  )
}

function PreviewCard({ title }: { title: string }) {
  return (
    <div className="border rounded-lg p-4 bg-zinc-50">
      <div className="h-24 bg-zinc-200 rounded mb-2" />
      <p className="font-medium text-sm truncate">{title}</p>
    </div>
  )
}
