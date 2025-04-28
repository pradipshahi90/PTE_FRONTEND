import { useState, useEffect } from 'react';
import {useNavigate, useLocation, useParams} from 'react-router-dom';
import { toast } from 'react-toastify';
import {GenericRepo} from "../repo/GenericRepo.js";
import {Api} from "../utils/Api.js";

const PasswordReset = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const repo = new GenericRepo();

    // Extract reset token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const { resetToken } = useParams();

    // Redirect if no token is found
    useEffect(() => {
        if (location.search) {
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');

            if (!token) {
                toast.error('Invalid password reset link');
                navigate('/login');
            }
        }
    }, [location, navigate]);


    const validatePassword = () => {
        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validatePassword()) return;

        setIsLoading(true);

        repo.store(
            `${Api.RESET_PASSWORD}`,
            { resetToken, newPassword },
            (data) => {
                setIsSuccess(true);
                toast.success(data.message);
                setTimeout(() => navigate('/login'), 2000); // Redirect after showing success message
            },
            (error) => {
                toast.error(error || 'Failed to reset password. Please try again.');
                setIsLoading(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {isSuccess ? (
                        <div className="text-center">
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                                <p className="font-medium">Password reset successful!</p>
                                <p>Redirecting you to login...</p>
                            </div>
                            <div className="animate-pulse text-blue-500 mt-4">
                                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {passwordError && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                                    <p>{passwordError}</p>
                                </div>
                            )}

                            <div className="text-sm">
                <span className="font-medium text-gray-500">
                  Password must be at least 8 characters
                </span>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                                    ) : 'Reset Password'}
                                </button>
                            </div>

                            <div className="text-sm text-center">
                                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Back to login
                                </a>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;