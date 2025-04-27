// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Loader } from 'lucide-react';
import { useAuthStore } from "../../utils/authStore.js";

const PaymentSuccess = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
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
                    console.log('Payment completed');
                    console.log('paymentData',data);
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

            console.log('paymentData',paymentData);

            // Extract subscription type from extra_data if available
            let subscriptionType = 'monthly'; // Default to monthly if not specified
            let extraData = {};

            if (paymentData.extra_data) {
                try {
                    extraData = JSON.parse(paymentData.extra_data);
                    if (extraData.subscription_type) {
                        subscriptionType = extraData.subscription_type;
                    }
                } catch (error) {
                    console.error('Error parsing extra_data:', error);
                }
            }
            subscriptionType = localStorage.getItem("selectedPlan");
            console.log('subscriptionType',subscriptionType);


            // Calculate subscription dates
            const startDate = new Date();
            let endDate = new Date(startDate);

            if (subscriptionType === 'monthly') {
                endDate.setMonth(endDate.getMonth() + 1);
            } else if (subscriptionType === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

            const subscriptionDetails = {
                subscription_type: subscriptionType,
                subscription_start: startDate,
                subscription_end: endDate
            };

            setSubscriptionDetails(subscriptionDetails);

            const response = await axios.post('http://localhost:5001/api/payment/save', {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                payment: paymentData,
                subscription: subscriptionDetails
            });

            if (response.data.success) {
                console.log('Payment stored in backend');

                // Update all user subscription details in Zustand and localStorage
                setUser({
                    ...user,
                    is_premium_purchased: true,
                    subscription_type: subscriptionType,
                    subscription_start: startDate.toISOString(),
                    subscription_end: endDate.toISOString()
                });
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

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />

                    <h2 className="mb-2 mt-4 text-center text-2xl font-bold text-gray-800">Payment Successful!</h2>
                    <p className="mb-6 text-center text-gray-600">Your premium subscription is now active</p>

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

                    {subscriptionDetails && (
                        <div className="mb-6 w-full space-y-3 rounded-lg bg-green-50 p-4 border border-green-100">
                            <h3 className="font-semibold text-green-800">Subscription Details</h3>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Plan:</span>
                                <span className="capitalize text-gray-800">{subscriptionDetails.subscription_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Start Date:</span>
                                <span className="text-gray-800">{formatDate(subscriptionDetails.subscription_start)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Expires On:</span>
                                <span className="text-gray-800">{formatDate(subscriptionDetails.subscription_end)}</span>
                            </div>
                        </div>
                    )}

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