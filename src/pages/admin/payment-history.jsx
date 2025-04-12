import AdminLayout from "../../layouts/AdminLayout";
import { useState, useEffect } from "react";
import { GenericRepo } from "../../repo/GenericRepo.js";
import { Api } from "../../utils/Api.js";

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const repo = new GenericRepo();

    const getPaymentHistory = () => {
        repo.list(
            `${Api.GET_PAYMENT_HISTORY}`,
            "",
            (data) => {
                console.log('Fetched data:', data.payments);
                setPayments(data.payments || []);
            },
            (error) => {
                console.log("Error fetching data:", error);
            }
        );
    };

    useEffect(() => {
        getPaymentHistory();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredPayments = payments.filter(payment =>
        payment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Payment History</h1>
                        <p className="mt-2 text-sm text-gray-700">A list of all payment transactions in your account.</p>
                    </div>
                </div>

                <div className="mt-4 w-full">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search payments..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Desktop Table (hidden on small screens) */}
                <div className="mt-6 hidden md:block">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Transaction</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredPayments.length > 0 ? (
                                        filteredPayments.map((payment, index) => (
                                            <tr key={payment._id || index} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {formatDate(payment.createdAt)}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{payment.name}</div>
                                                    <div className="text-sm text-gray-500">{payment.email}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4">
                                                    <div className="text-sm text-gray-900">{payment.transaction_code}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{payment.transaction_uuid}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                                                    ${parseFloat(payment.total_amount).toFixed(2)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status}
                            </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-3 py-4 text-sm text-center text-gray-500">
                                                No payment records found
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Cards (shown only on small screens) */}
                <div className="mt-6 md:hidden">
                    <div className="space-y-4">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment, index) => (
                                <div key={payment._id || index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{payment.name}</h3>
                                            <p className="text-sm text-gray-500">{payment.email}</p>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            payment.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                      {payment.status}
                    </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Date</p>
                                            <p className="font-medium">{formatDate(payment.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Amount</p>
                                            <p className="font-medium">${parseFloat(payment.total_amount).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Transaction Code</p>
                                            <p className="font-medium">{payment.transaction_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Transaction ID</p>
                                            <p className="font-medium truncate">{payment.transaction_uuid}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                                No payment records found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}