// Predefined colors for common categories
export const CATEGORY_COLORS = {
    Food: "#fb923c",          // Orange
    Travel: "#38bdf8",        // Sky blue
    Shopping: "#ec4899",      // Pink
    Bills: "#facc15",         // Yellow
    Groceries: "#4ade80",     // Green
    Entertainment: "#a78bfa", // Purple
    Healthcare: "#f472b6",    // Rose
    Salary: "#22c55e",        // Emerald
    Rent: "#f87171",          // Red
    Fuel: "#fb7185",          // Red-pink
    Education: "#60a5fa",     // Blue
    Gifts: "#f9a8d4",         // Light pink
    Investments: "#34d399",   // Greenish
    Other: "#94a3b8"          // Gray
  };
  
  // If category is custom → generate color based on name
  export function getCategoryColor(category) {
    if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  
    // Generate a pastel color based on hash
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 70%)`; // pastel unique per category
  }
  