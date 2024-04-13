"use client";

import { PrimeReactProvider } from "primereact/api";
import App from "./pages/App";
import { Chart } from "chart.js";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined")
      import("chartjs-plugin-zoom").then((plugin) => {
        Chart.register(plugin.default);
      });
  }, []);
  return (
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  );
}
