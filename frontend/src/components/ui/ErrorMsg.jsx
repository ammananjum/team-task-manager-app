export default function ErrorMsg({ msg }) {
  if (!msg) return null;

  return (
    <p style={{ color: "#C0392B", fontSize: "0.85rem" }}>
      {msg}
    </p>
  );
}