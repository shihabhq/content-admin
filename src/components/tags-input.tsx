"use client";

import { inputClass } from "@/lib/admin-input";

type TagsInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

/** Comma-separated tags input; used for video/artwork recommendation tags. */
export function TagsInput({
  value,
  onChange,
  placeholder = "e.g. tutorial, nature, 2024",
  disabled,
  id,
}: TagsInputProps) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={inputClass}
    />
  );
}
