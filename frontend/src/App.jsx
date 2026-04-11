import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import CaseSummary from "./component/CaseSummary/CaseSummary.jsx";
import CaseSummarySecond from "./component/CaseSummarySecond/CaseSummarySecond.jsx";
import EditCaseSummary from "./component/EditCaseSummary/EditCaseSummary.jsx";
import HamburgerMenu from "./component/HamburgerMenu/HamburgerMenu.jsx";
import PageHeader from "./component/PageHeader/PageHeader.jsx";
import MainPageNav from "./component/MainPageNav/MainPageNav.jsx";
import HospitalRouting from "./component/HospitalRouting/HospitalRouting.jsx";
import HospitalsList from "./component/HospitalsList/HospitalsList.jsx";
import Map from "./component/Map/Map.jsx";
import DispatchButton from "./component/DispatchButton/DispatchButton.jsx";
import PageFooter from "./component/PageFooter/PageFooter.jsx";
import Transcript from "./component/Transcript/Transcript.jsx";
import AmbulanceDispatched from "./component/AmbulanceDispatched/AmbulanceDispatched.jsx";
import EmergencyCall from "./component/EmergencyCall/EmergencyCall.jsx";
import "./App.scss";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [selectedHospitalIndex, setSelectedHospitalIndex] = useState(null);
  const [editedPatientData, setEditedPatientData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHospitalSectionOpen, setIsHospitalSectionOpen] = useState(true);

  const patientsByRoute = {
    "/": {
      callId: "911-2026-07821",
      timestamp: "10:14:32 AM - 10:16:31 AM",
      name: "Gabriel Smith",
      location: "1458 Dundas St W, Toronto, ON",
      relationship: "Spouse",
      profile: "Name: Gabriel Smith\nSex: Male\nAge: 62",
      history: "Medical Emergency: Cardiac event - Chest pain\nConditions: Diabetes, Hypertension\nNotes: Previous cardiac concerns",
      symptoms:
        'Severe chest pain with shortness of breath \nChest pain began approximately 20 minutes ago \nPain described as "crushing" and radiating to left arm \nShortness of breath \nSweating \nPatient conscious but weak.',
    },
    "/case-summary-2": {
      callId: "911-2026-09107",
      timestamp: "2:43:11 PM - 2:46:02 PM",
      name: "Elena Park",
      location: "88 Bloor St E, Toronto, ON",
      relationship: "Bystander",
      profile: "Name: Elena Park\nSex: Female\nAge: 29",
      history: "Medical Emergency: Respiratory distress - Asthma attack\nConditions: Asthma (moderate)\nNotes: No known allergies",
      symptoms:
        "Severe shortness of breath and wheezing \nRapid breathing and audible wheeze \nUnable to speak full sentences \nChest tightness reported \nRescue inhaler used with minimal relief \nPatient anxious but responsive.",
    },
  };

  const hospitals = [
    {
      HospitalName: "Toronto Western Hospital",
      Recommendscore: "90%",
      HospitalNameDistance: "2",
      DriveTime: "5",
      HospitalInfo: "Best cardiac cath lab match",
      HospitalDetails: "Closest major hospital with full cardiac care and catheterization lab. Best option for suspected cardiac events requiring rapid intervention.",
      AiRecommend: true,
      lat: 43.6535,
      lng: -79.4059,
    },
    {
      HospitalName: "St. Michael's Hospital",
      Recommendscore: "78%",
      HospitalNameDistance: "5",
      DriveTime: "12",
      HospitalInfo: "Cardiac surgery, farther distance",
      HospitalDetails: "Advanced cardiac surgery unit and Level 1 trauma centre. Slightly farther than Toronto Western but strong cardiac capabilities.",
      AiRecommend: false,
      lat: 43.6531,
      lng: -79.3771,
    },
    {
      HospitalName: "Sunnybrook Health Sciences Centre",
      Recommendscore: "55%",
      HospitalNameDistance: "13",
      DriveTime: "22",
      HospitalInfo: "Too far for cardiac event",
      HospitalDetails: "Regional trauma and cardiac centre with strong capabilities, but 13 km away adds significant response time for a time-sensitive cardiac emergency.",
      AiRecommend: false,
      lat: 43.7228,
      lng: -79.3749,
    },
  ];

  // Hospitals without lat/lng for sending to backend
  const baseHospitals = hospitals.map(({ lat: _lat, lng: _lng, ...rest }) => rest);

  // Merge AI-scored hospitals back with static lat/lng coordinates, then sort by score descending
  const mergeWithHospitals = (scored) => {
    const merged = hospitals.map((h) => {
      const match = scored?.find((s) => s.HospitalName === h.HospitalName);
      return match ? { ...h, ...match } : h;
    });
    return merged.sort((a, b) => (parseFloat(b.Recommendscore) || 0) - (parseFloat(a.Recommendscore) || 0));
  };

  const displayHospitals = location?.state?.scoredHospitals
    ? mergeWithHospitals(location.state.scoredHospitals)
    : hospitals;

  // Current patient data: edited overrides first, then live call data, then static fallback
  const currentPatientData =
    editedPatientData ??
    location.state?.patientData ??
    patientsByRoute[location.pathname] ??
    patientsByRoute["/"];

  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);
  const handleEditToggle = () => setIsEditOpen((prev) => !prev);
  const handleTranscriptToggle = () => setIsTranscriptOpen((prev) => !prev);
  const handleDispatch = () => navigate("/dispatched");
  const handleSave = (data) => setEditedPatientData(data);
  const handleDarkModeToggle = () => setIsDarkMode((prev) => !prev);

  const containerClassName = isMenuOpen
    ? "main-part main-part--menu-open"
    : "main-part";
  const selectedHospital = displayHospitals[selectedHospitalIndex] ?? null;

  useEffect(() => {
    if (location.pathname === "/dispatched" || location.pathname === "/emergency") {
      setIsMenuOpen(false);
    }
    if (location.pathname === "/" && location.state?.patientData) {
      setSelectedHospitalIndex(null);
    }
    setEditedPatientData(null);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <>
      <PageHeader onMenuToggle={handleMenuToggle} />
      <HamburgerMenu isOpen={isMenuOpen} isDarkMode={isDarkMode} onDarkModeToggle={handleDarkModeToggle} />
      <Routes>
        <Route
          path="/"
          element={
            <div className={containerClassName}>
              <MainPageNav />
              <div className="main-layout">
                <div className="main-layout__left">
                  <CaseSummary
                    isFullWidth={isMenuOpen}
                    onEditClick={handleEditToggle}
                    onTranscriptClick={handleTranscriptToggle}
                    patientData={currentPatientData}
                    triageData={location.state?.triageData ?? null}
                  />
                </div>
                <div className="main-layout__right">
                  <HospitalRouting
                    isCollapsed={!isHospitalSectionOpen}
                    onToggle={() => setIsHospitalSectionOpen((v) => !v)}
                  />
                <div className={`main-layout__hospital-body${isHospitalSectionOpen ? "" : " main-layout__hospital-body--collapsed"}`}>
                  <div className="main-layout__hospital-body-inner">
                    <div className="main-layout__right-row">
                      <HospitalsList
                        hospitals={displayHospitals}
                        selectedIndex={selectedHospitalIndex}
                        onSelect={setSelectedHospitalIndex}
                      />
                      <div className="main-layout__map-stack">
                        <Map
                          hospital={selectedHospital}
                          patientLocation={currentPatientData?.location}
                        />
                        <DispatchButton
                          onClick={handleDispatch}
                          disabled={selectedHospitalIndex === null}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          }
        />
        <Route
          path="/case-summary-2"
          element={
            <div className={containerClassName}>
              <MainPageNav />
              <div className="main-layout">
                <div className="main-layout__left">
                  <CaseSummarySecond
                    isFullWidth={isMenuOpen}
                    onEditClick={handleEditToggle}
                    onTranscriptClick={handleTranscriptToggle}
                    patientData={location.state?.patientData ?? patientsByRoute["/case-summary-2"]}
                  />
                </div>
                <div className="main-layout__right">
                  <HospitalRouting
                    isCollapsed={!isHospitalSectionOpen}
                    onToggle={() => setIsHospitalSectionOpen((v) => !v)}
                  />
                  <div className={`main-layout__hospital-body${isHospitalSectionOpen ? "" : " main-layout__hospital-body--collapsed"}`}>
                    <div className="main-layout__hospital-body-inner">
                      <div className="main-layout__right-row">
                        <HospitalsList
                          hospitals={hospitals}
                          selectedIndex={selectedHospitalIndex}
                          onSelect={setSelectedHospitalIndex}
                        />
                        <div className="main-layout__map-stack">
                          <Map
                            hospital={selectedHospital}
                            patientLocation={currentPatientData?.location}
                          />
                          <DispatchButton
                            onClick={handleDispatch}
                            disabled={selectedHospitalIndex === null}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <Route path="/dispatched" element={<AmbulanceDispatched />} />
        <Route path="/emergency" element={<EmergencyCall baseHospitals={baseHospitals} />} />
      </Routes>

      {isEditOpen && (
        <EditCaseSummary
          onClose={handleEditToggle}
          onSave={handleSave}
          patientData={currentPatientData}
        />
      )}
      {isTranscriptOpen && (
        <Transcript
          onClose={handleTranscriptToggle}
          lines={location.state?.transcriptLines}
          callId={currentPatientData?.callId}
          timestamp={currentPatientData?.timestamp}
        />
      )}
      <PageFooter isMenuOpen={isMenuOpen} />
    </>
  );
}

export default App;
