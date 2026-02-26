"use client";

import type { Tag } from "@/lib/api";

type TagSelectProps = {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function TagSelect({
  tags,
  selectedIds,
  onChange,
  disabled,
  placeholder = "Select tags…",
}: TagSelectProps) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.length === 0 ? (
        <p className="text-sm text-stone-500">{placeholder}</p>
      ) : (
        tags.map((tag) => (
          <label
            key={tag.id}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
              selectedIds.includes(tag.id)
                ? "border-amber-400 bg-amber-50 text-amber-800"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            } ${disabled ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(tag.id)}
              onChange={() => toggle(tag.id)}
              className="sr-only"
              disabled={disabled}
            />
            {tag.name}
          </label>
        ))
      )}
    </div>
  );
}
