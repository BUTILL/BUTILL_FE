import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.butill.app",
  appName: "버틸",
  webDir: "dist",
  server: { androidScheme: "https", cleartext: false },
};

export default config;
