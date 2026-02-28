import PageHeader from './component/PageHeader/PageHeader.jsx';
//import MainPartContainer from './component/MainPartContainer/MainPartContainer.jsx';
import MainPageNav from './component/MainPageNav/MainPageNav.jsx';
import HospitalsList from './component/HospitalsList/HospitalsList.jsx';
import './App.css';

function App() {
  return (
    <>
      <PageHeader />
      {/* <MainPartContainer> */}
        <MainPageNav/>
        <HospitalsList/>

      {/* </MainPartContainer> */}
    </>
  );
}

export default App;