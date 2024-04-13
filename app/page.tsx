"use client";

import { PrimeReactProvider } from "primereact/api";
import App from "./pages/App";
import { Chart } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
Chart.register(zoomPlugin);

export default function Home() {
  return (
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  );
}
