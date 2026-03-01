import "./CaseSummary.scss";
import EditButton from "../EditButton/EditButton.jsx";
import alertIcon from "../../assets/icons/Alert.svg";

function CaseSummary({ isFullWidth = false, onEditClick, onTranscriptClick }) {
  const caseSummaryClassName = isFullWidth
    ? "case-summary case-summary--full"
    : "case-summary";
  return (
    <section className={caseSummaryClassName}>
      <header className="case-summary__header">
        <h2 className="case-summary__title">Case Summary</h2>
        <EditButton onClick={onEditClick} />
      </header>
      <div className="case-summary__divider" />

      <div className="case-summary__content">
        <div className="case-summary__top-row">
          <section className="case-summary__info" aria-label="Case Information">
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">Call ID:</span>
              <span className="case-summary__info-value">911-2026-07821</span>
            </div>
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">Timestamp:</span>
              <span className="case-summary__info-value">
                10:14:32 AM - 10:16:31 AM
              </span>
            </div>
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">Location:</span>
              <span className="case-summary__info-value">
                1458 Dundas St W, Toronto, ON
              </span>
            </div>
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">
                Caller Relationship:
              </span>
              <span className="case-summary__info-value">Spouse</span>
            </div>
          </section>

          <section className="case-summary__section">
            <h3 className="case-summary__heading">GABRIEL SMITH</h3>
            <div className="case-summary__details">
              <p>Male, 62</p>
              <p>Cardiac risk factors (diabetes, hypertension)</p>
            </div>
          </section>

          <section className="case-summary__section">
            <h3 className="case-summary__heading">MEDICAL HISTORY</h3>
            <div className="case-summary__details">
              <p>Diabetes, Hypertension</p>
              <p>Previous cardiac concerns</p>
            </div>
          </section>
        </div>

        <section className="case-summary__critical">
          <div className="case-summary__critical-header">
            <img
              className="case-summary__alert-icon"
              src={alertIcon}
              alt=""
              aria-hidden="true"
            />
            <span>CRITICAL SYMPTOMS</span>
          </div>
          <p className="case-summary__critical-lead">
            Severe chest pain with shortness of breath
          </p>
          <ul className="case-summary__critical-list">
            <li>Chest pain began approximately 20 minutes ago</li>
            <li>Pain described as "crushing" and radiating to left arm</li>
            <li>Shortness of breath</li>
            <li>Sweating</li>
            <li>Patient conscious but weak.</li>
          </ul>
        </section>

        <div className="case-summary__actions">
          <button
            className="case-summary__action"
            type="button"
            onClick={onTranscriptClick}
          >
            View 911 Transcript
          </button>
          <button
            className="case-summary__action case-summary__action--disabled"
            type="button"
            disabled
          >
            EMS Intake Unavailable
          </button>
        </div>
      </div>
    </section>
  );
}

export default CaseSummary;
