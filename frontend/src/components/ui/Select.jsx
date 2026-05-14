export default function Select(props) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "0.6rem 0.8rem",
        borderRadius: 8,
        border: "1px solid #D8D4C8",
        fontSize: "0.9rem",
        outline: "none",
        background: "#fff",
        ...props.style,
      }}
    />
  );
}