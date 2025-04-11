// src/pages/PaymentFailure.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />

                    <h2 className="mb-4 mt-4 text-center text-2xl font-bold text-gray-800">Payment Failed</h2>

                    <p className="mb-4 text-center text-gray-600">
                        We're sorry, but your payment could not be processed.
                    </p>

                    <p className="mb-2 text-center text-gray-600">This could be due to:</p>
                    <ul className="mb-6 list-inside list-disc text-left text-gray-600">
                        <li className="mb-1">Insufficient balance in your eSewa account</li>
                        <li className="mb-1">Transaction timeout</li>
                        <li className="mb-1">Payment was canceled</li>
                        <li className="mb-1">Technical issues with the payment gateway</li>
                    </ul>

                    <div className="mb-6 flex w-full flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                        <button
                            onClick={() => navigate('/learn')}
                            className="rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-1/2"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:w-1/2"
                        >
                            Return to Home
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        If you continue to face issues, please contact our support team at{' '}
                        <a href="mailto:support@yourcompany.com" className="text-green-600 hover:underline">
                            support@yourcompany.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;