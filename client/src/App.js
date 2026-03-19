import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import EventList from "./pages/EventList";
import EventDetails from "./pages/Eventdetails";
import AdminCreateEvent from "./pages/Admincreateevent";
import AdminMapEditor from "./pages/AdminMapeditor";
import QrScanner from "./pages/QrScanner";
import ManagerBanners from "./pages/ManagerBanners";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />

        {/* EVENT LIST */}
        <Route path="/events" element={<EventList />} />

        {/* EVENT DETAILS */}
        <Route path="/event/:id" element={<EventDetails />} />

        {/* QR SCANNER */}
        <Route path="/scan-qr" element={<QrScanner />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminCreateEvent />} />
        <Route path="/admin/map/:eventId" element={<AdminMapEditor />} />
        <Route path="/admin/banners" element={<ManagerBanners />} />

        {/* AUTH */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;