export type Congress = {
  /** ISO date: YYYY-MM-DD */
  date: string;
  title: string;
  location?: string;
  role?: string; // speaker, chair, etc.
  who?: string[]; // names
  link?: string;  // optional external link
};

export const congresses: Congress[] = [
  // Add entries here. They will be shown in reverse-chronological order.
  // Example:
  // {
  //   date: "2026-04-24",
  //   title: "ADE • Medicina iperbarica e ambienti estremi",
  //   location: "Varese, Italy",
  //   role: "Speaker",
  //   who: ["Silvio Zerbi", "Luigi Tarsia"],
  //   link: "https://example.com",
  // },
];
