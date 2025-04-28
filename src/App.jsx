import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import toast, { Toaster } from 'react-hot-toast';
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/admin/dashboard.jsx";
import ReadingMaterials from "./pages/admin/ReadingMaterials.jsx";
import AddReadingMaterial from "./pages/admin/reading-materials/add.jsx";
import EditReadingMaterials from "./pages/admin/reading-materials/edit.jsx";
import UserDashboard from "./pages/user/dashboard.jsx";
import Learn from "./pages/learn.jsx";
import UserManagementPage from "./pages/admin/UserManagementPage.jsx";
import CreateUserPage from "./components/CreateUserPage.jsx";
import PaymentButton from "./pages/payment.jsx";
import PaymentSuccess from "./pages/payment/success.jsx";
import PaymentFailure from "./pages/payment/fail.jsx";
import PaymentHistory from "./pages/admin/payment-history.jsx";
import ExamCreator from "./pages/admin/create-exam.jsx";
import ExamQuestions from "./pages/admin/exam-questions.jsx";
import PteCreateForm from "./pages/admin/create-exam.jsx";
import ExamSelectionPage from "./pages/ExamList.jsx";
import ExamRoom from "./pages/give-exam.jsx";
import SpeakingQuestions from "./pages/admin/speakingQuestions.jsx";
import SpeakingTest from "./pages/speakingTest.jsx";
import ExamResultsPage from "./pages/admin/ExamEvaluation.jsx";
import ExamGradingPage from "./pages/admin/AssignMarks.jsx";
import UserExamResults from "./pages/exam-list.jsx";
import ForgotPassword from "./pages/forgotPassword.jsx";
import PasswordReset from "./pages/reset-password.jsx";

const App = () => {
    return (
        <Router>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 2000,
                        iconTheme: {
                            primary: 'green',
                            secondary: 'black',
                        },
                    },
                    error: {
                        duration: 2000,
                        iconTheme: {
                            primary: 'red',
                            secondary: 'black',
                        },
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:resetToken" element={<PasswordReset />} />

                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/reading-materials" element={<ReadingMaterials />} />
                <Route path="/admin/reading-materials/add" element={<AddReadingMaterial />} />
                <Route path="/admin/reading-materials/edit/:slug" element={<EditReadingMaterials />} />
                <Route path="/admin/payment-history" element={<PaymentHistory />} />
                <Route path="/admin/create-exam" element={<PteCreateForm />} />
                <Route path="/admin/exam-question" element={<ExamQuestions />} />
                <Route path="/admin/speakingQuestions" element={<SpeakingQuestions />} />
                <Route path="/admin/exam-results" element={<ExamResultsPage />} />
                <Route path="/admin/exam-results/assign-marks" element={<ExamGradingPage />} />

                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/learn" element={<Learn />} />


                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/users/create-user" element={<CreateUserPage />} />
                <Route path="/payment" element={<PaymentButton />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />


                <Route path="/exam" element={<ExamSelectionPage />} />
                <Route path="/exam-room" element={<ExamRoom />} />
                <Route path="/exam/speaking-test" element={<SpeakingTest />} />
                <Route path="/profile/exam-list" element={<UserExamResults />} />

            </Routes>
        </Router>
    );
};

export default App;
