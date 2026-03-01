import './PageHeader.scss';
import { useNavigate } from "react-router-dom";
import Button from '../Button/Button.jsx';
import HamburgerIconTag from '../../assets/icons/Hamburger.svg';
import UserIconTag from '../../assets/icons/User.svg';

function PageHeader({ onMenuToggle }) {
  //const navigate = useNavigate();

  return (
    <div className="header">
      <div className="nav-logo">
        <Button
          icon={<img src={HamburgerIconTag} alt="menu" className='icon' />}
          variant="header-menu"
          onClick={onMenuToggle}
        />
        <p>DISPATCHER</p>
      </div>
      <div className="setting">
        <img src={UserIconTag} alt="user" className='icon' />
      </div>
    </div>

  );
}

export default PageHeader;
