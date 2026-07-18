import type { Config } from "tailwindcss";
// Vercel Best Practice: Use a direct relative import for configs to avoid export map resolution failures
import sharedConfig from "../../packages/ui/tailwind.config";

const config: Config = {
  content: [
    // Scans local app files
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    // CRITICAL: Scans the UI package so Tailwind generates classes used in shared components
    "../../packages/ui/src/**/*.{ts,tsx}", 
  ],
  // Injects your brand variables from the UI package
  presets: [sharedConfig], 
};

export default config;