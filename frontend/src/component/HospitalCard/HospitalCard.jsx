import { useState } from 'react';
import './HospitalCard.scss';
import CheckIconTag from '../../assets/icons/Check.svg';
import MapIconTag from '../../assets/icons/Map.svg';
import AlertIconTag from '../../assets/icons/Alert.svg';

function HospitalInfo({ text, details, icon, iconAlt, iconClass }) {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;

    return (
        <div className='hospital-card__info'>
            <img src={icon} alt={iconAlt} className={iconClass} />
            <div className='hospital-card__info-body'>
                <div className='hospital-card__info-row'>
                    <p className='hospital-card__info-label'>{text}</p>
                    {details && (
                        <button
                            className='hospital-card__info-toggle'
                            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                        >
                            {expanded ? (
                                'Less'
                            ) : (
                                'Details'
                            )}
                        </button>
                    )}
                </div>
                {expanded && details && (
                    <p className='hospital-card__info-details'>{details}</p>
                )}
            </div>
        </div>
    );
}

function HospitalCard({
    HospitalName,
    Recommendscore,
    HospitalNameDistance,
    DriveTime,
    HospitalInfo: info,
    HospitalDetails,
    AiRecommend,
    isAlternative,
    onClick,
    isSelected
}) {
    return (
        <div
            className={`hospital-card ${AiRecommend ? 'hospital-card--ai' : 'hospital-card--normal'} ${isSelected ? 'hospital-card--selected' : ''}`}
            onClick={onClick}
        >
            <div className='hospital-card__score-row'>
                {AiRecommend && (
                    <div className='hospital-card__flag hospital-card__flag--recommended'>
                        <img src={CheckIconTag} alt="CheckLogo" className="hospital-card__flag-icon" />
                        <p>RECOMMENDED</p>
                    </div>
                )}
                {!AiRecommend && isAlternative && (
                    <div className='hospital-card__flag hospital-card__flag--alternative'>
                        <p>ALTERNATIVE</p>
                    </div>
                )}
                <p className='hospital-card__score-number'>{Recommendscore} Match Score</p>
            </div>
            <div className='hospital-card__display'>
                <h3 className='hospital-card__name'>{HospitalName}</h3>
                <div className='hospital-card__detail'>
                    <div className='hospital-card__gps'>
                        <img src={MapIconTag} alt="MapLogo" className="hospital-card__gps-icon" />
                        <p>{HospitalNameDistance} km away</p>
                        <p>•</p>
                        <p className="hospital-card__drive-time">{DriveTime} minutes</p>
                    </div>
                    <HospitalInfo
                        text={info}
                        details={HospitalDetails}
                        icon={AiRecommend ? CheckIconTag : AlertIconTag}
                        iconAlt={AiRecommend ? "CheckLogo" : "AlertLogo"}
                        iconClass={AiRecommend ? "hospital-card__check-icon" : "hospital-card__alert-icon"}
                    />
                </div>
            </div>
        </div>
    );
}

export default HospitalCard;
