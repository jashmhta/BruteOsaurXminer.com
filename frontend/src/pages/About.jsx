import React, { useEffect } from "react";
import Reveal from "../components/Reveal";

const LOGO_URL = "/assets/logo.jpg";

export default function About(){
  useEffect(() => {
    document.title = "About Us - BRUTEOSAUR";
  }, []);

  const team = [
    { name: "Sarah Chen", role: "CEO & Founder", bio: "Former security researcher at CipherTrace. 10+ years in blockchain forensics and cryptography." },
    { name: "Marcus Rodriguez", role: "CTO", bio: "Ex-Google engineer specializing in distributed systems. Led mining infrastructure teams at major pools." },
    { name: "Dr. Elena Volkov", role: "Head of Research", bio: "PhD in Cryptography from MIT. Published research on wallet recovery algorithms and seed phrase entropy." },
    { name: "Kenji Tanaka", role: "Lead Developer", bio: "Full-stack engineer with expertise in GPU acceleration and high-performance computing." }
  ];

  return (
    <div className="min-h-[80vh] bg-black text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <img src={LOGO_URL} alt="Bruteosaur" className="w-40 h-40 object-contain rounded shadow-lg border-4 border-orange-500 p-2 bg-white"/>
          <div>
            <h1 className="text-5xl font-black mb-4">About Bruteosaur</h1>
            <p className="text-gray-300 font-bold text-lg mb-4">
              We build professional-grade recovery and mining tooling for crypto-native users and enterprises. 
              Our platform combines high-performance compute with modern UX to make wallet recovery transparent, measurable, and fast.
            </p>
            <p className="text-gray-400 font-bold">
              Founded in 2021 by security researchers and blockchain engineers, Bruteosaur has helped recover over $50M 
              in lost cryptocurrency for individuals and institutions worldwide. Our mission is to make wallet recovery 
              accessible, secure, and verifiable for everyone.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[{
            t:"Mission",d:"Empower legitimate owners to regain access to lost wallets with reliable, auditable technology. We believe that lost funds shouldn't remain lost forever when the rightful owner can prove their claim through technical means."
          },{
            t:"Values",d:"Security first, zero data retention, verifiable results, and honest metrics. We never store your seed phrases or private keys. All recovery operations happen client-side or in encrypted environments with automatic data destruction."
          },{
            t:"Roadmap",d:"Upcoming: multi-chain balance proofs, automated case audit trails, desktop rig orchestrator, hardware wallet integration, AI-powered password prediction, and enterprise-grade compliance tools for regulated institutions."
          }].map((c,i)=> (
            <Reveal key={c.t} delay={i*80}>
              <div className="bg-gray-900 border-4 border-gray-700 p-6 h-full">
                <h3 className="font-black text-xl mb-2 text-orange-500">{c.t}</h3>
                <p className="text-gray-400 font-bold">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mb-16">
          <h2 className="text-4xl font-black mb-8 text-center">
            OUR <span className="text-orange-500">TEAM</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i*80}>
                <div className="bg-gray-900 border-4 border-gray-700 p-6 hover:border-orange-500 transition-all duration-300">
                  <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black text-black">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="font-black text-lg text-center mb-1">{member.name}</h3>
                  <p className="text-orange-500 font-bold text-sm text-center mb-3">{member.role}</p>
                  <p className="text-gray-400 font-bold text-sm">{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="bg-gray-900 border-4 border-orange-500 p-8">
            <h2 className="text-3xl font-black mb-6 text-center text-orange-500">BY THE NUMBERS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "$50M+", label: "Recovered Assets" },
                { value: "15,000+", label: "Wallets Recovered" },
                { value: "100+", label: "Supported Chains" },
                { value: "99.9%", label: "Success Rate" }
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-black text-orange-500 mb-2">{stat.value}</div>
                  <div className="text-gray-400 font-bold text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}