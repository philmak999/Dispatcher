import './HospitalCard.scss';
//import Button from '../Button/Button.jsx';
import CheckIconTag from '../../assets/icons/Check.svg';
import MapIconTag from '../../assets/icons/Map.svg';
import AlertIconTag from '../../assets/icons/Alert.svg';

function HospitalCard({
    HospitalName,
    Recommendscore,
    HospitalNameDistance,
    DriveTime,
    HospitalInfo,
    AiRecommend,
    Map,
    onClick,
    isSelected
}) {
    return (

        <div
            className={`card ${AiRecommend ? 'ai' : 'normal'} ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className='display-area'>
                {AiRecommend ? (
                    <>
                        <div className='recommend-flag'>
                            <img src={CheckIconTag} alt="CheckLogo" className="check-icon_white" />
                            <p>RECOMMENDED</p>
                        </div>
                        <h3 className='hospital-name'>{HospitalName} </h3>
                        <div className='hospital-detail'>
                            <div className='hospital-score'>
                                <p className='score-icon' >•</p>
                                <p className='score-number'> {Recommendscore} Match Score</p>
                            </div>
                            <div className='gps-info'>
                                <img src={MapIconTag} alt="MapLogo" className="map-icon" />
                                <p>{HospitalNameDistance} km away </p>
                                <p>•</p>
                                <p className="drive-time">{DriveTime} minutes</p>
                            </div>
                            <div className='hospital-info'>
                                <img src={CheckIconTag} alt="CheckLogo" className="check-icon_green" />
                                <p>{HospitalInfo}</p>

                            </div>

                        </div>

                    </>
                ) : (
                    <>
                        <h3 className='hospital-name'>{HospitalName} </h3>
                        <div className='hospital-detail'>
                            <div className='hospital-score'>
                                <p className='score-icon' >•</p>
                                <p className='score-number'> {Recommendscore} Match Score</p>
                            </div>
                            <div className='gps-info'>
                                <img src={MapIconTag} alt="MapLogo" className="map-icon" />
                                <p>{HospitalNameDistance} km away </p>
                                <p>•</p>
                                <p className="drive-time">{DriveTime} minutes</p>
                            </div>
                            <div className='hospital-info'>
                                <img src={AlertIconTag} alt="AlertLogo" className="alert-icon" />
                                <p>{HospitalInfo}</p>

                            </div>

                        </div>
                    </>
                )}
            </div>

        </div>
    );
}

export default HospitalCard;