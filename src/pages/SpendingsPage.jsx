import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaTrash } from 'react-icons/fa';
import AddSpendingModal from '../components/AddSpendingModal';
import { fetchSpendings, createSpending, deleteSpending } from '../redux/actions';

const SpendingsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const spendings = useSelector(state => state.spendings || []);

    useEffect(() => {
        dispatch(fetchSpendings());
    }, [dispatch]);

    const handleSave = async (spendingData) => {
        await dispatch(createSpending(spendingData));
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this spending record?')) {
            dispatch(deleteSpending(id));
        }
    };

    // Calculate total spendings (last 6 months)
    const totalSpendings = spendings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Spendings</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                    <FaPlus size={14} /> Add Spending
                </button>
            </div>

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Track operational expenses to keep insights accurate.</h2>
                <p className="text-gray-500">
                    Total recorded spendings (6 months rolling): <span className="font-medium text-gray-800">RF {totalSpendings.toLocaleString()}</span>
                </p>
            </div>

            {/* Spendings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Incurred On</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {spendings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No spendings recorded yet. Add one above to get started.
                                    </td>
                                </tr>
                            ) : (
                                spendings.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                            RF {Number(item.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(item.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors flex items-center justify-end gap-1 ml-auto text-xs font-medium uppercase"
                                            >
                                                <FaTrash size={12} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddSpendingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default SpendingsPage;
