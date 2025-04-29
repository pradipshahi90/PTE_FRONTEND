// Modal.js
import React from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm, courseId }) => {
    console.log('courseId',courseId);
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-semibold">Are you sure you want to delete this course?</h2>
                <div className="mt-4 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(courseId)}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
