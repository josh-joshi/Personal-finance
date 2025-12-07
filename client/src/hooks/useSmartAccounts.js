import { useEffect, useState } from "react";

// Random pastel color generator
function generatePastelColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

// Default accounts (option B set)
const defaultAccounts = {
  Cash: "💵",
  "Bank Account": "🏦",
  "Credit Card": "💳",
  "UPI / Wallet": "📱",
  Savings: "💰",
  Investments: "📈",
};

export function useSmartAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [accountIcons, setAccountIcons] = useState({});
  const [accountColors, setAccountColors] = useState({});

  // Load from localStorage on first render
  useEffect(() => {
    const storedAccounts =
      JSON.parse(localStorage.getItem("smartAccounts")) || [];
    const storedIcons =
      JSON.parse(localStorage.getItem("smartAccountIcons")) || {};
    const storedColors =
      JSON.parse(localStorage.getItem("smartAccountColors")) || {};

    if (storedAccounts.length === 0) {
      const defaults = Object.keys(defaultAccounts);
      setAccounts(defaults);
      setAccountIcons(defaultAccounts);

      const newColors = {};
      defaults.forEach((acc) => {
        newColors[acc] = generatePastelColor();
      });
      setAccountColors(newColors);

      localStorage.setItem(
        "smartAccountColors",
        JSON.stringify(newColors)
      );
      localStorage.setItem("smartAccounts", JSON.stringify(defaults));
      localStorage.setItem(
        "smartAccountIcons",
        JSON.stringify(defaultAccounts)
      );
      return;
    }

    setAccounts(storedAccounts);
    setAccountIcons(storedIcons);
    setAccountColors(storedColors);
  }, []);

  // Add a new account dynamically
  const addAccount = (name) => {
    if (!name || name.trim() === "") return;

    const clean = name.trim();

    if (accounts.includes(clean)) return;

    const updated = [...accounts, clean];
    setAccounts(updated);
    localStorage.setItem("smartAccounts", JSON.stringify(updated));

    const newIcons = {
      ...accountIcons,
      [clean]: "➕",
    };
    setAccountIcons(newIcons);
    localStorage.setItem(
      "smartAccountIcons",
      JSON.stringify(newIcons)
    );

    const newColors = {
      ...accountColors,
      [clean]: generatePastelColor(),
    };
    setAccountColors(newColors);
    localStorage.setItem(
      "smartAccountColors",
      JSON.stringify(newColors)
    );
  };

  return { accounts, accountIcons, accountColors, addAccount };
}
