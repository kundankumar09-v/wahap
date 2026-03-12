import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import EventList from "./pages/EventList";
import EventDetails from "./pages/Eventdetails";
import AdminCreateEvent from "./pages/Admincreateevent";
import AdminMapEditor from "./pages/AdminMapeditor";
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

        {/* ADMIN */}
        <Route path="/admin" element={<AdminCreateEvent />} />
        <Route path="/admin/map/:eventId" element={<AdminMapEditor />} />

        {/* AUTH */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;