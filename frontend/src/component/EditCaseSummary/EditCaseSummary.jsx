import React, { useState } from "react";
import Button from "../Button/Button.jsx";
import "./EditCaseSummary.scss";

const initialData = {
  callId: "911-2026-07821",
  timestamp: "10:14:32 AM - 10:16:31 AM",
  name: "Gabriel Smith",
  location: "1458 Dundas St W, Toronto, ON",
  relationship: "Spouse",
  profile: "Male, 62\nCardiac risk factors (diabetes, hypertension)",
  history: "Diabetes, Hypertension \nPrevious cardiac concerns",
  symptoms:
    '**Severe chest pain with shortness of breath** \nChest pain began approximately 20 minutes ago \nPain described as "crushing" and radiating to left arm \nShortness of breath \nSweating \nPatient conscious but weak.',
};

const EditCaseSummary = ({ onClose }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  return (
    <div className="edit-summary__modal">
      <div className="edit-summary">
        <div className="edit-summary__header">
          <h2 className="edit-summary__title">Case Summary</h2>
          <button className="edit-summary__close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="edit-summary__info">
          <div>
            <strong>Call ID:</strong> {formData.callId}
          </div>
          <div>
            <strong>Timestamp:</strong> {formData.timestamp}
          </div>
        </div>

        <div className="edit-summary__columns">
          <div className="edit-summary__column">
            <div className="edit-summary__form-group">
              <label>NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="edit-summary__form-group">
              <label>LOCATION</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="edit-summary__form-group">
              <label>CALLER RELATIONSHIP</label>
              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="edit-summary__column">
            <div className="edit-summary__form-group">
              <label>PROFILE</label>
              <textarea
                rows="3"
                name="profile"
                value={formData.profile}
                onChange={handleChange}
              />
            </div>

            <div className="edit-summary__form-group">
              <label>MEDICAL HISTORY</label>
              <textarea
                rows="3"
                name="history"
                value={formData.history}
                onChange={handleChange}
              />
            </div>

            <div className="edit-summary__form-group">
              <label>CRITICAL SYMPTOMS</label>
              <textarea
                defaultValue="Severe headache, dizziness."
                rows="6"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="edit-summary__footer">
          <Button text="Cancel" onClick={onClose} variant="cancel" />
          <Button text="Save" onClick={onClose} variant="save" />
        </div>
      </div>
    </div>
  );
};

export default EditCaseSummary;
