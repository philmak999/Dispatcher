import "./HospitalRouting.scss";
import EditButton from "../EditButton/EditButton.jsx";

const HospitalRouting = ({ isCollapsed, onToggle }) => {
  return (
    <div className="hospital__container" onClick={onToggle}>
      <div className="hospital__header-left">
        <svg
          className={`hospital__chevron${isCollapsed ? " hospital__chevron--collapsed" : ""}`}
          width="20" height="20" viewBox="0 0 20 20" fill="none"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="hospital__title">Hospital Routing</h1>
      </div>
      <EditButton text="Add Another Hospital" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};
export default HospitalRouting;
