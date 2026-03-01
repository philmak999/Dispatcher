import React from "react";
import Button from "../Button/Button.jsx";
import "./Transcript.scss";

const Transcript = ({ onClose }) => {
  return (
    <div className="transcript__modal">
      <div className="transcript">
        <div className="transcript__header">
          <h2 className="transcript__title">Call Transcript</h2>
          <Button text="Close" onClick={onClose} variant="save" />
        </div>

        <div className="transcript__content">
          <div className="transcript__meta">
            <p>
              <strong>Call ID:</strong> 911-2026-07821
            </p>
            <p>
              <strong>Timestamp:</strong> 10:14:32 AM - 10:16:31 AM
            </p>
          </div>

          <p>
            <strong>Operator:</strong> 911, what is your emergency?
          </p>
          <p>
            <strong>Caller:</strong> My husband is having really bad chest pain.
            I think something’s wrong with his heart.
          </p>
          <p>
            <strong>Operator:</strong> What is your address?
          </p>
          <p>
            <strong>Caller:</strong> 1458 Dundas Street West, apartment 304.
          </p>
          <p>
            <strong>Operator:</strong> Thank you. What is your husband’s name?
          </p>
          <p>
            <strong>Caller:</strong> Gabriel Smith.
          </p>
          <p>
            <strong>Operator:</strong> How old is Gabriel?
          </p>
          <p>
            <strong>Caller:</strong> He’s 62.
          </p>
          <p>
            <strong>Operator:</strong> Tell me exactly what’s happening.
          </p>
          <p>
            <strong>Caller:</strong> He started having chest pain about twenty
            minutes ago. He says it feels like an elephant is sitting on his
            chest.
          </p>
          <p>
            <strong>Operator:</strong> Is he awake?
          </p>
          <p>
            <strong>Caller:</strong> Yes, but he looks very weak.
          </p>
          <p>
            <strong>Operator:</strong> Is he breathing?
          </p>
          <p>
            <strong>Caller:</strong> Yes, but he’s short of breath.
          </p>
          <p>
            <strong>Operator:</strong> Is the pain going anywhere else?
          </p>
          <p>
            <strong>Caller:</strong> Yes, he says it’s going down his left arm.
          </p>
          <p>
            <strong>Operator:</strong> Is he sweating?
          </p>
          <p>
            <strong>Caller:</strong> Yes, a lot. His shirt is soaked.
          </p>
          <p>
            <strong>Operator:</strong> Does he have any medical conditions?
          </p>
          <p>
            <strong>Caller:</strong> He has high blood pressure and diabetes.
          </p>
          <p>
            <strong>Operator:</strong> Does he take medication for those?
          </p>
          <p>
            <strong>Caller:</strong> Yes, blood pressure medication. I’m not
            sure what it’s called.
          </p>
          <p>
            <strong>Operator:</strong> Stay on the line with me. Help is on the
            way. Do not let him walk. Have him sit or lie down. If he becomes
            unconscious or stops breathing, tell me immediately.
          </p>
          <p>
            <strong>Caller:</strong> Okay. Please hurry.
          </p>
          <p>
            <strong>Operator:</strong> The ambulance is on its way. I’m staying
            with you.
          </p>
        </div>

        <div className="transcript__footer">
          <Button text="Close Transcript" onClick={onClose} variant="save" />
        </div>
      </div>
    </div>
  );
};

export default Transcript;
