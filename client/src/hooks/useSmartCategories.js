import { useState, useEffect } from "react";
import { CATEGORY_ICONS } from "../data/categoryList";

export function useSmartCategories() {
  const [categories, setCategories] = useState([]);

  // Load user categories from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userCategories") || "[]");
    const base = Object.keys(CATEGORY_ICONS);

    // merge base + saved custom categories
    const combined = Array.from(new Set([...base, ...saved]));
    setCategories(combined);
  }, []);

  const addCategory = (newCat) => {
    const normalized = newCat.trim();
    if (!normalized) return;

    setCategories((prev) => {
      if (prev.includes(normalized)) return prev;

      const updated = [...prev, normalized];
      localStorage.setItem("userCategories", JSON.stringify(updated));
      return updated;
    });
  };

  return { categories, addCategory, icons: CATEGORY_ICONS };
}
