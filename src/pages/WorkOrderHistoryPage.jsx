import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaPrint, FaTrash } from 'react-icons/fa';
import useWorkOrders from '../hooks/useWorkOrders';
import { fetchCustomers } from '../redux/actions';

const WorkOrderHistoryPage = () => {
    const dispatch = useDispatch();
    const customers = useSelector(state => state.customers || []);
    const {
        workOrders,
        removeWorkOrder,
        printQuotation,
        calculateTotal,
        getCustomerName
    } = useWorkOrders();

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    const completedWorkOrders = workOrders.filter(wo => wo.status === 'Completed');

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this work order history?')) {
            removeWorkOrder(id);
        }
    };

    const getVehicleInfo = (wo) => {
        return wo._tempVehicle ? `${wo._tempVehicle.make} ${wo._tempVehicle.model}` : 'N/A';
    };

    // Get customer's outstanding balance from their stored payment data
    const getCustomerOutstanding = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return 0;

        // Calculate from stored values
        const totalBilled = Number(customer.totalBilled) || 0;
        const paidAmount = Number(customer.paidAmount) || 0;
        return Math.max(0, totalBilled - paidAmount);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Work Order History</h1>
                    <p className="text-gray-500 mt-1">View past service jobs</p>
                </div>
            </div>

            {/* Filters/Search Bar could go here */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
            </div>

            {/* Work Orders List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {completedWorkOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No completed work orders found.
                                    </td>
                                </tr>
                            ) : (
                                completedWorkOrders.map((wo) => (
                                    <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{wo.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                                {wo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="font-medium text-gray-900">{getCustomerName(wo.customerId, wo)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="font-medium text-gray-900">{getVehicleInfo(wo)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {wo.completedDate ? new Date(wo.completedDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            RF {calculateTotal(wo).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {(() => {
                                                const outstanding = getCustomerOutstanding(wo.customerId);
                                                return (
                                                    <span className={outstanding > 0 ? 'text-red-600' : 'text-green-600'}>
                                                        RF {outstanding.toLocaleString()}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => printQuotation(wo)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Print Quotation"
                                                >
                                                    <FaPrint size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(wo.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorkOrderHistoryPage;
