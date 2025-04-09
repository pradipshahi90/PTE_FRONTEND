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
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/reading-materials" element={<ReadingMaterials />} />
                <Route path="/admin/reading-materials/add" element={<AddReadingMaterial />} />
                <Route path="/admin/reading-materials/edit/:slug" element={<EditReadingMaterials />} />

                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/learn" element={<Learn />} />

            </Routes>
        </Router>
    );
};

export default App;
