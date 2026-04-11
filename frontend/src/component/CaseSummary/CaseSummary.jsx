import { useState } from "react";
import "./CaseSummary.scss";
import EditButton from "../EditButton/EditButton.jsx";
import alertIcon from "../../assets/icons/Alert.svg";

const toLines = (value) => {
  if (!value) return [];
  const lines = Array.isArray(value)
    ? value.map(String).filter(Boolean)
    : String(value).split(/\n/).map((s) => s.trim()).filter(Boolean);
  return lines;
};

function CaseSummary({ isFullWidth = false, onEditClick, onTranscriptClick, patientData, triageData }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const caseSummaryClassName = isFullWidth
    ? "case-summary case-summary--full"
    : "case-summary";

  const symptoms = toLines(patientData?.symptoms);
  const [firstSymptom, ...restSymptoms] = symptoms;
  const profileLines = toLines(patientData?.profile);
  const historyLines = toLines(patientData?.history);

  return (
    <section className={caseSummaryClassName}>
      <header
        className="case-summary__header"
        onClick={() => setIsCollapsed((v) => !v)}
      >
        <div className="case-summary__header-left">
          <svg
            className={`case-summary__chevron${isCollapsed ? " case-summary__chevron--collapsed" : ""}`}
            width="20" height="20" viewBox="0 0 20 20" fill="none"
            aria-hidden="true"
          >
            <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="case-summary__title">Case Summary</h2>
        </div>
        <EditButton onClick={(e) => { e.stopPropagation(); onEditClick(); }} />
      </header>

      <div className={`case-summary__body${isCollapsed ? " case-summary__body--collapsed" : ""}`}>
        <div className="case-summary__body-inner">
          <div className="case-summary__divider" />
          <div className="case-summary__content">
        <div className="case-summary__top-row">
          <section className="case-summary__info" aria-label="Case Information">
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">Call ID:</span>
              <span className="case-summary__info-value">
                {patientData?.callId ?? "911-2026-07821"}
              </span>
            </div>
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">Timestamp:</span>
              <span className="case-summary__info-value">
                {patientData?.timestamp ?? "10:14:32 AM - 10:16:31 AM"}
              </span>
            </div>
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">Location:</span>
              <span className="case-summary__info-value">
                {patientData?.location ?? "1458 Dundas St W, Toronto, ON"}
              </span>
            </div>
            <div className="case-summary__info-row">
              <span className="case-summary__info-label">
                Caller Relationship:
              </span>
              <span className="case-summary__info-value">
                {patientData?.relationship ?? "Spouse"}
              </span>
            </div>
          </section>

          <div className="case-summary__patient-row">
            <section className="case-summary__section">
              <h3 className="case-summary__heading">Patient</h3>
              <div className="case-summary__details">
                {profileLines.length > 0
                  ? profileLines.map((line, i) => <p key={i}>{line}</p>)
                  : <>
                      <p>Name: Gabriel Smith</p>
                      <p>Sex: Male</p>
                      <p>Age: 62</p>
                    </>}
              </div>
            </section>

            <div className="case-summary__section-divider" />

            <section className="case-summary__section">
              <h3 className="case-summary__heading">Background</h3>
              <div className="case-summary__details">
                {historyLines.length > 0
                  ? historyLines.map((line, i) => <p key={i}>{line}</p>)
                  : <>
                      <p>Conditions: Diabetes, hypertension</p>
                      <p>Notes: Previous cardiac concerns</p>
                    </>}
              </div>
            </section>
          </div>
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
            {triageData?.severity && (
              <span className={`case-summary__severity case-summary__severity--${triageData.severity.toLowerCase()}`}>
                {triageData.severity}
              </span>
            )}
          </div>
          {triageData?.recommendedUnit && (
            <p className="case-summary__unit">
              Recommended unit: <strong>{triageData.recommendedUnit}</strong>
            </p>
          )}
          <p className="case-summary__critical-lead">
            {triageData?.leadingSymptom ?? firstSymptom ?? "Severe chest pain with shortness of breath"}
          </p>
          {restSymptoms.length > 0 && (
            <ul className="case-summary__critical-list">
              {restSymptoms.map((symptom, i) => (
                <li key={i}>{symptom}</li>
              ))}
            </ul>
          )}
          {restSymptoms.length === 0 && !patientData && (
            <ul className="case-summary__critical-list">
              <li>Chest pain began approximately 20 minutes ago</li>
              <li>Pain described as "crushing" and radiating to left arm</li>
              <li>Shortness of breath</li>
              <li>Sweating</li>
              <li>Patient conscious but weak.</li>
            </ul>
          )}
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
        </div>
      </div>
    </section>
  );
}

export default CaseSummary;
