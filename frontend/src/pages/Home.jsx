import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { stats, features } from "../mock";
import { Cpu, Zap, Shield, TrendingUp, Download, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";

const ICONS = { Cpu, Zap, Shield, TrendingUp };
const HERO_VIDEO = "/assets/hero.mp4"; // moved to local assets

export default function Home() {
  const navigate = useNavigate();

  const FeatureCard = ({ icon, title, description }) => {
    const Icon = ICONS[icon] || Cpu;
    return (
      <div className="bg-black border-4 border-gray-600 p-6 hover:border-orange-500 transition-all duration-300">
        <div className="bg-orange-500 text-black p-3 border-[3px] border-black inline-block mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black mb-3 text-white">{title}</h3>
        <p className="text-gray-400 font-bold">{description}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop playsInline muted className="w-full h-full object-cover opacity-40">
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="text-white">BRUTE</span>
            <span className="text-orange-500">OSAUR</span>
          </h1>
          <div className="bg-orange-500 text-black px-8 py-4 border-4 border-black inline-block mb-8 -rotate-1">
            <p className="text-xl md:text-2xl font-black">ADVANCED CRYPTO MINING PLATFORM</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => navigate("/simulate")}
              className="bg-orange-500 text-black px-8 py-4 border-4 border-black font-black text-lg hover:bg-orange-400 transform hover:scale-105 transition-colors duration-200"
            >
              START DEMO <ArrowRight className="inline ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/simulate")}
              className="bg-gray-800 text-white px-8 py-4 border-4 border-gray-600 font-black text-lg hover:bg-gray-700 flex items-center"
            >
              <Download className="mr-2 h-5 w-5" /> DOWNLOAD NOW
            </button>
          </div>
        </div>
      </section>

      <section id="success" className="py-20 bg-gray-900 border-y-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i*50}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">{s.value}</div>
                  <div className="text-gray-400 font-bold text-sm">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              POWERFUL <span className="text-orange-500">FEATURES</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto font-bold">
              Professional-grade wallet recovery and mining infrastructure built for speed, security, and scale. 
              Recover lost wallets or mine with confidence using battle-tested technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i*80}>
                <FeatureCard icon={f.icon} title={f.title} description={f.description} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black border-y-4 border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              WHY <span className="text-orange-500">BRUTEOSAUR?</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto font-bold">
              Industry-leading wallet recovery and mining solution trusted by security professionals worldwide
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={0}>
              <div className="bg-gray-900 border-4 border-gray-700 p-8">
                <div className="text-5xl font-black text-orange-500 mb-4">99.9%</div>
                <h3 className="text-2xl font-black mb-3 text-white">Success Rate</h3>
                <p className="text-gray-400 font-bold">
                  Recover wallets with partial seed phrases, corrupted keystores, or forgotten passwords. 
                  Our advanced algorithms have helped recover over $50M in lost cryptocurrency.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="bg-gray-900 border-4 border-gray-700 p-8">
                <div className="text-5xl font-black text-orange-500 mb-4">24/7</div>
                <h3 className="text-2xl font-black mb-3 text-white">Support</h3>
                <p className="text-gray-400 font-bold">
                  Expert support team available around the clock. Get help with setup, optimization, 
                  or troubleshooting from experienced blockchain engineers and security researchers.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="bg-gray-900 border-4 border-gray-700 p-8">
                <div className="text-5xl font-black text-orange-500 mb-4">100+</div>
                <h3 className="text-2xl font-black mb-3 text-white">Supported Chains</h3>
                <p className="text-gray-400 font-bold">
                  Full compatibility with Bitcoin, Ethereum, Polygon, BSC, Solana, and 100+ EVM-compatible chains. 
                  Support for all major wallet formats including MetaMask, Ledger, and Trezor.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              USE <span className="text-orange-500">CASES</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal delay={0}>
              <div className="bg-black border-4 border-orange-500 p-8 hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl font-black mb-4 text-orange-500">Wallet Recovery</h3>
                <ul className="space-y-3 text-gray-300 font-bold">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Recover wallets with partial seed phrases (8-23 words known)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Brute force forgotten passwords on encrypted keystores</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Recover from corrupted wallet files or damaged hardware</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Multi-chain balance checking across 100+ networks</span>
                  </li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="bg-black border-4 border-orange-500 p-8 hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl font-black mb-4 text-orange-500">Professional Mining</h3>
                <ul className="space-y-3 text-gray-300 font-bold">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>GPU-accelerated mining with 1.25M+ attempts per second</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Real-time monitoring dashboards with live telemetry</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Distributed mining across multiple rigs and locations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Auto-optimization for maximum hash rate efficiency</span>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <h2 className="text-4xl font-black">What miners say</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              name: "Elena R.", quote: "Recovered a lost ETH wallet in minutes. The UI is gorgeous and performance is unreal.", role: "Security Researcher"
            },{
              name: "Marcus L.", quote: "Compatibility matrix saved hours. Mining dashboards are clean and fast.", role: "Pro Miner"
            },{
              name: "Ai Tanaka", quote: "Loved the terminal animation and the step-by-step setup guide.", role: "DevOps Engineer"
            }].map((t,i)=> (
              <Reveal key={t.name} delay={i*80}>
                <div className="bg-gray-900 border-4 border-gray-700 p-6">
                  <p className="text-gray-300 italic">"{t.quote}"</p>
                  <div className="mt-4 font-black text-white">{t.name}</div>
                  <div className="text-gray-500 text-sm">{t.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              FREQUENTLY ASKED <span className="text-orange-500">QUESTIONS</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                q: "How does wallet recovery work?",
                a: "Our recovery engine uses advanced cryptographic algorithms to test possible combinations of seed phrases, passwords, or keystore files. If you have partial information (like 8+ words of a 12-word seed phrase), we can systematically test all possible combinations to recover your wallet."
              },
              {
                q: "Is my data secure during recovery?",
                a: "Absolutely. All recovery operations run in encrypted memory with zero data retention. Your seed phrases and private keys are never logged or stored on our servers. Data is automatically purged after recovery or session timeout."
              },
              {
                q: "What wallet types are supported?",
                a: "We support all major wallet formats including MetaMask, Ledger, Trezor, Trust Wallet, Exodus, and hardware wallets. Compatible with Bitcoin, Ethereum, Polygon, BSC, Solana, and 100+ EVM-compatible chains."
              },
              {
                q: "How long does recovery take?",
                a: "Recovery time depends on the complexity of your case. Simple password recovery can take minutes, while partial seed phrase recovery may take 24-72 hours. Our GPU-accelerated engine processes 1.25M+ attempts per second."
              },
              {
                q: "What are the hardware requirements?",
                a: "Minimum: 8GB RAM, modern CPU. Recommended: 16GB+ RAM, NVIDIA RTX GPU for optimal performance. Enterprise deployments can scale across multiple servers with distributed processing."
              },
              {
                q: "Do you offer enterprise support?",
                a: "Yes! We provide dedicated support, custom SLAs, audit trails, compliance documentation, and API access for institutional clients. Contact our enterprise team for pricing and integration options."
              }
            ].map((faq, i) => (
              <Reveal key={i} delay={i*60}>
                <div className="bg-black border-4 border-gray-700 hover:border-orange-500 p-6 transition-all duration-300">
                  <h3 className="text-lg font-black text-orange-500 mb-3">{faq.q}</h3>
                  <p className="text-gray-400 font-bold">{faq.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black border-y-4 border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              CHOOSE YOUR <span className="text-orange-500">PLAN</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto font-bold">
              Flexible pricing for individuals, professionals, and enterprises. Start free or scale to unlimited recovery operations.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Reveal delay={0}>
              <div className="bg-gray-900 border-4 border-gray-700 p-8 hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl font-black mb-2">STARTER</h3>
                <div className="text-4xl font-black text-orange-500 mb-4">FREE</div>
                <p className="text-gray-400 font-bold mb-6">Perfect for trying out basic recovery features</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "3 recovery attempts/month",
                    "Basic password recovery",
                    "Single-chain support",
                    "Community support",
                    "Web-based interface"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-300 font-bold">
                      <span className="text-green-500 mr-3">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/simulate")}
                  className="w-full bg-gray-800 text-white px-6 py-3 border-4 border-gray-600 font-black hover:bg-gray-700 transition-colors"
                >
                  GET STARTED
                </button>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="bg-orange-900 border-4 border-orange-500 p-8 relative hover:scale-105 transition-transform duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-black px-4 py-1 font-black text-sm border-2 border-black">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-black mb-2">PRO</h3>
                <div className="text-4xl font-black text-orange-500 mb-4">
                  $99<span className="text-lg">/mo</span>
                </div>
                <p className="text-gray-300 font-bold mb-6">For professionals and serious miners</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited recovery attempts",
                    "Advanced seed phrase recovery",
                    "Multi-chain support (100+)",
                    "Priority 24/7 support",
                    "GPU acceleration",
                    "Desktop client access",
                    "Real-time telemetry"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-100 font-bold">
                      <span className="text-orange-500 mr-3">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/simulate")}
                  className="w-full bg-orange-500 text-black px-6 py-3 border-4 border-black font-black hover:bg-orange-400 transition-colors"
                >
                  START PRO TRIAL
                </button>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="bg-gray-900 border-4 border-gray-700 p-8 hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl font-black mb-2">ENTERPRISE</h3>
                <div className="text-4xl font-black text-orange-500 mb-4">CUSTOM</div>
                <p className="text-gray-400 font-bold mb-6">For institutions and large-scale operations</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Pro",
                    "Distributed mining clusters",
                    "Custom SLA agreements",
                    "Dedicated support team",
                    "Compliance & audit trails",
                    "API access & webhooks",
                    "On-premise deployment",
                    "White-label options"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-300 font-bold">
                      <span className="text-green-500 mr-3">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/about")}
                  className="w-full bg-gray-800 text-white px-6 py-3 border-4 border-gray-600 font-black hover:bg-gray-700 transition-colors"
                >
                  CONTACT SALES
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-orange-500 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">READY TO START MINING?</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate("/simulate")}
              className="bg-black text-orange-500 px-8 py-4 border-4 border-black font-black text-lg hover:bg-gray-900 transform hover:scale-105 transition-colors duration-200"
            >
              START MINING NOW
            </button>
            <Link
              to="/about"
              className="bg-white text-black px-8 py-4 border-4 border-black font-black text-lg hover:bg-gray-100 transform hover:scale-105 transition-colors duration-200"
            >
              LEARN MORE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}