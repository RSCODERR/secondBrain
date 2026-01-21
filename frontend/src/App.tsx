import { Routes,Route } from "react-router-dom"
import DashBoard from "./pages/dashboard"
import { SignIn } from "./pages/signIn"
import { Signup } from "./pages/signup"
import LandingPage from "./pages/landingPage"
import ShareView from "./pages/shareview"

function App(){
    return(
        <Routes>
            <Route path="/signup" element = {<Signup />} />
            <Route path="/signin" element = {<SignIn />} />
            <Route path="/dashboard" element = {<DashBoard/>} />
            <Route path="/" element = {<LandingPage />} />
            <Route path="/share/:shareLink" element={<ShareView />} />
        </Routes>
    )
}

export default App