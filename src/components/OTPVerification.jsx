import React, { useState } from "react";
import toast from "react-hot-toast";
import { GenericRepo } from "../repo/GenericRepo.js";
import { Api } from "../utils/Api.js";

const OTPVerification = ({ email }) => {
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const repo = new GenericRepo();

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const sendOtp = () => {
        repo.store(
            `${Api.SEND_OTP}`,
            { email },
            (data) => {
                toast.success(data.message);
                setIsOtpSent(true);
            },
            (error) => {
                toast.error(error);
                console.log("error", error);
            }
        );
    };

    const verifyOtp = () => {
        repo.store(
            `${Api.VERIFY_OTP}`,
            { email, otp },
            (data) => {
                toast.success(data.message);
                setIsOtpVerified(true);
            },
            (error) => {
                toast.error(error);
                console.log("error", error);
            }
        );
    };

    return (
        <div>
            {!isOtpSent ? (
                <div>
                    <p>We have sent an OTP to {email}. Please check your inbox.</p>
                    <button
                        onClick={sendOtp}
                        className="btn btn-primary"
                    >
                        Send OTP
                    </button>
                </div>
            ) : (
                <div>
                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-primary mb-2">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={handleOtpChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter OTP"
                        />
                    </div>
                    <button
                        onClick={verifyOtp}
                        className="w-full btn btn-primary"
                    >
                        Verify OTP
                    </button>
                </div>
            )}
            {isOtpVerified && (
                <p className="text-green-500 mt-4">OTP Verified successfully!</p>
            )}
        </div>
    );
};

export default OTPVerification;
