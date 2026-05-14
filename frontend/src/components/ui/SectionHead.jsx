export default function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
        {title}
      </h2>
      <p style={{ margin: 0, color: "#6B6B6B", fontSize: "0.9rem" }}>
        {sub}
      </p>
    </div>
  );
}