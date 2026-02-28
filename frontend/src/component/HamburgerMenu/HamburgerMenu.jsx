import './HamburgerMenu.scss'
import callIcon from '../../assets/icons/Call.svg'
import settingsIcon from '../../assets/icons/Settings.svg'

function HamburgerMenu() {
  return (
    <aside className="hamburger-menu">
      <div className="hamburger-menu__top">
        <div className="hamburger-menu__header">
          <h2 className="hamburger-menu__title">New Case</h2>
          <img className="hamburger-menu__icon" src={callIcon} alt="" aria-hidden="true" />
        </div>

        <div className="hamburger-menu__section">
          <h2 className="hamburger-menu__title">My Tickets</h2>
          <nav className="hamburger-menu__links">
            <span>My Previous Cases</span>
            <span>All Cases</span>
            <span>Weekly Analysis</span>
          </nav>
        </div>
      </div>

      <div className="hamburger-menu__bottom">
        <h3 className="hamburger-menu__settings">SETTINGS</h3>
        <img className="hamburger-menu__icon" src={settingsIcon} alt="" aria-hidden="true" />
      </div>
    </aside>
  )
}

export default HamburgerMenu
