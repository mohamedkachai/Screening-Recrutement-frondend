import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useContext } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import { ConfigProvider } from 'antd';
import { AuthContext } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import UsersList from './pages/UsersList';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import LogsList from './pages/LogsList';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RoleRoute from './components/RoleRoute';
import OffersList from './pages/offers/OffersList';
import OfferCreate from './pages/offers/OfferCreate';
import OfferEdit from './pages/offers/OfferEdit';
import OfferDetail from './pages/offers/OfferDetail';
import PublicOffers from './pages/offers/PublicOffers';
import MyApplications from './pages/applications/MyApplications';
import OfferApplications from './pages/applications/OfferApplications';
import InvitationsList from './pages/invitations/InvitationsList';
import AcceptInvitation from './pages/AcceptInvitation';
import TestLibrary from './pages/tests/TestLibrary';
import TestsList from './pages/tests/TestsList';
import TestEdit from './pages/tests/TestEdit';
import SessionEdit from './pages/sessions/SessionEdit';
import TakeAttempt from './pages/attempts/TakeAttempt';
import AttemptsList from './pages/attempts/AttemptsList';
import AttemptDetail from './pages/attempts/AttemptDetail';
import ResultsList from './pages/results/ResultsList';
import { ROLES } from './constants/enums';

function App() {
  const { token } = useContext(AuthContext);
  return (
    <ConfigProvider
      theme={{
        "token": {
          "colorPrimary": "#13c2c2",
          "colorInfo": "#13c2c2",
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/invitations/:token' element={<AcceptInvitation />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
          {
            token &&
            <Route path='/' element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/change-password' element={<ChangePassword />} />

              {/* Candidate */}
              <Route
                path='/browse'
                element={
                  <RoleRoute roles={[ROLES.CANDIDATE]}>
                    <PublicOffers />
                  </RoleRoute>
                }
              />
              <Route
                path='/my-applications'
                element={
                  <RoleRoute roles={[ROLES.CANDIDATE]}>
                    <MyApplications />
                  </RoleRoute>
                }
              />

              {/* Offer detail — accessible to all authenticated users */}
              <Route path='/offers/:id' element={<OfferDetail />} />

              {/* HR / Admin */}
              <Route
                path='/offers'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <OffersList />
                  </RoleRoute>
                }
              />
              <Route
                path='/offers/new'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <OfferCreate />
                  </RoleRoute>
                }
              />
              <Route
                path='/offers/:id/edit'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <OfferEdit />
                  </RoleRoute>
                }
              />
              <Route
                path='/offers/:id/applications'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <OfferApplications />
                  </RoleRoute>
                }
              />
              <Route
                path='/invitations'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <InvitationsList />
                  </RoleRoute>
                }
              />
              <Route
                path='/tests'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <TestLibrary />
                  </RoleRoute>
                }
              />
              <Route
                path='/offers/:offerId/tests'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <TestsList />
                  </RoleRoute>
                }
              />
              <Route
                path='/tests/:testId'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <TestEdit />
                  </RoleRoute>
                }
              />
              <Route
                path='/offers/:offerId/session'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR]}>
                    <SessionEdit />
                  </RoleRoute>
                }
              />
              <Route
                path='/take/:offerId'
                element={
                  <RoleRoute roles={[ROLES.CANDIDATE]}>
                    <TakeAttempt />
                  </RoleRoute>
                }
              />
              <Route
                path='/offers/:offerId/attempts'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR, ROLES.REVIEWER]}>
                    <AttemptsList />
                  </RoleRoute>
                }
              />
              <Route
                path='/attempts/:attemptId'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR, ROLES.REVIEWER]}>
                    <AttemptDetail />
                  </RoleRoute>
                }
              />
              <Route
                path='/results'
                element={
                  <RoleRoute roles={[ROLES.ADMIN, ROLES.HR, ROLES.REVIEWER]}>
                    <ResultsList />
                  </RoleRoute>
                }
              />

              {/* Admin only */}
              <Route
                path='/user/add'
                element={
                  <RoleRoute roles={[ROLES.ADMIN]}>
                    <AddUser />
                  </RoleRoute>
                }
              />
              <Route
                path='/user/edit/:id'
                element={
                  <RoleRoute roles={[ROLES.ADMIN]}>
                    <EditUser />
                  </RoleRoute>
                }
              />
              <Route
                path='/user/list'
                element={
                  <RoleRoute roles={[ROLES.ADMIN]}>
                    <UsersList />
                  </RoleRoute>
                }
              />
              <Route
                path='/logs/list'
                element={
                  <RoleRoute roles={[ROLES.ADMIN]}>
                    <LogsList />
                  </RoleRoute>
                }
              />
            </Route>
          }

          {!token && <Route path='*' element={<Login />} />}
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App;