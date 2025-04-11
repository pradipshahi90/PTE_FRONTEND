// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Loader } from 'lucide-react';
import {useAuthStore} from "../../utils/authStore.js";

const PaymentSuccess = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Parse the query parameters from the URL
        const query = new URLSearchParams(location.search);
        const encodedData = query.get('data');

        if (encodedData) {
            try {
                // Decode the base64 string
                const decodedString = atob(encodedData);
                // Parse the JSON data
                const data = JSON.parse(decodedString);
                setPaymentData(data);

                // Verify the payment status
                if (data.status === 'COMPLETE') {
                    // Send the payment data to your backend
                    console.log('payment completed');

                    console.log(paymentData);
                    sendPaymentToBackend(data);
                } else {
                    // Payment had an issue
                    console.log('Payment not completed:', data.status);
                    navigate('/payment/failure');
                }
            } catch (error) {
                console.error('Error parsing payment data:', error);
                navigate('/payment/failure');
            }
        } else {
            navigate('/payment/failure');
        }

        setIsLoading(false);
    }, [location, navigate]);


    const sendPaymentToBackend = async (paymentData) => {
        try {
            const { user, setUser } = useAuthStore.getState();

            if (!user) {
                console.error('User not logged in');
                return navigate('/');
            }

            const response = await axios.post('http://localhost:5001/api/payment/save', {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                payment: paymentData,
            });

            if (response.data.success) {
                console.log('Payment stored in backend');

                // ✅ Update premium status in Zustand and localStorage
                setUser({ ...user, is_premium_purchased: true });
            } else {
                console.error('Payment storage failed in backend');
                navigate('/payment/failure');
            }
        } catch (error) {
            console.error('Error storing payment data:', error);
            navigate('/payment/failure');
        } finally {
            setIsProcessing(false);
        }
    };


    if (isLoading || isProcessing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                    <div className="flex flex-col items-center justify-center">
                        <Loader className="h-12 w-12 animate-spin text-green-500" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-800">
                            {isLoading ? 'Processing payment...' : 'Verifying payment...'}
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />

                    <h2 className="mb-6 mt-4 text-center text-2xl font-bold text-gray-800">Payment Successful!</h2>

                    <div className="mb-6 w-full space-y-4 rounded-lg bg-gray-50 p-4">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Transaction Code:</span>
                            <span className="text-gray-800">{paymentData?.transaction_code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Amount:</span>
                            <span className="text-gray-800">Rs. {paymentData?.total_amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Status:</span>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                {paymentData?.status}
              </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full rounded-lg bg-green-500 py-3 font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;