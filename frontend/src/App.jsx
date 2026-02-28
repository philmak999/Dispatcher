import CaseSummary from './component/CaseSummary/CaseSummary.jsx';
import HamburgerMenu from './component/HamburgerMenu/HamburgerMenu.jsx';
import PageHeader from './component/PageHeader/PageHeader.jsx';
import MainPartContainer from './component/MainPartContainer/MainPartContainer.jsx';
import './App.css';

function App() {
  return (
    <>
    <PageHeader />
    <HamburgerMenu />
    <CaseSummary />
    <MainPartContainer>
    </MainPartContainer>
    </>
  );
}

export default App;
