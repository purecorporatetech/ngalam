import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

interface InlineEditCellProps {
  value: number;
  onSave: (value: number) => void;
  type?: "price" | "stock";
}

const InlineEditCell = ({ value, onSave, type = "stock" }: InlineEditCellProps) => {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const parsed = type === "price" ? parseFloat(localValue) : parseInt(localValue);
    if (!isNaN(parsed) && parsed !== value) {
      onSave(parsed);
    } else {
      setLocalValue(String(value));
    }
    setEditing(false);
  };

  if (!editing) {
    const stockClass =
      type === "stock" && value === 0
        ? "text-destructive font-bold"
        : type === "stock" && value > 0 && value < 5
          ? "text-orange-500 font-semibold"
          : "";

    return (
      <span
        className={`cursor-pointer hover:bg-muted px-2 py-1 rounded transition-colors ${stockClass}`}
        onClick={() => setEditing(true)}
        title="Cliquer pour modifier"
      >
        {type === "price" ? `${value} €` : value}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        type="number"
        step={type === "price" ? "0.01" : "1"}
        min="0"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="h-8 w-20"
      />
      <button onClick={save} className="text-primary hover:text-primary/80">
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
};

export default InlineEditCell;
