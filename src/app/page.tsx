import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-indigo-500 font-medium mb-4 tracking-wide uppercase text-sm">
              Creative Designer
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.1]">
              Crafting digital
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                experiences
              </span>
              <br />
              that inspire
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed max-w-xl">
              I design beautiful interfaces and memorable brand identities that
              help businesses connect with their audience and achieve their goals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Get in touch
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <a
                href="#work"
                className="inline-flex items-center px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-full font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                View my work
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
                About Me
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                With over 8 years of experience in digital design, I specialize in
                creating user-centered interfaces that balance aesthetics with
                functionality.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                My approach combines strategic thinking with creative execution,
                ensuring every project not only looks stunning but also achieves
                measurable results.
              </p>
              <div className="flex flex-wrap gap-3">
                {["UI/UX Design", "Brand Identity", "Web Design", "Motion"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white/20 text-9xl font-bold">D</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Selected Work
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              A collection of projects that showcase my approach to design and
              problem-solving.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Brand Redesign",
                category: "Brand Identity",
                color: "from-blue-500 to-cyan-400",
              },
              {
                title: "Mobile App UI",
                category: "UI/UX Design",
                color: "from-purple-500 to-pink-500",
              },
              {
                title: "E-commerce Platform",
                category: "Web Design",
                color: "from-orange-500 to-red-500",
              },
              {
                title: "Dashboard Design",
                category: "UI/UX Design",
                color: "from-green-500 to-emerald-400",
              },
            ].map((project, index) => (
              <div
                key={index}
                className="group cursor-pointer"
              >
                <div
                  className={`aspect-[4/3] bg-gradient-to-br ${project.color} rounded-2xl mb-4 overflow-hidden relative`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      View Project
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">
                  {project.title}
                </h3>
                <p className="text-zinc-500 text-sm">{project.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-zinc-900 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Let&apos;s create something amazing together
          </h2>
          <p className="text-zinc-400 mb-8 text-lg max-w-xl mx-auto">
            Have a project in mind? I&apos;d love to hear about it. Let&apos;s discuss how
            we can bring your vision to life.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-100 transition-colors text-lg"
          >
            Start a conversation
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
