import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const EditInventoryModal = ({ isOpen, onClose, onUpdate, item }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        quantityOnHand: 0,
        reorderPoint: 0,
        unitCost: '',
        unitPrice: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                sku: item.sku || '',
                description: item.description || '',
                quantityOnHand: item.quantityOnHand || 0,
                reorderPoint: item.reorderPoint || 0,
                unitCost: item.unitCost || '',
                unitPrice: item.unitPrice || ''
            });
        }
    }, [item]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                <div className="bg-white px-8 py-6 flex justify-between items-center sticky top-0 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Edit Inventory Item</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity on Hand</label>
                        <input
                            type="number"
                            name="quantityOnHand"
                            value={formData.quantityOnHand}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                        <input
                            type="number"
                            name="reorderPoint"
                            value={formData.reorderPoint}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                        <input
                            type="number"
                            name="unitCost"
                            value={formData.unitCost}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                        <input
                            type="number"
                            name="unitPrice"
                            value={formData.unitPrice}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
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
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditInventoryModal;
