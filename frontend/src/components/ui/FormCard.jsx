export default function FormCard({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #D8D4C8",
        padding: "1.2rem",
        borderRadius: 12,
        marginBottom: "1.2rem",
      }}
    >
      {title && (
        <h3 style={{ marginBottom: 12, fontSize: "1rem" }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}