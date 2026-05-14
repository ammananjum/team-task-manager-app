export default function BtnCharcoal({
  children,
  style = {},
  ...props
}) {
  return (
    <button
      {...props}
      style={{
        background: "#2D2D2D",
        color: "#F6F1E6",
        border: "none",
        borderRadius: 10,
        padding: "0.75rem 1rem",
        fontSize: "0.85rem",
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.45rem",
        transition: "0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}