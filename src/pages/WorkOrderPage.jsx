import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch, FaEdit, FaCheck, FaTrash, FaPrint } from 'react-icons/fa';
import CreateWorkOrderModal from '../components/CreateWorkOrderModal';
import useWorkOrders from '../hooks/useWorkOrders';
import { fetchCustomers } from '../redux/actions';

const WorkOrderPage = () => {
    const dispatch = useDispatch();
    const customers = useSelector(state => state.customers || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkOrder, setEditingWorkOrder] = useState(null);
    const {
        workOrders,
        addWorkOrder,
        editWorkOrder,
        markWorkOrderComplete,
        removeWorkOrder,
        printQuotation,
        calculateTotal,
        getCustomerName
    } = useWorkOrders();

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    const pendingWorkOrders = workOrders.filter(wo => wo.status !== 'Completed');

    const handleCreateWorkOrder = async (newWorkOrder) => {
        await addWorkOrder(newWorkOrder);
        setIsModalOpen(false);
        setEditingWorkOrder(null);
    };

    const handleEditWorkOrder = async (id, updatedData) => {
        // Recalculate totals from updated form data
        const services = updatedData.services || [];
        const partsCost = services.filter(s => s.type === 'Part').reduce((acc, s) => acc + (Number(s.unitPrice) * Number(s.quantity)), 0);
        const labourCost = services.filter(s => s.type === 'Service').reduce((acc, s) => acc + (Number(s.unitPrice) * Number(s.quantity)), 0);
        const parking = Number(updatedData.financials.parking) || 0;
        const taxes = Number(updatedData.financials.taxes) || 0;
        const vat = Number(updatedData.financials.vat) || 0;
        const discount = Number(updatedData.financials.discount) || 0;
        const amountReceived = Number(updatedData.financials.amountReceived) || 0;

        const totalAmount = labourCost + partsCost + parking + taxes + vat - discount;
        const outstandingBalance = Math.max(0, totalAmount - amountReceived);

        const updates = {
            description: updatedData.job.description,
            arrival: updatedData.job.arrival,
            scheduled: updatedData.job.scheduled,
            workerId: updatedData.job.worker,
            internalNotes: updatedData.job.internalNotes,
            _tempVehicle: updatedData.vehicle,
            _tempCustomerName: updatedData.customer.name,
            _tempCustomerPhone: updatedData.customer.phone,
            lineItems: services,
            labourCost: labourCost,
            partsCost: partsCost,
            parkingCharge: parking,
            taxes: taxes,
            vat: vat,
            discount: discount,
            amountReceived: amountReceived,
            totalAmount: totalAmount,
            outstandingBalance: outstandingBalance,
            notes: updatedData.vehicle.notes
        };

        await editWorkOrder(id, updates);
        setIsModalOpen(false);
        setEditingWorkOrder(null);
    };

    const handleOpenEdit = (wo) => {
        // Prepare work order with customer info for the modal
        const workOrderWithCustomerInfo = {
            ...wo,
            _tempCustomerName: getCustomerName(wo.customerId, wo),
            _tempCustomerPhone: wo._tempCustomerPhone || ''
        };
        setEditingWorkOrder(workOrderWithCustomerInfo);
        setIsModalOpen(true);
    };

    const handleMarkComplete = (id) => {
        if (window.confirm('Are you sure you want to mark this work order as completed?')) {
            markWorkOrderComplete(id);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this work order?')) {
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
                    <h1 className="text-3xl font-bold text-gray-800">Work Orders</h1>
                    <p className="text-gray-500 mt-1">Manage and track all service jobs</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 font-medium"
                >
                    <FaPlus /> Create Work Order
                </button>
            </div>

            {/* Filters/Search Bar could go here */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search work orders..."
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Arrival</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingWorkOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No active work orders. Capture one above to get started.
                                    </td>
                                </tr>
                            ) : (
                                pendingWorkOrders.map((wo) => (
                                    <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{wo.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${wo.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
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
                                            {wo.arrival ? new Date(wo.arrival).toLocaleDateString() : 'N/A'}
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
                                                    onClick={() => handleOpenEdit(wo)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkComplete(wo.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Mark Complete"
                                                >
                                                    <FaCheck size={16} />
                                                </button>
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

            <CreateWorkOrderModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingWorkOrder(null);
                }}
                onCreate={handleCreateWorkOrder}
                workOrder={editingWorkOrder}
                onEdit={handleEditWorkOrder}
            />
        </div>
    );
};

export default WorkOrderPage;
