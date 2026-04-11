import { useState } from 'react';
import './SelectHospital.scss';

function SelectHospital() {
  const [selected, setSelected] = useState(false);

  return (
    <div
      className={`select-hospital ${selected ? 'select-hospital--active' : ''}`}
      onClick={() => setSelected(!selected)}
    >
      <div className="select-hospital__inner"></div>
    </div>
  );
}

export default SelectHospital;
