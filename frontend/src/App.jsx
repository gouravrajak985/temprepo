import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Analytics from './pages/Analytics';
import SingleEmails from './pages/SingleEmails';
import ComposeEmail from './pages/ComposeEmail';
import EmailDetails from './pages/EmailDetails';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CreateCampaign />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/emails" element={<SingleEmails />} />
            <Route path="/emails/compose" element={<ComposeEmail />} />
            <Route path="/emails/:id" element={<EmailDetails />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;