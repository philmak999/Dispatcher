import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import CaseSummary from "./component/CaseSummary/CaseSummary.jsx";
import EditCaseSummary from "./component/EditCaseSummary/EditCaseSummary.jsx";
import HamburgerMenu from "./component/HamburgerMenu/HamburgerMenu.jsx";
import PageHeader from "./component/PageHeader/PageHeader.jsx";
import MainPartContainer from "./component/MainPartContainer/MainPartContainer.jsx";
import HospitalRouting from "./component/HospitalRouting/HospitalRouting.jsx";
import Transcript from "./component/Transcript/Transcript.jsx";
import AmbulanceDispatched from "./component/AmbulanceDispatched/AmbulanceDispatched.jsx";
import EmergencyCall from "./component/EmergencyCall/EmergencyCall.jsx";

import "./App.css";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };
  const handleEditToggle = () => setIsEditOpen((prev) => !prev);
  const handleTranscriptToggle = () => setIsTranscriptOpen((prev) => !prev);

  const navigate = useNavigate();
  return (
    <>
      <PageHeader onMenuToggle={handleMenuToggle} />
      <HamburgerMenu isOpen={isMenuOpen} />
      {/* <button
        onClick={() => navigate("/dispatched")}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 9999,
          padding: "16px 24px",
          backgroundColor: "#E17100",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        test an emergency button
      </button> */}
      <Routes>
        <Route
          path="/"
          element={
            <MainPartContainer
              isMenuOpen={isMenuOpen}
              onEditClick={handleEditToggle}
              onTranscriptClick={handleTranscriptToggle}
            />
          }
        />
        <Route path="/dispatched" element={<AmbulanceDispatched />} />
        <Route path="/emergency" element={<EmergencyCall />} />
      </Routes>

      {isEditOpen && <EditCaseSummary onClose={handleEditToggle} />}
      {isTranscriptOpen && <Transcript onClose={handleTranscriptToggle} />}
    </>
  );
}

export default App;
