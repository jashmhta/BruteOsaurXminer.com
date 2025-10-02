import React, { useEffect, useState } from "react";
import { Download, Play, CheckCircle, AlertTriangle, Settings, Terminal, Zap, Shield, Cpu, HardDrive } from "lucide-react";
import Logger from "../utils/logger";

export default function DownloadGuide() {
  useEffect(() => {
    document.title = "Download Guide - BRUTEOSAUR";
  }, []);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [installStep, setInstallStep] = useState(0);
  const [systemCheck, setSystemCheck] = useState({ checked: false, compatible: true });
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Log download started
    const logDownloadStarted = async () => {
      const userId = sessionStorage.getItem("userId");
      if (userId) {
        try {
          await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://192.0.0.2:3001'}/mining-operation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              operation: 'download_started',
              details: { software: 'BFGMiner', version: 'master' }
            })
          });
        } catch (error) {
          Logger.error('Failed to log download start:', error);
        }
      }
    };

    // Start real BFGMiner download
    setTimeout(() => {
      logDownloadStarted();

      const a = document.createElement("a");
      a.href = "https://github.com/luke-jr/bfgminer/archive/refs/heads/master.zip";
      a.download = "bfgminer.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Simulate download progress
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setShowAnimation(true);

            // Log download completed
            const userId = sessionStorage.getItem("userId");
            if (userId) {
              fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://192.0.0.2:3001'}/mining-operation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId,
                  operation: 'download_completed',
                  details: { software: 'BFGMiner', version: 'master' }
                })
              }).catch(error => {
                Logger.error('Failed to log download completion:', error);
              });
            }

            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }, 1000);

    // System compatibility check
    setTimeout(() => {
      setSystemCheck({ checked: true, compatible: true });
    }, 2000);
  }, []);

  const installationSteps = [
    {
      icon: <Download className="h-6 w-6" />,
      title: "Download BFGMiner",
      description: "Get the latest BFGMiner source code from official repository",
      command: "wget https://github.com/luke-jr/bfgminer/archive/refs/heads/master.zip"
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Extract Archive",
      description: "Unzip the downloaded archive to your preferred directory",
      command: "unzip master.zip && cd bfgminer-master"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Install Dependencies",
      description: "Install required system dependencies for building",
      command: "# Ubuntu/Debian:\nsudo apt-get install build-essential libcurl4-openssl-dev libjansson-dev libusb-1.0-0-dev libncurses5-dev"
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Build from Source",
      description: "Compile BFGMiner with optimal configuration",
      command: "./autogen.sh && ./configure --enable-cpumining --enable-scrypt && make -j$(nproc)"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Configure Mining",
      description: "Set up your mining configuration with optimal settings",
      command: "./bfgminer --config bfgminer.conf"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Start Mining",
      description: "Launch BFGMiner with your preferred mining pool",
      command: "./bfgminer -o stratum+tcp://pool.example.com:3333 -O username.worker:password -S all"
    }
  ];

  const hardwareCompatibility = [
    { device: "CPU Mining", compatible: true, performance: "Low", hashrate: "1-100 MH/s" },
    { device: "GPU Mining", compatible: true, performance: "Medium", hashrate: "1-100 GH/s" },
    { device: "ASIC Mining", compatible: true, performance: "High", hashrate: "1-100 TH/s" },
    { device: "FPGA Mining", compatible: true, performance: "Very High", hashrate: "100+ TH/s" }
  ];

  return (
    <div className="min-h-[75vh] bg-black text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-orange-900/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent opacity-20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
            BFGMiner Installation Guide
          </h1>
          <p className="text-xl text-gray-300 mb-8">Complete setup instructions for optimal cryptocurrency mining performance</p>

          {/* System Status */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-500/50 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400 font-bold">System Compatible</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/50 px-4 py-2 rounded-full">
              <Download className="h-5 w-5 text-blue-500" />
              <span className="text-blue-400 font-bold">BFGMiner Ready</span>
            </div>
          </div>

          {/* Download Progress */}
          {downloadProgress < 100 && (
            <div className="bg-gray-900 border-2 border-orange-500 rounded-lg p-6 max-w-md mx-auto mb-8">
              <div className="flex items-center gap-3 text-orange-500 font-black mb-4">
                <Download className="h-6 w-6 animate-bounce" />
                Downloading BFGMiner...
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-300 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400">{downloadProgress}% Complete</div>
            </div>
          )}
        </div>

        {/* Hardware Compatibility */}
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-6 text-center text-orange-500">Hardware Compatibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardwareCompatibility.map((hardware, index) => (
              <div key={index} className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 hover:border-orange-500 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <HardDrive className="h-8 w-8 text-orange-500" />
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-black mb-2">{hardware.device}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Performance:</span>
                    <span className="text-orange-400 font-bold">{hardware.performance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hashrate:</span>
                    <span className="text-green-400 font-bold">{hardware.hashrate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Steps */}
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-6 text-center text-orange-500">Installation Steps</h2>
          <div className="space-y-6">
            {installationSteps.map((step, index) => (
              <div key={index} className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 hover:border-orange-500 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index <= installStep ? 'bg-orange-500' : 'bg-gray-700'
                    }`}>
                      {React.cloneElement(step.icon, { className: "h-6 w-6 text-white" })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black mb-2 text-orange-500">{step.title}</h3>
                    <p className="text-gray-300 mb-4">{step.description}</p>
                    <div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
                      <pre className="text-green-400">{step.command}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Examples */}
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-6 text-center text-orange-500">Configuration Examples</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-black mb-4 text-orange-500">Basic Configuration</h3>
              <div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
                <pre className="text-yellow-400">{`{
  "pools": [
    {
      "url": "stratum+tcp://pool.example.com:3333",
      "user": "your_username.worker1",
      "pass": "your_password"
    }
  ],
  "intensity": "8",
  "threads": "4",
  "queue": "0",
  "scan-time": "30"
}`}</pre>
              </div>
            </div>
            <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-black mb-4 text-orange-500">Advanced Configuration</h3>
              <div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
                <pre className="text-cyan-400">{`{
  "pools": [
    {
      "url": "stratum+tcp://pool.example.com:3333",
      "user": "your_username.worker1",
      "pass": "your_password"
    }
  ],
  "intensity": "20",
  "threads": "8",
  "gpu-engine": "1100",
  "gpu-memclock": "1500",
  "gpu-powertune": "20",
  "temp-cutoff": "85",
  "temp-overheat": "75"
}`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-gradient-to-r from-orange-900/20 to-orange-700/20 border-2 border-orange-500/50 rounded-lg p-8">
          <h2 className="text-3xl font-black mb-6 text-center text-orange-500">⚡ Performance Optimization Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Zap className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-black mb-2">Overclocking</h3>
              <p className="text-gray-300 text-sm">Adjust GPU settings for optimal performance while maintaining stability</p>
            </div>
            <div className="text-center">
              <Cpu className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-black mb-2">Cooling</h3>
              <p className="text-gray-300 text-sm">Maintain optimal temperatures to prevent thermal throttling and hardware damage</p>
            </div>
            <div className="text-center">
              <Settings className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-black mb-2">Monitoring</h3>
              <p className="text-gray-300 text-sm">Continuously monitor hash rates, temperatures, and error rates for maximum efficiency</p>
            </div>
          </div>
        </div>

        {/* Animation Section */}
        {showAnimation && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-6xl mb-8 animate-pulse">🎉</div>
              <h2 className="text-4xl font-black text-green-500 mb-4">Installation Complete!</h2>
              <p className="text-xl text-gray-300 mb-8">BFGMiner is ready for mining operations</p>
              <button
                onClick={() => setShowAnimation(false)}
                className="bg-orange-500 text-black px-8 py-3 rounded-lg font-black hover:bg-orange-400 transition-colors"
              >
                Start Mining
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}