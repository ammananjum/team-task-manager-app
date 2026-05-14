export default function Textarea(props) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "0.6rem 0.8rem",
        borderRadius: 8,
        border: "1px solid #D8D4C8",
        outline: "none",
        fontSize: "0.9rem",
        resize: "vertical",
        ...props.style,
      }}
    />
  );
}