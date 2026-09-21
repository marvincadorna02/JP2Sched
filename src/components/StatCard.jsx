export default function StatCard({ label, value, accent = "royal" }) {
  const accents = {
    royal: "text-royal",
    gold: "text-gold",
    navy: "text-navy",
  };
  return (
    <div className="bg-paper rounded-2xl shadow-card px-5 py-4 flex-1 min-w-[140px]">
      <p className="text-sm font-medium text-navy/75 mb-1">{label}</p>
      <p className={`font-display text-2xl font-semibold ${accents[accent]}`}>{value}</p>
    </div>
  );
}
