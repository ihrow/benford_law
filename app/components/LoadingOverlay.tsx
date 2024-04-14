import { ProgressSpinner } from "primereact/progressspinner";

export default function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
  return isLoading ? (
    <div
      className="flex align-items-center justify-content-center w-full h-full"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: "#121212",
      }}
    >
      <div className="flex flex-column align-items-center column-gap-2">
        <ProgressSpinner />
        <p className="text-primary-600 text-4xl text-bold">Loading...</p>
      </div>
    </div>
  ) : null;
}
