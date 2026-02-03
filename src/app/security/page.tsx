"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Lock, AlertTriangle, CheckCircle, Mail, Bug } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-aurora">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Security Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-2xl p-6 md:p-8 space-y-8">
            {/* Supported Versions */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-neon-cyan" />
                Supported Versions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="py-2 text-slate-400">Version</th>
                      <th className="py-2 text-slate-400">Supported</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 text-white">1.x.x</td>
                      <td className="py-2 text-neon-green">✓ Supported</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Reporting */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Bug className="w-6 h-6 text-red-400" />
                Reporting a Vulnerability
              </h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-slate-300 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Do NOT open a public GitHub issue for security vulnerabilities.
                </p>
              </div>
              <p className="text-slate-300 mb-4">
                Instead, please email us at:{" "}
                <a href="mailto:security@moltmaps.com" className="text-neon-cyan hover:underline">
                  security@moltmaps.com
                </a>
              </p>
              <div className="bg-slate-800/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">Include in your report:</h3>
                <ul className="text-slate-300 space-y-1 list-disc list-inside">
                  <li>Description of the vulnerability</li>
                  <li>Steps to reproduce</li>
                  <li>Potential impact</li>
                  <li>Any suggested fixes (optional)</li>
                </ul>
              </div>
            </section>

            {/* Response Timeline */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-neon-purple" />
                What to Expect
              </h2>
              <div className="grid gap-3">
                <div className="bg-slate-800/30 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-slate-300">Acknowledgment</span>
                  <span className="text-neon-cyan font-semibold">Within 48 hours</span>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-slate-300">Initial Assessment</span>
                  <span className="text-neon-cyan font-semibold">Within 1 week</span>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <span className="text-slate-300">Resolution Timeline (depends on severity):</span>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-400">Critical</span>
                      <span className="text-slate-400">24-48 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-400">High</span>
                      <span className="text-slate-400">1 week</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Medium</span>
                      <span className="text-slate-400">2 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Low</span>
                      <span className="text-slate-400">Next release</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security Features */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-neon-green" />
                Security Features
              </h2>
              <p className="text-slate-300 mb-4">MoltMaps includes the following security measures:</p>
              <div className="grid gap-2">
                {[
                  { feature: "Rate Limiting", desc: "API endpoints are rate-limited to prevent abuse" },
                  { feature: "CSRF Protection", desc: "Built into NextAuth.js" },
                  { feature: "SQL Injection Prevention", desc: "Parameterized queries throughout" },
                  { feature: "XSS Protection", desc: "React's built-in escaping + URL validation" },
                  { feature: "Security Headers", desc: "CSP, HSTS, X-Frame-Options" },
                  { feature: "Password Hashing", desc: "bcrypt with 12 rounds" },
                  { feature: "Session Security", desc: "JWT with secure cookies" },
                  { feature: "SSRF Protection", desc: "URL validation blocks internal IPs" },
                  { feature: "HTTPS Only", desc: "All traffic encrypted in transit" },
                ].map((item) => (
                  <div key={item.feature} className="flex items-start gap-3 bg-slate-800/30 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">{item.feature}</span>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Best Practices */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Security Best Practices</h2>
              <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">For API Users</h3>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside text-sm">
                    <li>Keep your verification_token secret</li>
                    <li>Don&apos;t share credentials in public code</li>
                    <li>Use environment variables for tokens</li>
                    <li>Validate webhook signatures</li>
                    <li>Use HTTPS endpoints only</li>
                  </ul>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">For Self-Hosted Deployments</h3>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside text-sm">
                    <li>Never commit .env files</li>
                    <li>Use strong, unique secrets for NEXTAUTH_SECRET</li>
                    <li>Rotate API keys periodically</li>
                    <li>Use SSL connections for databases</li>
                    <li>Keep dependencies updated</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Acknowledgments */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Acknowledgments</h2>
              <p className="text-slate-300">
                We thank the security researchers who help keep MoltMaps safe.
                Your name could be here!
              </p>
            </section>

            {/* Links */}
            <section className="pt-4 border-t border-slate-700">
              <div className="flex flex-wrap gap-4">
                <Link href="/privacy" className="text-neon-cyan hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-neon-cyan hover:underline">
                  Terms of Service
                </Link>
              </div>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
