import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import Market from "./pages/Market";
import Learning from "./pages/Learning";
import AnimalDetection from "./pages/AnimalDetection";
import DeviceSettings from "./pages/DeviceSettings";

function App() {

return (

<BrowserRouter>

<div style={{display:"flex"}}>

<Sidebar/>

<div style={{flex:1,padding:"20px"}}>

<Routes>

<Route path="/" element={<Dashboard/>}/>
<Route path="/ai" element={<AIAssistant/>}/>
<Route path="/market" element={<Market/>}/>
<Route path="/learning" element={<Learning/>}/>
<Route path="/animals" element={<AnimalDetection/>}/>
<Route path="/settings" element={<DeviceSettings/>}/>

</Routes>

</div>

</div>

</BrowserRouter>

);

}

export default App;