import React, { useState } from 'react';
import CryptoJS from 'crypto-js'; // npm install crypto-js

const PaymentModal = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('200');

    const handlePayment = () => {
        // Parse amount as number
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            alert('Please enter a valid amount');
            return;
        }

        const secretKey = '8gBm/:&EnhH.1/q';
        const productCode = 'EPAYTEST';
        const transactionUuid = `TRANS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const returnUrl = 'http://localhost:5173/payment/success';
        const failureUrl = 'http://localhost:5173/payment/failure';

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

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ×
                </button>
                <h2 className="text-2xl font-bold text-center text-green-600 mb-2">Get Premium</h2>
                <p className="text-sm text-center text-gray-500 mb-6">Secure your premium access now with eSewa</p>

                {/* Improved pricing display */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Premium Plan:</span>
                        <span className="font-semibold">Rs. {amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Tax:</span>
                        <span>Rs. 0</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">Rs. {amount}</span>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md transition disabled:opacity-50 font-medium"
                    disabled={!amount}
                >
                    Pay Rs. {amount} with eSewa
                </button>
                <p className="text-xs text-center mt-3 text-gray-400">
                    Secured by eSewa Payment Gateway
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;