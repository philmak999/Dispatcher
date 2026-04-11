import './MainPageNav.scss';

function MainPageNav() {
  return (
    <div className="nav-container">
      <p className="nav-container__greeting">Hello, Mary Torres</p>
      <div className="nav-container__bar">
        <p className="nav-container__item">Hospital Routing Dashboard</p>
        <p className="nav-container__item">Greater Toronto Area</p>
        <p className="nav-container__item">My Cases</p>
      </div>
    </div>
  );
}

export default MainPageNav;
