import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Logger from "../utils/logger";

// Add mobile-specific styles
const authStyles = `
  /* Mobile-specific auth form styles */
  .auth-container {
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
  }

  .auth-form {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .auth-tabs {
    width: 100%;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .auth-button {
    width: 100%;
    min-height: 3rem;
    font-size: 1rem;
    font-weight: 900;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .auth-input {
    width: 100%;
    min-height: 2.75rem;
    font-size: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .auth-tab-trigger {
    min-height: 2.5rem;
    font-size: 0.875rem;
    font-weight: 900;
    padding: 0.5rem 1rem;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  @media (max-width: 768px) {
    .auth-container {
      padding: 0.75rem;
    }

    .auth-button {
      min-height: 2.75rem;
      font-size: 0.875rem;
      padding: 0.625rem 1.25rem;
    }

    .auth-input {
      min-height: 2.5rem;
      font-size: 0.875rem;
      padding: 0.625rem 0.875rem;
    }

    .auth-tab-trigger {
      min-height: 2.25rem;
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .auth-container {
      padding: 0.5rem;
    }

    .auth-form {
      max-width: 100%;
    }

    .auth-button {
      min-height: 2.5rem;
      font-size: 0.8125rem;
      padding: 0.5rem 1rem;
    }

    .auth-input {
      min-height: 2.25rem;
      font-size: 0.8125rem;
      padding: 0.5rem 0.75rem;
    }

    .auth-tab-trigger {
      min-height: 2rem;
      font-size: 0.6875rem;
      padding: 0.25rem 0.5rem;
    }
  }
`;

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameIn, setUsernameIn] = useState("");
  const [passwordIn, setPasswordIn] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login / Register - BRUTEOSAUR";
  }, []);

  const validUsername = (v) => v.length >= 3 && /^[a-zA-Z0-9_]+$/.test(v);
  const validPw = (v) => v.length >= 8 && /[0-9]/.test(v) && /[A-Za-z]/.test(v);

  const register = async () => {
    if (!validUsername(username)) return toast({ title: "Invalid username", description: "Username must be at least 3 characters and contain only letters, numbers, and underscores." });
    if (!validPw(password)) return toast({ title: "Weak password", description: "Use at least 8 chars with letters and numbers." });

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      Logger.info('Attempting to connect to backend:', BACKEND_URL);
      Logger.info('Registering user:', username);

      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        sessionStorage.setItem("authUsername", username);
        sessionStorage.setItem("auth", "1");
        sessionStorage.setItem("userId", data.id);
        toast({ title: "Registration successful", description: "Welcome to Bruteosaur!" });
        navigate("/connect-wallet");
      } else {
        const errorMsg = data.detail === "USERNAME_TAKEN" ? "Username already taken" : data.detail || "Registration failed";
        toast({ title: "Registration failed", description: errorMsg });
      }
    } catch (error) {
      Logger.error('Registration error:', error);
      toast({ title: "Connection error", description: "Please try again later." });
    }
  };

  const signIn = async () => {
    if (!usernameIn.trim()) return toast({ title: "Please enter username" });
    if (!passwordIn.trim()) return toast({ title: "Please enter password" });

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: usernameIn, password: passwordIn })
      });

      const data = await response.json();
      
      if (response.ok) {
        sessionStorage.setItem("authUsername", usernameIn);
        sessionStorage.setItem("auth", "1");
        sessionStorage.setItem("userId", data.id);
        toast({ title: "Welcome back!", description: "Successfully signed in." });
        navigate("/connect-wallet");
      } else {
        const errorMsg = data.detail === "INVALID_CREDENTIALS" ? "Invalid username or password" : data.detail || "Sign in failed";
        toast({ title: "Sign in failed", description: errorMsg });
      }
    } catch (error) {
      Logger.error('Sign in error:', error);
      toast({ title: "Connection error", description: "Please try again later." });
    }
  };

  return (
    <>
      <style>{authStyles}</style>
      <div className="min-h-screen bg-black text-white">
        <div className="auth-container">
          <h1 className="text-2xl md:text-3xl font-black mb-6 text-center">Create account or Sign in</h1>
          <Tabs defaultValue="register" className="auth-form auth-tabs bg-gray-900 border-4 border-gray-700 p-4 md:p-6">
            <TabsList className="grid grid-cols-2 bg-black w-full">
              <TabsTrigger value="register" className="auth-tab-trigger data-[state=active]:bg-orange-500 data-[state=active]:text-black">Register</TabsTrigger>
              <TabsTrigger value="signin" className="auth-tab-trigger data-[state=active]:bg-orange-500 data-[state=active]:text-black">Sign In</TabsTrigger>
            </TabsList>
            <TabsContent value="register" className="mt-6 space-y-3">
              <div>
                <label className="text-gray-300 font-bold text-sm">Username</label>
                <Input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="your_username" className="auth-input mt-2 bg-black border-gray-700 text-white"/>
                <p className="text-xs text-gray-500 mt-1">At least 3 characters, letters, numbers, and underscores only.</p>
              </div>
              <div>
                <label className="text-gray-300 font-bold text-sm">Password</label>
                <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" className="auth-input mt-2 bg-black border-gray-700 text-white"/>
                <p className="text-xs text-gray-500 mt-1">At least 8 characters, include letters and numbers.</p>
              </div>
              <Button onClick={register} className="auth-button bg-orange-500 text-black border-2 border-black font-black hover:bg-orange-400">Continue</Button>
            </TabsContent>
            <TabsContent value="signin" className="mt-6 space-y-3">
              <div>
                <label className="text-gray-300 font-bold text-sm">Username</label>
                <Input value={usernameIn} onChange={(e)=>setUsernameIn(e.target.value)} placeholder="your_username" className="auth-input mt-2 bg-black border-gray-700 text-white"/>
              </div>
              <div>
                <label className="text-gray-300 font-bold text-sm">Password</label>
                <Input type="password" value={passwordIn} onChange={(e)=>setPasswordIn(e.target.value)} placeholder="••••••••" className="auth-input mt-2 bg-black border-gray-700 text-white"/>
              </div>
              <Button onClick={signIn} className="auth-button bg-orange-500 text-black border-2 border-black font-black hover:bg-orange-400">Sign In</Button>
            </TabsContent>
          </Tabs>
          <p className="text-xs text-gray-600 mt-4 text-center">Secure onboarding. No simulation text shown.</p>
        </div>
      </div>
    </>
  );
}