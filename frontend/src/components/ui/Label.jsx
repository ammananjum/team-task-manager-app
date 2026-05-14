export default function Label({ children }) {
  return (
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#6B6B6B",
        display: "block",
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}