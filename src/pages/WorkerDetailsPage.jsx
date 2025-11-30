import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { fetchWorkers, fetchWorkOrders, updateWorker } from '../redux/actions';

const WorkerDetailsPage = () => {
    const { workerId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const workers = useSelector(state => state.workers);
    const workOrders = useSelector(state => state.workOrders);

    useEffect(() => {
        dispatch(fetchWorkers());
        dispatch(fetchWorkOrders());
    }, [dispatch]);

    const worker = workers.find(w => w.id === workerId);

    if (!worker) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-gray-500">Worker not found</p>
                    <button
                        onClick={() => navigate('/workers')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Workers
                    </button>
                </div>
            </div>
        );
    }

    const calculateTotalExpenses = () => {
        const commute = parseFloat(worker.commuteExpense) || 0;
        const shift = parseFloat(worker.shiftExpense) || 0;
        const meal = parseFloat(worker.mealExpense) || 0;
        const other = parseFloat(worker.otherExpenses) || 0;
        return commute + shift + meal + other;
    };

    // Calculate performance metrics
    const workerAssignments = workOrders.filter(wo => wo.assignedWorker === workerId || wo.assignedWorker === worker.name);
    const jobsCompleted = workerAssignments.filter(wo => wo.status === 'Completed').length;
    const servicesDelivered = workerAssignments.reduce((count, wo) => {
        return count + (wo.services?.length || 0);
    }, 0);

    // Get recent assignments
    const recentAssignments = workerAssignments.slice(0, 5);

    const handleMarkUnpaid = async () => {
        await dispatch(updateWorker(workerId, {
            lastPaid: null,
            paymentStatus: 'Unpaid'
        }));
    };

    const handleMarkPaid = async () => {
        await dispatch(updateWorker(workerId, {
            lastPaid: new Date().toISOString(),
            paymentStatus: 'Paid'
        }));
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                <div className="bg-white px-8 py-6 flex justify-between items-center sticky top-0 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800">{worker.name}</h2>
                    <button
                        onClick={() => navigate('/workers')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    {/* Contact Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact</h3>
                        <p className="text-gray-600">Phone: {worker.phone || 'N/A'}</p>
                    </div>

                    {/* Salary Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Salary</h3>
                        <div className="space-y-1 text-gray-600">
                            <p>Amount: RF {parseFloat(worker.salaryAmount || 0).toLocaleString()}</p>
                            <p>Frequency: {worker.salaryFrequency}</p>
                            <p>Last paid: {formatDate(worker.lastPaid)}</p>
                        </div>
                        {worker.paymentStatus === 'Paid' ? (
                            <button
                                onClick={handleMarkUnpaid}
                                className="mt-3 w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                                Mark Unpaid
                            </button>
                        ) : (
                            <button
                                onClick={handleMarkPaid}
                                className="mt-3 w-full py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                            >
                                Mark Paid
                            </button>
                        )}
                    </div>

                    {/* Performance Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Jobs completed</p>
                                <p className="text-2xl font-bold text-gray-900">{jobsCompleted}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Services delivered</p>
                                <p className="text-2xl font-bold text-gray-900">{servicesDelivered}</p>
                            </div>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Expenses</h3>
                        <div className="space-y-1 text-gray-600">
                            <p>Commute: RF {parseFloat(worker.commuteExpense || 0).toLocaleString()}</p>
                            <p>Shift: RF {parseFloat(worker.shiftExpense || 0).toLocaleString()}</p>
                            <p>Meal: RF {parseFloat(worker.mealExpense || 0).toLocaleString()}</p>
                            <p>Other: RF {parseFloat(worker.otherExpenses || 0).toLocaleString()}</p>
                            <p className="font-semibold text-gray-900 pt-2 border-t border-gray-200">
                                Total: RF {calculateTotalExpenses().toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile</h3>
                        <div className="space-y-1 text-gray-600">
                            <p>Created: {formatDate(worker.createdAt)}</p>
                            <p>Last updated: {formatDate(worker.updatedAt)}</p>
                        </div>
                    </div>

                    {/* Recent Assignments Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent assignments</h3>
                        {recentAssignments.length === 0 ? (
                            <p className="text-gray-500 text-sm">No assignments yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentAssignments.map((wo) => (
                                    <div key={wo.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-semibold text-gray-900">WO-{wo.id.slice(0, 5)}</div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${wo.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                                                    wo.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {wo.status || 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Logged on {formatDate(wo.arrivalDate)}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Services: {wo.services?.length || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Work order total: RF {parseFloat(wo.total || 0).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDetailsPage;
