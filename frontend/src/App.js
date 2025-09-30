import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Compatibility from "./pages/Compatibility";
import { Toaster } from "./components/ui/toaster";
import Simulate from "./pages/Simulate";
import Auth from "./pages/Auth";
import ConnectWallet from "./pages/ConnectWallet";
import DownloadGuide from "./pages/DownloadGuide";
import Technologies from "./pages/Technologies";
import Success from "./pages/Success";
import Testimonials from "./pages/Testimonials";
import About from "./pages/About";
import Demo from "./pages/Demo";
import Logger from "./utils/logger";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}`;

const HomePage = Home;
const CompatibilityPage = Compatibility;

function App() {
  useEffect(() => {
    const helloWorldApi = async () => {
      try {
        const response = await axios.get(`${API}/`);
        Logger.info(response.data.message);
      } catch (e) {
        Logger.error(e, "errored out requesting / api");
      }
    };
    helloWorldApi();
  }, []);

  return (
    <ErrorBoundary>
      <div className="bg-black min-h-screen">
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/technologies" element={<Technologies />} />
              <Route path="/compatibility" element={<CompatibilityPage />} />
              <Route path="/success" element={<Success />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/about" element={<About />} />
              <Route path="/simulate" element={<Simulate />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/connect-wallet" element={<ConnectWallet />} />
              <Route path="/download-guide" element={<DownloadGuide />} />
            </Routes>
          </Layout>
          <Toaster />
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}

export default App;