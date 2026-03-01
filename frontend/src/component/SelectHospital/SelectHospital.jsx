import { useState } from 'react';
import './SelectHospital.scss';

function SelectHospital() {
  const [selected, setSelected] = useState(false);

  return (
    <div
      className={`select-hospital ${selected ? 'active' : ''}`}
      onClick={() => setSelected(!selected)}
    >
      <div className="circle-inner"></div>
    </div>
  );
}

export default SelectHospital;