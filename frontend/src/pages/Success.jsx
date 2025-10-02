import React, { useEffect, useState } from "react";
import Reveal from "../components/Reveal";

const Bar = ({ label, value, color = "bg-green-500" }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm font-bold"><span className="text-gray-300">{label}</span><span className="text-white">{value}%</span></div>
    <div className="w-full h-3 bg-gray-800 border-2 border-black">
      <div className={`${color} h-full`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function Success() {
  useEffect(() => {
    document.title = "Success Rate - BRUTEOSAUR";
  }, []);

  const [vals, setVals] = useState({ overall: 0, eth: 0, btc: 0, sol: 0 });
  useEffect(() => {
    const target = { overall: 94.7, eth: 92.1, btc: 96.8, sol: 90.5 };
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 1200);
      setVals({
        overall: +(target.overall * p).toFixed(1),
        eth: +(target.eth * p).toFixed(1),
        btc: +(target.btc * p).toFixed(1),
        sol: +(target.sol * p).toFixed(1),
      });
      if (p === 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-[75vh] bg-black text-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">Success Rate</h1>
          <p className="text-gray-400 font-bold">Field-proven recovery performance and methodology.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal delay={50}>
            <div className="bg-gray-900 border-4 border-gray-700 p-6 space-y-4">
              <Bar label="Overall" value={vals.overall} />
              <Bar label="Ethereum" value={vals.eth} color="bg-blue-500" />
              <Bar label="Bitcoin" value={vals.btc} color="bg-yellow-500" />
              <Bar label="Solana" value={vals.sol} color="bg-purple-500" />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="bg-black border-4 border-orange-500 p-6 font-mono text-sm">
              <div className="text-gray-300">$ metrics --window 30m</div>
              <div className="text-green-400">ok • aggregation complete</div>
              <div className="text-gray-200">avg-time 7.3s • variance 1.1s</div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}