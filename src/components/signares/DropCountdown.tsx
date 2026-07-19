import { computeCountdown } from "@/lib/signares";

interface DropCountdownProps {
  closesAt: string;
  now: number;
}

const Cell = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-foreground tabular-nums leading-none">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary-foreground/60 mt-2">
      {label}
    </span>
  </div>
);

// Compte à rebours temps réel. `now` est piloté par la page (setInterval 1s),
// pour que la fermeture bascule tout l'état au bon instant.
const DropCountdown = ({ closesAt, now }: DropCountdownProps) => {
  const { days, hours, minutes, seconds, done } = computeCountdown(closesAt, now);

  if (done) {
    return (
      <p className="font-serif text-xl sm:text-2xl text-primary-foreground/90 uppercase tracking-[0.15em]">
        Cette Signare s'est refermée.
      </p>
    );
  }

  return (
    <div>
      <span className="block text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary-foreground/60 mb-4 text-center">
        Se referme dans
      </span>
      <div className="flex items-start justify-center gap-4 sm:gap-6">
        <Cell value={days} label="Jours" />
        <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-foreground/40 leading-none">:</span>
        <Cell value={hours} label="Heures" />
        <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-foreground/40 leading-none">:</span>
        <Cell value={minutes} label="Min" />
        <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-foreground/40 leading-none">:</span>
        <Cell value={seconds} label="Sec" />
      </div>
    </div>
  );
};

export default DropCountdown;
