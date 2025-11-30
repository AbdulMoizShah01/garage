import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import AddWorkerModal from '../components/AddWorkerModal';
import EditWorkerModal from '../components/EditWorkerModal';
import { fetchWorkers, createWorker, deleteWorker, updateWorker } from '../redux/actions';

const WorkersPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const workers = useSelector(state => state.workers);

    useEffect(() => {
        dispatch(fetchWorkers());
    }, [dispatch]);

    const handleAddWorker = async (newWorker) => {
        await dispatch(createWorker(newWorker));
        setIsAddModalOpen(false);
    };

    const handleEditWorker = async (updatedData) => {
        if (selectedWorker) {
            await dispatch(updateWorker(selectedWorker.id, updatedData));
            setIsEditModalOpen(false);
            setSelectedWorker(null);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this worker?')) {
            dispatch(deleteWorker(id));
        }
    };

    const openEditModal = (worker) => {
        setSelectedWorker(worker);
        setIsEditModalOpen(true);
    };

    const handleViewDetails = (workerId) => {
        navigate(`/workers/${workerId}`);
    };

    const calculateTotalExpenses = (worker) => {
        const commute = parseFloat(worker.commuteExpense) || 0;
        const shift = parseFloat(worker.shiftExpense) || 0;
        const meal = parseFloat(worker.mealExpense) || 0;
        const other = parseFloat(worker.otherExpenses) || 0;
        return commute + shift + meal + other;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Workers</h1>
                    <p className="text-gray-500 mt-1">Manage your team members</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 font-medium"
                >
                    <FaPlus /> Add Worker
                </button>
            </div>

            {/* Filters/Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search workers..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
            </div>

            {/* Workers List - Card Layout */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {workers.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                        No workers found. Add one above to get started.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {workers.map((worker) => (
                            <div key={worker.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="flex-shrink-0">
                                        <div className="text-sm font-bold text-gray-900">{worker.name}</div>
                                        <div className="text-xs text-gray-500">{worker.phone || 'N/A'}</div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500">Salary</div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                RF {parseFloat(worker.salaryAmount || 0).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">{worker.salaryFrequency}</div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-gray-500">Total Expenses</div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                RF {calculateTotalExpenses(worker).toLocaleString()}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Payment Status</div>
                                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${worker.paymentStatus === 'Paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {worker.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleViewDetails(worker.id)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <FaEye size={16} />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(worker)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(worker.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddWorkerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddWorker}
            />

            <EditWorkerModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedWorker(null);
                }}
                onUpdate={handleEditWorker}
                worker={selectedWorker}
            />
        </div>
    );
};

export default WorkersPage;
