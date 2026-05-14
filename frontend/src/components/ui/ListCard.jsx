export default function ListCard({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #D8D4C8",
        borderRadius: 14,
        padding: "1rem 1.1rem",
        boxShadow: "0 1px 6px rgba(45,45,45,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}