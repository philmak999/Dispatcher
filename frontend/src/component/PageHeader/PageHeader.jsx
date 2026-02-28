import './PageHeader.scss'

//import logo from '../../assets/logo/InStock-Logo.svg';
import Button from '../Button/Button.jsx'
//import { useNavigate } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function PageHeader() {
const navigate = useNavigate();
// const isWarehouseActive =
// pathname === "/" || pathname.includes("warehouses");
  return (
    <header className="header"> 
      <div className="NavBar">
        {/* <img src={logo} alt="theLogo" className="logo" /> */}
        <div className='pageHeaderButtonPart'>
           (
              {/* <>
                <Button
                  text="Warehouses"
                  variant="PageHeader"
                  initialColor="#FFFFFF"
                  initialBackgroundColor="#232940"
                  active={isWarehouseActive} 
                //   onClick={() => navigate('/WareHouses')}
                />
                <Button
                  text="Inventory"
                  variant="PageHeader"
                  initialColor="#FFFFFF"
                  initialBackgroundColor="#232940"
                  active={isInventoryActive} 
                //   onClick={() => navigate('/Inventory')}
                />
              </> */}
            )
        </div>
      </div>
    </header>
  );
}

export default PageHeader;