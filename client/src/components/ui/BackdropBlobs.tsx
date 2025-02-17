export default function BackdropBlobs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute -top-10 left-10 w-72 h-72 bg-red-400 rounded-full blur-3xl opacity-15"></div>
    </div>
  );
}
