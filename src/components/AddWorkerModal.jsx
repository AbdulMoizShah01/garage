import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const AddWorkerModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        salaryAmount: '',
        salaryFrequency: 'Monthly',
        commuteExpense: '',
        shiftExpense: '',
        mealExpense: '',
        otherExpenses: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({
            name: '',
            phone: '',
            salaryAmount: '',
            salaryFrequency: 'Monthly',
            commuteExpense: '',
            shiftExpense: '',
            mealExpense: '',
            otherExpenses: ''
        }); // Reset
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                <div className="bg-white px-8 py-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Add Worker</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Amount</label>
                            <input
                                type="number"
                                name="salaryAmount"
                                value={formData.salaryAmount}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Frequency</label>
                            <select
                                name="salaryFrequency"
                                value={formData.salaryFrequency}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Daily">Daily</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Commute Expense</label>
                            <input
                                type="number"
                                name="commuteExpense"
                                value={formData.commuteExpense}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shift Expense</label>
                            <input
                                type="number"
                                name="shiftExpense"
                                value={formData.shiftExpense}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Expense</label>
                            <input
                                type="number"
                                name="mealExpense"
                                value={formData.mealExpense}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Other Expenses</label>
                            <input
                                type="number"
                                name="otherExpenses"
                                value={formData.otherExpenses}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
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
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddWorkerModal;
