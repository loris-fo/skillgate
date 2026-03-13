import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@skillgate/audit-engine", "@skillgate/shared"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
