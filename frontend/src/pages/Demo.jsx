import React, { useEffect } from "react";
import Reveal from "../components/Reveal";

export default function Demo() {
  useEffect(() => {
    document.title = "Demo - BRUTEOSAUR";
  }, []);

  return (
    <div className="min-h-[70vh] bg-black text-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black">WATCH DEMO</h1>
        </Reveal>
        <Reveal>
          <div className="aspect-video border-4 border-orange-500">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/DgJRoQcz6RQ?rel=0"
              title="Bruteosaur Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </Reveal>
      </section>
    </div>
  );
}