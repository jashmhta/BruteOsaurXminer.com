import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { X, QrCode } from "lucide-react";
import SignClient from "@walletconnect/sign-client";
import QRCodeUtil from "qrcode";
import Logger from "../utils/logger";

export default function WalletConnectQR({ onConnect, onCancel }) {
  const [uri, setUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const signClientRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initWalletConnect = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://172.206.32.165:8001";
        const configRes = await fetch(`${backendUrl}/api/wallet/wc/config`);
        const config = await configRes.json();
        
        if (!config.projectId) {
          throw new Error("WalletConnect project ID not configured");
        }

        const client = await SignClient.init({
          projectId: config.projectId,
          metadata: {
            name: "Bruteosaur Miners",
            description: "Cryptocurrency mining and wallet management platform",
            url: window.location.origin,
            icons: [`${window.location.origin}/assets/logo.jpg`]
          }
        });

        if (!mounted) return;
        signClientRef.current = client;

        const { uri: connectionUri, approval } = await client.connect({
          requiredNamespaces: {
            eip155: {
              methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
              chains: ["eip155:1"],
              events: ["chainChanged", "accountsChanged"]
            }
          }
        });

        if (!mounted) return;

        if (connectionUri) {
          setUri(connectionUri);
          const qrCode = await QRCodeUtil.toDataURL(connectionUri, {
            width: 300,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF"
            }
          });
          if (mounted) {
            setQrDataUrl(qrCode);
          }
        }

        const session = await approval();
        if (!mounted) return;

        sessionRef.current = session;
        setConnected(true);

        const accounts = session.namespaces?.eip155?.accounts || [];
        if (accounts.length === 0) {
          throw new Error("No accounts found in session");
        }

        const address = accounts[0].split(":")[2];

        let balance = "0";
        try {
          const balanceRes = await fetch(`https://cloudflare-eth.com`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_getBalance",
              params: [address, "latest"],
              id: 1
            })
          });
          const balanceData = await balanceRes.json();
          if (balanceData.result) {
            const balanceWei = BigInt(balanceData.result);
            balance = (Number(balanceWei) / 1e18).toFixed(6);
          }
        } catch (err) {
          Logger.error("Failed to fetch balance:", err);
        }

        const logRes = await fetch(`${backendUrl}/api/logs`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "wallet",
            action: "walletconnect",
            metadata: {
              address,
              chain: "ethereum",
              balance,
              session_topic: session.topic
            }
          })
        });

        if (!logRes.ok) {
          Logger.error("Failed to log WalletConnect session");
        }

        setTimeout(() => {
          if (mounted) {
            onConnect({
              address,
              balance,
              blockchain: "ethereum",
              chainId: 1,
              network: "Ethereum Mainnet",
              walletData: connectionUri,
              sessionTopic: session.topic
            });
          }
        }, 500);

      } catch (err) {
        Logger.error("WalletConnect error:", err);
        if (mounted) {
          setError(err.message || "Failed to initialize WalletConnect");
        }
      }
    };

    initWalletConnect();

    return () => {
      mounted = false;
      if (signClientRef.current && sessionRef.current) {
        signClientRef.current.disconnect({
          topic: sessionRef.current.topic,
          reason: { code: 6000, message: "User cancelled" }
        }).catch(Logger.error);
      }
    };
  }, [onConnect]);

  const handleCancel = () => {
    if (signClientRef.current && sessionRef.current) {
      signClientRef.current.disconnect({
        topic: sessionRef.current.topic,
        reason: { code: 6000, message: "User cancelled" }
      }).catch(Logger.error);
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-4 border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">WalletConnect</h2>
          <p className="text-gray-400 mb-6">
            {error ? "Connection failed" : connected ? "Connecting to your wallet..." : "Scan with your mobile wallet"}
          </p>

          {error ? (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg mb-6">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                {connected ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Connecting...</p>
                  </div>
                ) : qrDataUrl ? (
                  <img src={qrDataUrl} alt="WalletConnect QR Code" className="w-full h-full" />
                ) : (
                  <div className="animate-pulse text-gray-400">
                    <QrCode className="w-16 h-16 mx-auto" />
                    <p className="text-sm mt-2">Generating...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {uri && !error && (
            <div className="text-xs text-gray-500 mb-4 font-mono break-all">
              {uri.substring(0, 40)}...
            </div>
          )}

          {!error && (
            <div className="space-y-3 text-left text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-orange-400">1.</span>
                <span>Open your WalletConnect-compatible wallet</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400">2.</span>
                <span>Tap the scan QR code button</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400">3.</span>
                <span>Point your camera at this QR code</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full mt-6 bg-gray-800 hover:bg-gray-700 border-gray-600 text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
