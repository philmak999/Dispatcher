import "./HospitalsList.scss";
import HospitalCard from "../HospitalCard/HospitalCard.jsx";

function HospitalsList({ hospitals = [], selectedIndex = null, onSelect }) {
    // Find the index of the non-recommended hospital with the highest score
    const alternativeIndex = hospitals.reduce((bestIdx, h, i) => {
        if (h.AiRecommend) return bestIdx;
        const score = parseFloat(h.Recommendscore) || 0;
        const bestScore = bestIdx !== -1 ? (parseFloat(hospitals[bestIdx].Recommendscore) || 0) : -1;
        return score > bestScore ? i : bestIdx;
    }, -1);

    return (
        <div className='hospitals-list'>
            <div className='hospitals-list__scroll'>
                {hospitals.map((hospital, index) => (
                    <HospitalCard
                        key={index}
                        HospitalName={hospital.HospitalName}
                        Recommendscore={hospital.Recommendscore}
                        HospitalNameDistance={hospital.HospitalNameDistance}
                        DriveTime={hospital.DriveTime}
                        HospitalInfo={hospital.HospitalInfo}
                        HospitalDetails={hospital.HospitalDetails}
                        AiRecommend={hospital.AiRecommend}
                        isAlternative={index === alternativeIndex}
                        onClick={() => onSelect?.(index)}
                        isSelected={selectedIndex === index}
                    />
                ))}
            </div>
        </div>
    );
}

export default HospitalsList;
