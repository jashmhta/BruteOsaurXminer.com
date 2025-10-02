import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const WORDS = [
  "frequent","wine","code","army","furnace","donor","olive","uniform","ball","match","left","divorce"
];

const mk = (el, cls = "") => <pre className={`whitespace-pre-wrap text-sm font-mono ${cls}`}>{el}</pre>;

export default function Simulate() {
  useEffect(() => {
    document.title = "Mining Simulation - BRUTEOSAUR";
  }, []);

  const [logs, setLogs] = useState([]);
  const [mnems, setMnems] = useState([]);
  const [showWalletFound, setShowWalletFound] = useState(false);
  const navigate = useNavigate();
  const timeouts = useRef([]);

  useEffect(() => {
    const q = (fn, t) => timeouts.current.push(setTimeout(fn, t));
    const push = (node) => setLogs((l) => [...l, node].slice(-400));

    // Extended storyline (Linux-like, sci‑fi vibe) - slightly faster
    q(() => push(mk("$ sudo bfgminer --init", "text-gray-300")), 80);
    q(() => push(mk("[ok] kernel: modules loaded", "text-green-400")), 600);
    q(() => push(mk("gpu0: NVIDIA RTX 4090 • driver 555.85", "text-blue-400")), 1100);
    q(() => push(mk("cpu: 16 cores • AES-NI ON", "text-blue-400")), 1600);
    q(() => push(mk("$ netctl up mining-net", "text-gray-300")), 2100);
    q(() => push(mk("[ok] network online @ 1Gbps", "text-green-400")), 2600);

    // hash rate bursts - faster intervals
    for (let i = 0; i < 8; i++) {
      q(() => {
        const rate = (1200000 + Math.floor(Math.random() * 200000)).toLocaleString();
        push(mk(`hashrate ${rate}/sec • searching entropy …`, "text-gray-200"));
      }, 3100 + i * 600);
    }

    // mnemonic collection - faster
    for (let i = 0; i < 12; i++) {
      q(() => {
        const w = WORDS[i];
        setMnems((m) => [...m, w]);
      }, 3800 + i * 450);
    }

    // Faster results display
    q(() => push(mk("$ result: matching entropy located", "text-green-400")), 10200);
    q(() => push(mk("$ wallet discovery: TRON wallet with $200 balance found", "text-green-400 font-bold")), 10800);
    q(() => push(mk("$ MNEMONIC PHRASE: " + WORDS.join(" "), "text-yellow-400 font-bold text-lg")), 11200);
    q(() => push(mk("$ GUIDE: Save this mnemonic phrase and register to claim the $200 TRON wallet", "text-cyan-400 font-bold")), 11700);
    q(() => setShowWalletFound(true), 12200);

    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, [navigate]);

  const handleContinue = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-2 sm:px-4 py-6">
        {/* Wallet Found Modal */}
        {showWalletFound && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-black border-4 border-green-500 rounded-lg p-6 max-w-sm w-full text-center">
              <div className="text-5xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">$200 TRON WALLET FOUND!</h2>
              <div className="bg-gray-900 border-2 border-yellow-500 rounded p-4 mb-4">
                <div className="text-yellow-400 font-bold mb-2">🔑 DISCOVERED MNEMONIC:</div>
                <div className="font-mono text-sm text-white mb-3 break-all">
                  {WORDS.join(' ')}
                </div>
                <div className="text-xs text-gray-400">
                  Save this phrase securely - it's your key to the $200 TRON wallet!
                </div>
              </div>
              <p className="text-gray-300 mb-6 text-sm">
                Congratulations! Our mining simulation has discovered a TRON wallet containing $200.
                Register now using this mnemonic phrase to claim your wallet and start mining.
              </p>
              <Button
                onClick={handleContinue}
                className="w-full bg-green-500 text-black border-2 border-green-400 font-black hover:bg-green-400 text-lg py-3"
              >
                CONTINUE TO REGISTRATION
              </Button>
            </div>
          </div>
        )}

        <div className="bg-black border-4 border-orange-500 rounded">
          <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-black" />
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
            <span className="ml-2 text-gray-400 font-bold text-sm">Terminal</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 p-4 font-mono h-[400px] overflow-y-auto bg-[#0b0b0b] text-sm">
              {logs.map((n, i) => (
                <div key={i} className="leading-5">{n}</div>
              ))}
              <div className="type-cursor h-3" />
            </div>
            <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-gray-700 p-4">
              <div className="text-gray-400 font-bold mb-2 text-sm">DISCOVERED MNEMONIC PHRASE</div>
              <div className="bg-black border-2 border-orange-500 rounded p-3 mb-3">
                <div className="text-orange-400 font-mono text-base font-bold text-center tracking-wide break-all">
                  {mnems.join(' ')}
                </div>
              </div>
              <div className="text-green-400 text-xs text-center">
                💰 Wallet containing $200 TRON discovered!
              </div>
            </div>
          </div>
        </div>
        {!showWalletFound && (
          <div className="text-center text-gray-400 mt-4 text-sm">Mining simulation in progress...</div>
        )}
      </div>
    </div>
  );
}