import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const AddMetadataModal = ({ isOpen, onClose, onAdd, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
        vin: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        plate: '',
        paidAmount: 0,
        totalBilled: 0,
        outstandingBalance: 0
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    phone: initialData.phone || '',
                    email: initialData.email || '',
                    notes: initialData.notes || '',
                    vin: initialData.vehicle?.vin || '',
                    make: initialData.vehicle?.make || '',
                    model: initialData.vehicle?.model || '',
                    year: initialData.vehicle?.year || new Date().getFullYear(),
                    plate: initialData.vehicle?.plate || '',
                    paidAmount: initialData.paidAmount || 0,
                    totalBilled: initialData.totalBilled || 0,
                    outstandingBalance: initialData.outstandingBalance || 0
                });
            } else {
                // Reset form when modal opens in add mode
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    notes: '',
                    vin: '',
                    make: '',
                    model: '',
                    year: new Date().getFullYear(),
                    plate: '',
                    paidAmount: 0,
                    totalBilled: 0,
                    outstandingBalance: 0
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Recalculate outstanding balance when paidAmount or totalBilled changes
            if (name === 'paidAmount' || name === 'totalBilled') {
                const paid = parseFloat(updated.paidAmount) || 0;
                const billed = parseFloat(updated.totalBilled) || 0;
                updated.outstandingBalance = Math.max(0, billed - paid);
            }
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="bg-white px-8 py-6 flex justify-between items-center sticky top-0 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Edit Metadata' : 'Add Metadata'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                    {/* Customer Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Customer</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter customer full name"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Vehicle Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Vehicle</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                VIN <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Make <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Model <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                <input
                                    type="text"
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Information</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Billed (RF)
                                </label>
                                <input
                                    type="number"
                                    name="totalBilled"
                                    value={formData.totalBilled || ''}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Paid Amount (RF)
                                </label>
                                <input
                                    type="number"
                                    name="paidAmount"
                                    value={formData.paidAmount || ''}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Outstanding Balance:</span>
                                <span className={`text-lg font-bold ${formData.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    RF {formData.outstandingBalance.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-200"
                        >
                            {initialData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMetadataModal;
