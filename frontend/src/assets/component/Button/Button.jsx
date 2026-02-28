import './Button.scss'

function Button({
  text,
  onClick,
  variant = "default",
  icon,
  type = "button",
  initialBackgroundColor,
  initialColor,
  active = false,
}) {
  const buttonStyle = {
    color: initialColor || "#232940",
    backgroundColor: active ? "#13182C" : (initialBackgroundColor || "transparent"),
    border:
      initialBackgroundColor === "#FFFFFF"
        ? "1px solid #BDC5D5"
        : "none",
  };
  
  return (
    <button
      type={type}
      button-variant={variant}   
      onClick={onClick}
      style={buttonStyle}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {text && <span className="button-text">{text}</span>}
    </button>
  );
}

export default Button;