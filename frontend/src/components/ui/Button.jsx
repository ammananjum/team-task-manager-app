export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "#2B2B2B",
        color: "#fff",
        border: "none",
        padding: "0.65rem 1rem",
        borderRadius: 10,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}