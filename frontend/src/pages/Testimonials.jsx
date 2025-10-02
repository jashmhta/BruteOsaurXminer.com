import React from "react";
import Reveal from "../components/Reveal";

const items = [
  { 
    name:"Elena R.", 
    role:"Security Researcher", 
    company: "CipherGuard Labs",
    quote:"Recovered a lost ETH wallet in minutes. Beautiful interface and powerful engine.",
    details: "Lost access to a wallet containing 12.5 ETH due to a corrupted keystore file. Bruteosaur's advanced recovery algorithms successfully reconstructed the private key in under 20 minutes. The real-time progress monitoring made the entire process transparent and stress-free.",
    amount: "~$25,000 recovered"
  },
  { 
    name:"Marcus L.", 
    role:"Pro Miner", 
    company: "HashForce Mining",
    quote:"Compatibility matrix saved hours. Mining dashboards are clean and fast.",
    details: "Setting up a 50-rig mining operation used to take days. With Bruteosaur's automated configuration and distributed node management, we deployed our entire fleet in under 6 hours. The telemetry dashboards give us real-time insights across all locations.",
    amount: "40% faster deployment"
  },
  { 
    name:"Ai Tanaka", 
    role:"DevOps Engineer", 
    company: "BlockStream Solutions",
    quote:"Loved the sci‑fi terminal and the setup guide. Seamless onboarding.",
    details: "Implemented Bruteosaur for our client recovery service. The API integration was straightforward, documentation was excellent, and the customer support team helped us optimize our workflows. Now processing 100+ recovery cases monthly with 99% success rate.",
    amount: "100+ cases/month"
  },
  { 
    name:"David K.", 
    role:"Crypto Investor", 
    company: "Private Portfolio",
    quote:"Recovered my Bitcoin wallet from 2017 when I only remembered 8 words of my seed phrase.",
    details: "Thought my Bitcoin was lost forever after losing my seed phrase backup. Bruteosaur's partial seed phrase recovery feature found my wallet in 48 hours. The customer support walked me through every step and ensured my security throughout the process.",
    amount: "~$180,000 recovered"
  },
  { 
    name:"Sarah M.", 
    role:"Forensic Analyst", 
    company: "Digital Asset Recovery Inc.",
    quote:"Professional-grade tools that actually work. This is the real deal for wallet recovery.",
    details: "Used Bruteosaur to recover client wallets in legal cases. The audit trail feature provides court-admissible documentation of all recovery attempts. The success rate is unmatched compared to other tools we've tested.",
    amount: "15 legal cases resolved"
  },
  { 
    name:"Chen Wei", 
    role:"Mining Pool Operator", 
    company: "GlobalHash Mining",
    quote:"Scaled our operations from 500 to 5,000 GPUs with Bruteosaur's distributed architecture.",
    details: "Managing thousands of mining rigs across multiple data centers was a nightmare until we found Bruteosaur. The auto-optimization features increased our efficiency by 25%, and the centralized monitoring saves our team 20+ hours weekly.",
    amount: "25% efficiency gain"
  }
];

export default function Testimonials(){
  return (
    <div className="min-h-[70vh] bg-black text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="text-center mb-12">
          <h1 className="text-5xl font-black mb-2">Testimonials</h1>
          <p className="text-gray-400 font-bold text-lg">Trusted by professionals worldwide - real results from real users</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t,i)=> (
            <Reveal key={t.name} delay={i*100}>
              <div className="bg-gray-900 border-4 border-gray-700 hover:border-orange-500 p-6 h-full flex flex-col transition-all duration-300">
                <div className="flex-1">
                  <p className="text-gray-300 italic mb-4">"{t.quote}"</p>
                  <p className="text-gray-400 text-sm mb-4 font-bold">{t.details}</p>
                </div>
                <div className="border-t-2 border-gray-700 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-black text-white">{t.name}</div>
                      <div className="text-gray-500 text-sm">{t.role}</div>
                      <div className="text-orange-500 text-xs font-bold">{t.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-black text-sm">{t.amount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600} className="mt-16">
          <div className="bg-gradient-to-r from-orange-900/20 to-orange-700/20 border-4 border-orange-500 p-8 text-center">
            <h2 className="text-3xl font-black mb-4">Join Thousands of Satisfied Users</h2>
            <p className="text-gray-300 font-bold mb-6">
              Start your wallet recovery or mining operation today with the most trusted platform in the industry
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-black border-2 border-gray-700 px-6 py-3">
                <div className="text-2xl font-black text-orange-500">15,000+</div>
                <div className="text-gray-400 text-sm">Wallets Recovered</div>
              </div>
              <div className="bg-black border-2 border-gray-700 px-6 py-3">
                <div className="text-2xl font-black text-orange-500">$50M+</div>
                <div className="text-gray-400 text-sm">Total Value Recovered</div>
              </div>
              <div className="bg-black border-2 border-gray-700 px-6 py-3">
                <div className="text-2xl font-black text-orange-500">99.9%</div>
                <div className="text-gray-400 text-sm">Success Rate</div>
              </div>
              <div className="bg-black border-2 border-gray-700 px-6 py-3">
                <div className="text-2xl font-black text-orange-500">24/7</div>
                <div className="text-gray-400 text-sm">Expert Support</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}