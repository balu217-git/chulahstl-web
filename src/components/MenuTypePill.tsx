"use client";

interface MenuTypePillProps {
  menuType?: string | string[] | null;
}

export function MenuTypePill({ menuType }: MenuTypePillProps) {
  // Normalize to string
  const typeString = Array.isArray(menuType)
    ? menuType[0] ?? ""
    : menuType ?? "";

  if (!typeString) return null;

  const normalized = typeString.toLowerCase().trim();

  // Default values
  let label: string | null = "";
  let bgColor = "";
  let size = 0;
  let extraStyles: React.CSSProperties = {};
  let tooltip = ""; // <-- added

  // VEG
  if (normalized === "veg") {
    bgColor = "green";
    label = null;
    size = 0;
    tooltip = "Veg";
  }

  // NON-VEG
  else if (normalized === "non-veg" || normalized === "nonveg") {
    bgColor = "red";
    label = null;
    size = 0;
    tooltip = "Non-Veg";
  }

  // VEGAN
  else if (normalized === "vegan") {
    bgColor = "green";
    label = "V";

    size = 17;

    tooltip = "Vegan"; // <-- tooltip

    extraStyles = {
      fontSize: "0.55rem",
      fontWeight: 500,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };
  }

  return (
    <span
      className="position-absolute"
      title={tooltip}     // <-- ONLY ADDITION
      style={{
        bottom: 8,
        right: 8,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: "#fff",
        display: "block",
        textAlign: "center",
        cursor: "help",   // optional cursor style
        ...extraStyles,
      }}
    >
      {label}
    </span>
  );
}
