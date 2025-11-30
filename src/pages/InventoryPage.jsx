import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch, FaTrash, FaEdit } from 'react-icons/fa';
import AddInventoryModal from '../components/AddInventoryModal';
import EditInventoryModal from '../components/EditInventoryModal';
import { fetchInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../redux/actions';

const InventoryPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const dispatch = useDispatch();
    const inventoryItems = useSelector(state => state.inventoryItems);

    useEffect(() => {
        dispatch(fetchInventoryItems());
    }, [dispatch]);

    const handleAddItem = async (newItem) => {
        await dispatch(createInventoryItem(newItem));
        setIsAddModalOpen(false);
    };

    const handleEditItem = async (updatedData) => {
        if (selectedItem) {
            await dispatch(updateInventoryItem(selectedItem.id, updatedData));
            setIsEditModalOpen(false);
            setSelectedItem(null);
        }
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
            dispatch(deleteInventoryItem(id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage your parts and supplies</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 font-medium"
                >
                    <FaPlus /> Add Item
                </button>
            </div>

            {/* Filters/Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorder Point</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Cost</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inventoryItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No inventory items found. Add one above to get started.
                                    </td>
                                </tr>
                            ) : (
                                inventoryItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            {item.description && (
                                                <div className="text-xs text-gray-500">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${parseInt(item.quantityOnHand) <= parseInt(item.reorderPoint)
                                                    ? 'text-red-600'
                                                    : 'text-gray-900'
                                                }`}>
                                                {item.quantityOnHand}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.reorderPoint}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            RF {parseFloat(item.unitCost || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            RF {parseFloat(item.unitPrice || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
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

            <AddInventoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddItem}
            />

            <EditInventoryModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedItem(null);
                }}
                onUpdate={handleEditItem}
                item={selectedItem}
            />
        </div>
    );
};

export default InventoryPage;
