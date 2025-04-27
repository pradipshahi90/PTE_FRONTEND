import React, {useEffect, useState} from 'react';
import CryptoJS from 'crypto-js';

const PaymentModal = ({ isOpen, onClose, user }) => {
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    // Pricing details
    const plans = {
        monthly: {
            price: 200,
            title: 'Monthly Premium',
            description: 'Full access for 30 days',
            savings: null,
            duration: '1 month'
        },
        yearly: {
            price: 1800,
            title: 'Yearly Premium',
            description: 'Full access for 365 days',
            savings: '25% savings compared to monthly',
            duration: '12 months'
        }
    };

    useEffect(() => {
        // This will run as soon as the component mounts
        localStorage.setItem('selectedPlan', selectedPlan);
    }, []); // Ensure it runs whenever 'plan' changes

    // Function to update selected plan and store it in localStorage
    const handlePlanSelection = (plan) => {
        setSelectedPlan(plan);
        localStorage.setItem('selectedPlan', plan); // Store selected plan in localStorage
    };

    const handlePayment = () => {
        const planDetails = plans[selectedPlan];
        const numAmount = planDetails.price;

        const secretKey = '8gBm/:&EnhH.1/q';
        const productCode = 'EPAYTEST';
        const transactionUuid = `TRANS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const returnUrl = 'http://localhost:5173/payment/success';
        const failureUrl = 'http://localhost:5173/payment/failure';

        // Add subscription type to transaction for backend processing
        const extraData = JSON.stringify({
            subscription_type: selectedPlan,
            user_id: user?._id || ''
        });

        const taxAmount = 0;
        const serviceCharge = 0;
        const deliveryCharge = 0;
        const totalAmount = numAmount + taxAmount + serviceCharge + deliveryCharge;

        const signedFieldNames = 'total_amount,transaction_uuid,product_code';
        const stringToSign = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
        const signature = CryptoJS.HmacSHA256(stringToSign, secretKey).toString(CryptoJS.enc.Base64);

        const form = document.createElement('form');
        form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
        form.method = 'POST';

        const inputFields = [
            { name: 'amount', value: numAmount.toString() },
            { name: 'tax_amount', value: taxAmount.toString() },
            { name: 'total_amount', value: totalAmount.toString() },
            { name: 'transaction_uuid', value: transactionUuid },
            { name: 'product_code', value: productCode },
            { name: 'product_service_charge', value: serviceCharge.toString() },
            { name: 'product_delivery_charge', value: deliveryCharge.toString() },
            { name: 'success_url', value: returnUrl },
            { name: 'failure_url', value: failureUrl },
            { name: 'signed_field_names', value: signedFieldNames },
            { name: 'signature', value: signature },
            { name: 'extra_data', value: extraData }
        ];

        inputFields.forEach((field) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field.name;
            input.value = field.value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    if (!isOpen) return null;

    const currentPlan = plans[selectedPlan];

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ×
                </button>
                <h2 className="text-2xl font-bold text-center text-green-600 mb-1">Upgrade to Premium</h2>
                <p className="text-sm text-center text-gray-500 mb-6">Unlock all features with our premium
                    subscription</p>

                {/* Plan selection tabs */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        className={`flex-1 py-2 rounded-md transition-all ${
                            selectedPlan === 'monthly'
                                ? 'bg-white text-green-600 shadow'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => handlePlanSelection('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md transition-all ${
                            selectedPlan === 'yearly'
                                ? 'bg-white text-green-600 shadow'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => handlePlanSelection('yearly')}
                    >
                        Yearly
                    </button>
                </div>

                {/* Plan details */}
                <div
                    className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg mb-6 border border-green-200 relative overflow-hidden">
                    {selectedPlan === 'yearly' && (
                        <div className="absolute top-5 -right-3">
                            <div
                                className="bg-green-500 text-white text-xs px-3 py-1 font-medium transform rotate-45 translate-x-2 -translate-y-1 shadow-sm">
                                BEST VALUE
                            </div>
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{currentPlan.title}</h3>
                            <p className="text-sm text-gray-600">{currentPlan.description}</p>
                        </div>
                        <div className="text-righ mr-10">
                            <span className="text-2xl  font-bold text-gray-800">Rs. {currentPlan.price}</span>
                            <p className="text-xs text-gray-500">for {currentPlan.duration}</p>
                        </div>
                    </div>

                    {currentPlan.savings && (
                        <div className="text-sm text-green-600 font-medium mb-2">
                            {currentPlan.savings}
                        </div>
                    )}

                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"/>
                            </svg>
                            Unlimited access to all features
                        </li>
                        <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"/>
                            </svg>
                            Priority customer support
                        </li>
                        <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"/>
                            </svg>
                            Ad-free experience
                        </li>
                    </ul>
                </div>

                {/* Payment summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">{currentPlan.title}:</span>
                        <span className="font-semibold">Rs. {currentPlan.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Tax:</span>
                        <span>Rs. 0</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span className="text-green-600 mr-">Rs. {currentPlan.price}</span>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md transition font-medium flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Pay Rs. {currentPlan.price} with eSewa
                </button>

                <p className="text-xs text-center mt-4 text-gray-400 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Secured by eSewa Payment Gateway
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;