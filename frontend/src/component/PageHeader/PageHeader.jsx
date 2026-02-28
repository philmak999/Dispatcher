import './PageHeader.scss';
import { useNavigate } from "react-router-dom";
import Button from '../Button/Button.jsx';
import HamburgerIconTag from '../../assets/icons/Hamburger.svg';
import UserIconTag from '../../assets/icons/User.svg';

function PageHeader() {
  //const navigate = useNavigate();

  return (
    <div className="header">
      <div className="header-bar">
        <div className="nav-logo">
          <Button
            icon={<img src={HamburgerIconTag} alt="menu" className='HamburgerIcon' />}
            variant="header-menu"
            onClick={() => { }}
          />
          <p>DISPATCHER</p>
        </div>

        <div className='user'>
          <Button
            icon={<img src={UserIconTag} alt="user" className='userIcon' />}
            variant="header-menu"
            onClick={() => { }}
          />
        </div>
      </div>
    </div>

  );
}

export default PageHeader;