import React, { useEffect, useState } from "react";
import { X } from "lucide-react"; // Importing the 'X' icon from lucide-react

const DeleteConfirmation = ({ id, onDelete, onClose }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleDelete = () => {
        onDelete(id);  // Call the function passed by the parent with the ID
    };

    useEffect(() => {
        console.log('asd');
    }, [id]);

    return (
        isOpen && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-md shadow-lg w-96">
                    <h3 className="text-lg font-semibold mb-6">Are you sure you want to delete?</h3>
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="flex items-center px-4 py-2 text-black cursor-pointer rounded-md hover:bg-gray-200"
                        >
                            <X className="mr-2" /> Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-white cursor-pointer bg-red-500 rounded-md hover:bg-red-600"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default DeleteConfirmation;
