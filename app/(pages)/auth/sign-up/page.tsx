"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { useAuthStore } from "@/store/auth";

export default function SignUpPage() {
  const router = useRouter();
  const setLogin = useAuthStore((state) => state.login);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(ApiRoutes.auth.register, {
        full_name: fullName,
        email,
        password,
      });

      // Assuming the response returns the user object and a token
      const userData = response.data;
      
      setLogin({
        isLoggedIn: true,
        user_uuid: userData.user_uuid || userData.uuid,
        account_uuid: userData.account_uuid,
        role: userData.role,
        full_name: userData.full_name,
        email: userData.email,
        access_token: userData.access_token || userData.token,
        expires_in: userData.expires_in,
        avatar: userData.avatar,
        account: userData.account,
        login: () => {},
        logout: () => {},
        updateUser: () => {}
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Could not create account. Please try again.");
      } else {
        setError("Could not create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">
          Create Platform
        </h1>
        <p className="text-stone-500 font-light">
          Start building your branded rental experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm font-light rounded-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors font-light text-stone-900 placeholder:text-stone-300"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors font-light text-stone-900 placeholder:text-stone-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors font-light text-stone-900"
              placeholder="Create a strong password"
              minLength={8}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-stone-900 text-stone-50 py-3.5 rounded-sm text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign Up
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-xs text-stone-400 font-light text-center mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <div className="mt-8 text-center text-sm text-stone-500 font-light">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="text-stone-900 font-medium hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
