import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";

const LOGO_URL = "/assets/logo.jpg";

const NavLink = ({ to, children, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "px-3 py-2 font-black text-sm tracking-wide border-b-[3px] rounded -mb-[3px]",
        "transition-colors hover:text-white",
        active ? "text-orange-500 border-orange-500" : "text-gray-300 border-transparent hover:border-gray-600"
      )}
    >
      {children}
    </Link>
  );
};

export default function Layout({ children }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className={cn(
        "fixed top-0 w-full z-40 border-b-4 border-orange-500 transition-all",
        scrolled ? "bg-black/90 backdrop-blur shadow-[0_8px_24px_rgba(0,0,0,0.4)]" : "bg-black/75 backdrop-blur"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Bruteosaur" className="w-10 h-10 rounded object-contain"/>
            <div className="font-black text-2xl tracking-tighter">
              <span className="text-white">BRUTE</span>
              <span className="text-orange-500">OSAUR</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/demo">Demo</NavLink>
            <NavLink to="/technologies">Technologies</NavLink>
            <NavLink to="/compatibility">Compatibility</NavLink>
            <NavLink to="/success">Success Rate</NavLink>
            <NavLink to="/testimonials">Testimonials</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button aria-label="Open menu" className="p-2 border-2 border-gray-700 hover:border-orange-500">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black text-white border-l-4 border-orange-500 w-72">
                <div className="mt-8 flex flex-col space-y-2">
                  <NavLink to="/">Home</NavLink>
                  <NavLink to="/demo">Demo</NavLink>
                  <NavLink to="/technologies">Technologies</NavLink>
                  <NavLink to="/compatibility">Compatibility</NavLink>
                  <NavLink to="/success">Success Rate</NavLink>
                  <NavLink to="/testimonials">Testimonials</NavLink>
                  <NavLink to="/about">About</NavLink>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="pt-16">{children}</main>
      <footer className="border-t-4 border-gray-800 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-400 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Bruteosaur. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-bold">
            <Link to="/simulate" className="hover:text-white">Start Mining Now</Link>
            <Link to="/compatibility" className="hover:text-white">Compatibility</Link>
            <Link to="/technologies" className="hover:text-white">Technologies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}