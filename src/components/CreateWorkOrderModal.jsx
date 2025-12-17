import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { fetchWorkers, fetchServiceItems, fetchInventoryItems } from '../redux/actions';

const CreateWorkOrderModal = ({ isOpen, onClose, onCreate, workOrder, onEdit }) => {
    const dispatch = useDispatch();
    const workers = useSelector(state => state.workers);
    const serviceItems = useSelector(state => state.serviceItems);
    const inventoryItems = useSelector(state => state.inventoryItems);

    const isEditMode = !!workOrder;

    const [formData, setFormData] = useState({
        customer: { name: '', phone: '' },
        vehicle: { vin: '', make: '', model: '', year: '', color: '', plate: '', notes: '' },
        job: { description: '', arrival: '', scheduled: '', worker: '', internalNotes: '' },
        financials: { parking: 0, taxes: 0, vat: 0, discount: 0, amountReceived: 0 },
        services: []
    });

    const [total, setTotal] = useState(0);

    // Fetch data when component mounts
    useEffect(() => {
        dispatch(fetchWorkers());
        dispatch(fetchServiceItems());
        dispatch(fetchInventoryItems());
    }, [dispatch]);

    useEffect(() => {
        if (isOpen) {
            if (workOrder) {
                // Populate form with existing work order data for editing
                setFormData({
                    customer: {
                        name: workOrder._tempCustomerName || '',
                        phone: workOrder._tempCustomerPhone || ''
                    },
                    vehicle: workOrder._tempVehicle || { vin: '', make: '', model: '', year: '', color: '', plate: '', notes: '' },
                    job: {
                        description: workOrder.description || '',
                        arrival: workOrder.arrival ? workOrder.arrival.slice(0, 16) : '',
                        scheduled: workOrder.scheduled || '',
                        worker: workOrder.workerId || '',
                        internalNotes: workOrder.internalNotes || ''
                    },
                    financials: {
                        parking: workOrder.parkingCharge || 0,
                        taxes: workOrder.taxes || 0,
                        vat: workOrder.vat || 0,
                        discount: workOrder.discount || 0,
                        amountReceived: workOrder.amountReceived || 0
                    },
                    services: workOrder.lineItems && workOrder.lineItems.length > 0
                        ? workOrder.lineItems
                        : [{ type: 'Service', catalog: 'Optional', name: '', quantity: 1, unitPrice: 0 }]
                });
            } else {
                // Reset form when modal opens for create
                setFormData({
                    customer: { name: '', phone: '' },
                    vehicle: { vin: '', make: '', model: '', year: '', color: '', plate: '', notes: '' },
                    job: { description: '', arrival: new Date().toISOString().slice(0, 16), scheduled: '', worker: '', internalNotes: '' },
                    financials: { parking: 0, taxes: 0, vat: 0, discount: 0, amountReceived: 0 },
                    services: [{ type: 'Service', catalog: 'Optional', name: '', quantity: 1, unitPrice: 0 }]
                });
            }
        }
    }, [isOpen, workOrder]);

    useEffect(() => {
        calculateTotal();
    }, [formData.services, formData.financials]);

    const calculateTotal = () => {
        const servicesTotal = formData.services.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
        const subtotal = servicesTotal + Number(formData.financials.parking);
        const totalAmount = subtotal + Number(formData.financials.taxes) + Number(formData.financials.vat) - Number(formData.financials.discount);
        setTotal(totalAmount);
    };

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...formData.services];
        newServices[index][field] = value;
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { type: 'Service', catalog: 'Optional', name: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const removeService = (index) => {
        const newServices = formData.services.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            onEdit(workOrder.id, { ...formData, total });
        } else {
            onCreate({ ...formData, total });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Work Order' : 'Create Work Order'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FaTimes size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Customer Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="e.g. Jane Smith"
                                    value={formData.customer.name}
                                    onChange={(e) => handleChange('customer', 'name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="Contact number"
                                    value={formData.customer.phone}
                                    onChange={(e) => handleChange('customer', 'phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Vehicle Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Vehicle Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">VIN *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="Vehicle Identification Number"
                                    value={formData.vehicle.vin}
                                    onChange={(e) => handleChange('vehicle', 'vin', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">License Plate</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="Optional plate number"
                                    value={formData.vehicle.plate}
                                    onChange={(e) => handleChange('vehicle', 'plate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Make *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="Manufacturer"
                                    value={formData.vehicle.make}
                                    onChange={(e) => handleChange('vehicle', 'make', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Model *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="Model"
                                    value={formData.vehicle.model}
                                    onChange={(e) => handleChange('vehicle', 'model', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Year</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="2025"
                                    value={formData.vehicle.year}
                                    onChange={(e) => handleChange('vehicle', 'year', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    value={formData.vehicle.color}
                                    onChange={(e) => handleChange('vehicle', 'color', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Vehicle Notes</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                rows="3"
                                placeholder="Optional notes (e.g. prior issues)"
                                value={formData.vehicle.notes}
                                onChange={(e) => handleChange('vehicle', 'notes', e.target.value)}
                            ></textarea>
                        </div>
                    </section>

                    {/* Job Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Job Details</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Description *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="Summary of the work"
                                value={formData.job.description}
                                onChange={(e) => handleChange('job', 'description', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Arrival *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    value={formData.job.arrival}
                                    onChange={(e) => handleChange('job', 'arrival', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Scheduled</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    value={formData.job.scheduled}
                                    onChange={(e) => handleChange('job', 'scheduled', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Assign Worker</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                value={formData.job.worker}
                                onChange={(e) => handleChange('job', 'worker', e.target.value)}
                            >
                                <option value="">Optional</option>
                                {workers.map((worker) => (
                                    <option key={worker.id} value={worker.id}>
                                        {worker.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Internal Notes</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                rows="3"
                                placeholder="Private notes for the workshop team"
                                value={formData.job.internalNotes}
                                onChange={(e) => handleChange('job', 'internalNotes', e.target.value)}
                            ></textarea>
                        </div>
                    </section>

                    {/* Financials */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Financials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Parking Charge</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    value={formData.financials.parking}
                                    onChange={(e) => handleChange('financials', 'parking', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Taxes</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    value={formData.financials.taxes}
                                    onChange={(e) => handleChange('financials', 'taxes', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">VAT</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="0"
                                    value={formData.financials.vat}
                                    onChange={(e) => handleChange('financials', 'vat', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Discount</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    value={formData.financials.discount}
                                    onChange={(e) => handleChange('financials', 'discount', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Amount Received (RF)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    placeholder="0"
                                    value={formData.financials.amountReceived || ''}
                                    onChange={(e) => handleChange('financials', 'amountReceived', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Services & Parts */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Services & Parts</h3>
                            <button
                                type="button"
                                onClick={addService}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <FaPlus size={14} /> Add Line
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.services.map((service, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="w-full md:w-1/6">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                            value={service.type}
                                            onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                                        >
                                            <option>Service</option>
                                            <option>Part</option>
                                        </select>
                                    </div>
                                    <div className="w-full md:w-1/6">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Catalog</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                            value={service.catalog}
                                            onChange={(e) => {
                                                handleServiceChange(index, 'catalog', e.target.value);
                                                // Auto-fill details when catalog item is selected
                                                if (e.target.value && e.target.value !== 'Optional') {
                                                    const catalogItems = service.type === 'Service' ? serviceItems : inventoryItems;
                                                    const selectedItem = catalogItems.find(item => item.id === e.target.value);
                                                    if (selectedItem) {
                                                        handleServiceChange(index, 'name', selectedItem.name || selectedItem.description || '');
                                                        handleServiceChange(index, 'unitPrice', selectedItem.defaultPrice || selectedItem.unitPrice || 0);
                                                    }
                                                }
                                            }}
                                        >
                                            <option value="Optional">Optional</option>
                                            {service.type === 'Service'
                                                ? serviceItems.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name} - RF {item.defaultPrice || 0}
                                                    </option>
                                                ))
                                                : inventoryItems.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name} - RF {item.unitPrice || 0}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="w-full md:w-1/3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                            placeholder="Service description"
                                            value={service.name}
                                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-1/6">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                            value={service.quantity}
                                            onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-1/6">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                            value={service.unitPrice}
                                            onChange={(e) => handleServiceChange(index, 'unitPrice', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeService(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Summary */}
                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">RF {(formData.services.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0) + Number(formData.financials.parking)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VAT:</span>
                                <span className="font-medium">RF {(Number(formData.financials.vat) || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total:</span>
                                <span className="font-bold text-blue-600 text-lg">RF {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Amount Received:</span>
                                <span className="font-medium text-green-600">RF {(Number(formData.financials.amountReceived) || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="font-medium">Outstanding Balance:</span>
                                <span className={`font-bold text-lg ${(total - (Number(formData.financials.amountReceived) || 0)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    RF {Math.max(0, total - (Number(formData.financials.amountReceived) || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
                        >
                            {isEditMode ? 'Update Work Order' : 'Create Work Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkOrderModal;
