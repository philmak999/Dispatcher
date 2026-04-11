import './PageHeader.scss';
import { useNavigate } from "react-router-dom";
import Button from '../Button/Button.jsx';
import HamburgerIconTag from '../../assets/icons/Hamburger.svg';
import UserIconTag from '../../assets/icons/User.svg';

function PageHeader({ onMenuToggle }) {
  return (
    <div className="header">
      <div className="header__logo">
        <Button
          icon={<img src={HamburgerIconTag} alt="menu" className='header__icon' />}
          variant="header-menu"
          onClick={onMenuToggle}
        />
        <p className="header__logo-title">DISPATCHER</p>
      </div>
      <div className="header__setting">
        <img src={UserIconTag} alt="user" className='header__icon' />
      </div>
    </div>
  );
}

export default PageHeader;
