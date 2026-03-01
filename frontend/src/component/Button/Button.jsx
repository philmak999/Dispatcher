import "./Button.scss";

function Button({
  text,
  icon,
  onClick,
  variant = "default",
  type = "button",
  active = false,
}) {
  return (
    <button
      className={`btn ${active ? "btn--active" : ""}`}
      type={type}
      btn-type={variant}
      onClick={onClick}
    >
      {icon && <span className="btn__icon-wrapper">{icon}</span>}
      {text && <span className="btn__text">{text}</span>}
    </button>
  );
}

export default Button;
