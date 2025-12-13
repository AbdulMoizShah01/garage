import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch, FaTrash, FaEdit } from 'react-icons/fa';
import AddMetadataModal from '../components/AddMetadataModal';
import { fetchCustomers, createCustomer, deleteCustomer, updateCustomer, fetchWorkOrders } from '../redux/actions';

const MetaData = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const dispatch = useDispatch();
  const customers = useSelector(state => state.customers);
  const workOrders = useSelector(state => state.workOrders || []);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchWorkOrders());
  }, [dispatch]);

  const handleAddMetadata = async (formData) => {
    // Combine customer and vehicle data
    const customerData = {
      name: formData.name.trim(),
      phone: formData.phone || '',
      email: formData.email || '',
      notes: formData.notes || '',
      vehicle: {
        vin: formData.vin || '',
        make: formData.make || '',
        model: formData.model || '',
        year: formData.year || new Date().getFullYear(),
        plate: formData.plate || ''
      },
      // Payment information
      paidAmount: parseFloat(formData.paidAmount) || 0,
      totalBilled: parseFloat(formData.totalBilled) || 0,
      outstandingBalance: parseFloat(formData.outstandingBalance) || 0,
      // Preserve other existing fields - use || 0 or || [] to avoid undefined
      activeWorkOrders: (selectedCustomer && selectedCustomer.activeWorkOrders) || 0,
      totalWorkOrders: (selectedCustomer && selectedCustomer.totalWorkOrders) || 0,
      recentWorkOrders: (selectedCustomer && selectedCustomer.recentWorkOrders) || [],
      createdAt: (selectedCustomer && selectedCustomer.createdAt) || new Date().toISOString()
    };

    if (selectedCustomer) {
      await dispatch(updateCustomer(selectedCustomer.id, customerData));
    } else {
      await dispatch(createCustomer(customerData));
    }
    setIsAddModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this metadata entry?')) {
      dispatch(deleteCustomer(id));
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.vehicle?.plate?.toLowerCase().includes(searchLower) ||
      customer.vehicle?.vin?.toLowerCase().includes(searchLower) ||
      customer.vehicle?.make?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Metadata</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 font-medium"
        >
          <FaPlus /> Add Metadata
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, plate, VIN, make..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No metadata entries found. Add one above to get started.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              {/* Header with customer name and actions */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                <p className="text-sm font-medium text-gray-700">
                  {customer.vehicle ? `${customer.vehicle.year} ${customer.vehicle.make} ${customer.vehicle.model}` : 'No vehicle info'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  VIN: {customer.vehicle?.vin || 'N/A'}
                </p>
                {customer.vehicle?.plate && (
                  <p className="text-xs text-gray-500">
                    Plate: {customer.vehicle.plate}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Contact</p>
                <p className="text-sm text-gray-700">{customer.phone}</p>
                {customer.email && (
                  <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">
                  {customer.activeWorkOrders || 0} active
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                  {customer.totalWorkOrders || 0} total
                </span>
              </div>

              {/* Payment Info */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Payment Information</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Billed:</span>
                    <span className="font-medium text-gray-800">RF {(customer.totalBilled || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="font-medium text-green-600">RF {(customer.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-gray-100">
                    <span className="text-gray-700 font-medium">Outstanding:</span>
                    <span className={`font-bold ${(customer.outstandingBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      RF {(customer.outstandingBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Work Orders */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Recent Work Orders</p>
                {(() => {
                  const customerWorkOrders = workOrders
                    .filter(wo => wo.customerId === customer.id)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3);

                  return customerWorkOrders.length > 0 ? (
                    <div className="space-y-1">
                      {customerWorkOrders.map((wo) => (
                        <div key={wo.id} className="flex justify-between items-center">
                          <span className="text-xs text-blue-600 font-medium">#{wo.id.slice(0, 8)}</span>
                          <span className="text-xs text-gray-600">
                            {wo.status} - RF {wo.totalAmount || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No work orders yet</p>
                  );
                })()}
              </div>
            </div>
          ))
        )}
      </div>

      <AddMetadataModal
        key={selectedCustomer ? selectedCustomer.id : 'new'}
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddMetadata}
        initialData={selectedCustomer}
      />
    </div>
  );
};

export default MetaData;
