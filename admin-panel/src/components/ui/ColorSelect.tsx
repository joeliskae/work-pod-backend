import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const colors = [
  {
    value: "gray",
    label: "Harmaa",
    colorClass: "text-gray-500",
    bgClass: "bg-gray-500",
  },
  {
    value: "red",
    label: "Punainen",
    colorClass: "text-red-500",
    bgClass: "bg-red-500",
  },
  {
    value: "orange",
    label: "Oranssi",
    colorClass: "text-orange-500",
    bgClass: "bg-orange-500",
  },
  {
    value: "amber",
    label: "Meripihka",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500",
  },
  {
    value: "yellow",
    label: "Keltainen",
    colorClass: "text-yellow-500",
    bgClass: "bg-yellow-500",
  },
  {
    value: "lime",
    label: "Limen vihreä",
    colorClass: "text-lime-500",
    bgClass: "bg-lime-500",
  },
  {
    value: "green",
    label: "Vihreä",
    colorClass: "text-green-500",
    bgClass: "bg-green-500",
  },
  {
    value: "emerald",
    label: "Smaragdi",
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500",
  },
  {
    value: "cyan",
    label: "Syaani",
    colorClass: "text-cyan-500",
    bgClass: "bg-cyan-500",
  },
  {
    value: "blue",
    label: "Sininen",
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500",
  },
  {
    value: "violet",
    label: "Violetti",
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500",
  },
  {
    value: "purple",
    label: "Purppura",
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500",
  },
  {
    value: "pink",
    label: "Pinkki",
    colorClass: "text-pink-500",
    bgClass: "bg-pink-500",
  },
  {
    value: "rose",
    label: "Ruusu",
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500",
  },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const ColorSelect: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = colors.find((c) => c.value === value);

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-left bg-white shadow-sm flex justify-between items-center"
      >
        <div className="flex items-center space-x-2 min-w-0">
          {selected && (
            <span className={`w-4 h-4 rounded-full flex-shrink-0 ${selected.bgClass}`} />
          )}
          <span className={`${selected?.colorClass} truncate`}>
            {selected?.label || "Valitse väri"}
          </span>
        </div>
        <svg
          className="w-4 h-4 ml-2 text-gray-500 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg overflow-auto max-h-60 w-full min-w-max"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onChange(color.value);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
              >
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color.bgClass}`} />
                <span className={`${color.colorClass}`}>{color.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};