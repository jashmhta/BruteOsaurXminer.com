import React, { useEffect } from "react";
import Reveal from "../components/Reveal";
import { Cpu, Shield, Zap, Gauge, Server, Network, Wrench } from "lucide-react";

const tech = [
  { icon: Cpu, title: "GPU Acceleration", desc: "Optimized CUDA / Metal kernels driving 1.25M+ combos/sec with parallel workload distribution across multiple GPUs" },
  { icon: Shield, title: "Encrypted Pipelines", desc: "Zero-copy, encrypted memory and disk I/O with AES-256-GCM encryption. Data automatically purged after recovery" },
  { icon: Zap, title: "Parallelism", desc: "Multi-threaded brute-force with adaptive batching. Scales from single-core to 1000+ GPU cluster deployments" },
  { icon: Server, title: "Distributed Nodes", desc: "Scale out across rigs with resilient job queues, automatic failover, and Redis-backed state synchronization" },
  { icon: Gauge, title: "Telemetry", desc: "Real-time metrics and auto-tuning for best hash rate. Prometheus/Grafana integration for enterprise monitoring" },
  { icon: Network, title: "Cross-Chain", desc: "Wallet formats across BTC/ETH/SOL and EVM-compatible chains. Support for 100+ blockchain protocols" },
  { icon: Wrench, title: "Plugin SDK", desc: "Extend recoverers via lightweight WASM plugins. Build custom recovery algorithms without core modifications" },
];

export default function Technologies() {
  useEffect(() => {
    document.title = "Technologies - BRUTEOSAUR";
  }, []);

  return (
    <div className="min-h-[75vh] bg-black text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">Technologies</h1>
          <p className="text-gray-400 font-bold max-w-2xl mx-auto text-lg">
            Deep optimizations across hardware and software stack to deliver professional-grade performance. 
            Built with cutting-edge cryptographic algorithms and distributed computing architecture.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {tech.map((t, i) => (
            <Reveal key={t.title} delay={i*80}>
              <div className="bg-gray-900 border-4 border-gray-700 hover:border-orange-500 p-6 h-full transition-all duration-300">
                <div className="bg-orange-500 inline-block p-2 border-2 border-black text-black mb-4">
                  <t.icon className="h-7 w-7" />
                </div>
                <h3 className="font-black text-xl mb-2">{t.title}</h3>
                <p className="text-gray-400 font-bold">{t.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div className="bg-gray-900 border-4 border-orange-500 p-8 mb-16">
            <h2 className="text-3xl font-black mb-6 text-center text-orange-500">Performance Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { metric: "1.25M+", label: "Attempts/Second", sublabel: "Single RTX 4090" },
                { metric: "<50ms", label: "P99 Latency", sublabel: "API Response Time" },
                { metric: "99.99%", label: "Uptime SLA", sublabel: "Enterprise Tier" },
                { metric: "100+", label: "Blockchains", sublabel: "Cross-Chain Support" }
              ].map((item, i) => (
                <div key={i} className="bg-black border-2 border-gray-700 p-6 text-center">
                  <div className="text-4xl font-black text-orange-500 mb-2">{item.metric}</div>
                  <div className="text-white font-bold mb-1">{item.label}</div>
                  <div className="text-gray-500 text-sm">{item.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={500}>
          <div className="bg-gray-900 border-4 border-gray-700 p-8 mb-16">
            <h2 className="text-3xl font-black mb-6 text-center text-orange-500">Technical Architecture</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-black mb-4 text-white">Recovery Engine</h3>
                <ul className="space-y-3 text-gray-300 font-bold">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>BIP39 seed phrase derivation with optimized keccak256 hashing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>PBKDF2-HMAC-SHA512 with 2048 iterations for keystore decryption</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Elliptic curve cryptography (secp256k1) for address generation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Rainbow table acceleration for password brute-forcing</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-black mb-4 text-white">Infrastructure</h3>
                <ul className="space-y-3 text-gray-300 font-bold">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Kubernetes orchestration for auto-scaling worker nodes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>Redis cluster for distributed state and job queue management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>MongoDB replica sets for high-availability data persistence</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3">▸</span>
                    <span>WebSocket streaming for real-time progress updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={400} className="mt-12">
          <div className="bg-black border-4 border-orange-500 p-6 font-mono text-sm overflow-x-auto">
            <div className="text-gray-500 mb-2"># Initialize GPU-accelerated recovery session</div>
            <div className="text-gray-300">$ bfgminer -o stratum+tcp://pool:3333 -O user:pass --gpu-threads 4 --intensity 19</div>
            <div className="text-green-400 mt-2">[ok] engine online • telemetry streaming</div>
            <div className="text-yellow-400">[info] GPU 0: RTX 4090 @ 1.25M attempts/sec</div>
            <div className="text-cyan-400">[metric] memory: 8.2GB/24GB • temp: 62°C • power: 320W</div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}