import './HospitalsList.scss';
import { useNavigate } from "react-router-dom";
import Button from '../Button/Button.jsx';
import EditIconTag from '../../assets/icons/Edit.svg';
import UserIconTag from '../../assets/icons/User.svg';

function HospitalsList() {
    return (
        <div className='hospital-info'>
            <div className='top-part'>
                <p>Hospitals</p>
                <Button
                text="Add Custom Hospital"
                icon={<img src={EditIconTag} alt="Hospital edit" />}
                onClick={() => {}}
                variant="hospital-edit"
                />
            </div>
            <div className='main-part'>
                <div className='hospital-ai'></div>
                <div className='map'></div>
                

            </div>
        </div>
    )
}
export default HospitalsList;
