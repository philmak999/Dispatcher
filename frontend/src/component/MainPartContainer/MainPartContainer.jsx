import "./MainPartContainer.scss";
import CaseSummary from "../CaseSummary/CaseSummary";

function MainPartContainer({ isMenuOpen, onEditClick, onTranscriptClick }) {
  const containerClassName = isMenuOpen
    ? "main-part main-part--menu-open"
    : "main-part";

  return (
    <div className={containerClassName}>
      <CaseSummary
        isFullWidth={isMenuOpen}
        onEditClick={onEditClick}
        onTranscriptClick={onTranscriptClick}
      />
    </div>
  );
}

export default MainPartContainer;
