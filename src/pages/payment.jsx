import React, { useState } from 'react';
import PaymentModal from "../components/PaymentModal.jsx";

const App = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <button
                onClick={() => setShowModal(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 shadow-lg"
            >
                Get Premium with eSewa
            </button>

            <PaymentModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

export default App;
