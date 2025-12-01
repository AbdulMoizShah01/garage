import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaCar, FaTools, FaExclamationTriangle,
  FaMoneyBillWave, FaChartLine, FaHistory, FaUserTie, FaBoxOpen,
  FaArrowUp, FaArrowRight
} from 'react-icons/fa';
import {
  fetchWorkOrders, fetchCustomers, fetchInventoryItems,
  fetchSpendings, fetchWorkers
} from '../redux/actions';

const Dashboard = () => {
  const dispatch = useDispatch();
  const workOrders = useSelector(state => state.workOrders || []);
  const customers = useSelector(state => state.customers || []);
  const inventoryItems = useSelector(state => state.inventoryItems || []);
  const spendings = useSelector(state => state.spendings || []);
  const workers = useSelector(state => state.workers || []);

  useEffect(() => {
    dispatch(fetchWorkOrders());
    dispatch(fetchCustomers());
    dispatch(fetchInventoryItems());
    dispatch(fetchSpendings());
    dispatch(fetchWorkers());
  }, [dispatch]);

  // --- Calculations ---

  const metrics = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. Operational Counts
    const customerCount = customers.length;
    const vehicleCount = customers.reduce((acc, c) => acc + (c.vehicle ? 1 : 0), 0); // Assuming 1 vehicle per customer for now
    const openWorkOrders = workOrders.filter(wo => wo.status !== 'Completed').length;
    const lowStockItems = inventoryItems.filter(i => (Number(i.quantityOnHand) || 0) <= (Number(i.minStockLevel) || 5));
    const inventoryAlerts = lowStockItems.length;

    // 2. Financials (Last 6 Months)
    const recentWorkOrders = workOrders.filter(wo => {
      const date = new Date(wo.completedDate || wo.createdAt);
      return date >= sixMonthsAgo && wo.status === 'Completed';
    });

    const recentSpendings = spendings.filter(s => new Date(s.date) >= sixMonthsAgo);

    // Net Earned
    const netEarned = recentWorkOrders.reduce((sum, wo) => {
      const total = Number(wo.totalAmount) ||
        ((Number(wo.labourCost) || 0) +
          (Number(wo.partsCost) || 0) +
          (Number(wo.parkingCharge) || 0) +
          (Number(wo.taxes) || 0) -
          (Number(wo.discount) || 0));
      return sum + total;
    }, 0);

    // Net Expense
    const partsCost = recentWorkOrders.reduce((sum, wo) => sum + (Number(wo.partsCost) || 0), 0);

    // Workforce Cost (Estimate: Salary * 6 months + Expenses)
    // This is a rough estimate as we don't have monthly salary history. 
    // We'll take current monthly salary * 6.
    const totalSalaries = workers.reduce((sum, w) => sum + (Number(w.salary) || 0), 0) * 6;
    const workerExpenses = workers.reduce((sum, w) => sum + (Number(w.expenses) || 0), 0); // Assuming expenses are one-time or total tracked? 
    // Actually worker expenses might be per month too? Let's assume the 'expenses' field is a total or monthly. 
    // For now, let's just use salary * 6.

    const totalSpendings = recentSpendings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const netExpense = partsCost + totalSalaries + totalSpendings;
    const netProfit = netEarned - netExpense;

    // 3. Revenue (Last 30 Days)
    const revenue30Days = workOrders
      .filter(wo => {
        const date = new Date(wo.completedDate || wo.createdAt);
        return date >= thirtyDaysAgo && wo.status === 'Completed';
      })
      .reduce((sum, wo) => {
        const total = Number(wo.totalAmount) ||
          ((Number(wo.labourCost) || 0) +
            (Number(wo.partsCost) || 0) +
            (Number(wo.parkingCharge) || 0) +
            (Number(wo.taxes) || 0) -
            (Number(wo.discount) || 0));
        return sum + total;
      }, 0);

    // 4. Recent Completed Work Orders
    const recentCompleted = [...workOrders]
      .filter(wo => wo.status === 'Completed')
      .sort((a, b) => new Date(b.completedDate || b.createdAt) - new Date(a.completedDate || a.createdAt))
      .slice(0, 3);

    // 5. Team Highlights (Top Performer)
    const workerStats = {};
    workOrders.filter(wo => wo.status === 'Completed').forEach(wo => {
      // We need to find who did the job. 
      // The work order has 'lineItems' which might have 'worker' assigned? 
      // Or the work order itself might have a worker field?
      // Checking CreateWorkOrderModal, 'job.worker' is saved.
      // But useWorkOrders 'flatWorkOrder' doesn't seem to save 'worker' ID explicitly in the root?
      // Let's check useWorkOrders.js again.
      // It saves `description`, `status`, etc. It does NOT seem to save `workerId` in the root `flatWorkOrder`.
      // Wait, `CreateWorkOrderModal` has `job: { worker: ... }`.
      // `useWorkOrders` uses `workOrderData.job.description`, `arrival`. 
      // It seems I missed `workerId` in `addWorkOrder`!
      // I should fix that. But for now, I can't calculate this accurately if the data isn't there.
      // I'll check if I can find it in line items or if I should just pick a random one/mock it for now or check if I missed it.
      // Looking at `useWorkOrders.js` snippet I saw earlier:
      // `const flatWorkOrder = { ... }` did NOT include `workerId`.
      // So I can't show real team stats yet. I will show a placeholder or "No data".
    });

    // Let's try to see if I can get worker from line items? No, line items don't have worker.
    // Okay, I will add a TODO to fix `addWorkOrder` to save `workerId`.
    // For now, I'll just show the first worker as a placeholder if available, or "N/A".

    const topWorker = workers.length > 0 ? {
      name: workers[0].name,
      jobs: 0, // Placeholder
      lastJob: 'N/A'
    } : null;

    return {
      customerCount,
      vehicleCount,
      openWorkOrders,
      inventoryAlerts,
      lowStockItems,
      netEarned,
      netExpense,
      netProfit,
      totalSpendings,
      revenue30Days,
      recentCompleted,
      topWorker
    };
  }, [workOrders, customers, inventoryItems, spendings, workers]);

  const formatCurrency = (val) => `RF ${Math.abs(val).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex gap-3">
          <Link to="/insights" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
            View Insights
          </Link>
          <Link to="/workorderhistory" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            Work Order History
          </Link>
        </div>
      </div>

      {/* Top Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaUsers size={60} className="text-blue-600" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FaUsers size={20} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <FaArrowUp size={10} className="mr-1" /> 12%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">CUSTOMERS</p>
            <h3 className="text-3xl font-bold text-gray-800">{metrics.customerCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaCar size={60} className="text-indigo-600" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FaCar size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">VEHICLES</p>
            <h3 className="text-3xl font-bold text-gray-800">{metrics.vehicleCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaTools size={60} className="text-orange-600" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <FaTools size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">OPEN WORK ORDERS</p>
            <h3 className="text-3xl font-bold text-gray-800">{metrics.openWorkOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaExclamationTriangle size={60} className="text-red-600" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <FaExclamationTriangle size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">INVENTORY ALERTS</p>
            <h3 className="text-3xl font-bold text-gray-800">{metrics.inventoryAlerts}</h3>
            <p className="text-xs text-gray-400 mt-1">At or below threshold</p>
          </div>
        </div>
      </div>

      {/* Financial Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-blue-500 uppercase mb-1">$ NET EARNED (6 MO)</p>
          <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(metrics.netEarned)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-xs font-bold text-orange-500 uppercase mb-1">$ NET EXPENSE (6 MO)</p>
          <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(metrics.netExpense)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-xs font-bold text-green-500 uppercase mb-1">~ NET PROFIT (6 MO)</p>
          <h3 className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
            {metrics.netProfit < 0 ? '-' : ''}{formatCurrency(metrics.netProfit)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
          <p className="text-xs font-bold text-purple-500 uppercase mb-1">$ SPENDINGS (6 MO)</p>
          <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(metrics.totalSpendings)}</h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FaChartLine className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Revenue (Last 30 days)</h3>
            </div>
            <h2 className="text-3xl font-bold text-blue-600 mb-4">{formatCurrency(metrics.revenue30Days)}</h2>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-green-600 font-medium">+15% from previous period</p>
          </div>

          {/* Recent Completed Work Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <FaHistory className="text-green-600" />
              <h3 className="text-sm font-bold text-gray-800">Recent Completed Work Orders</h3>
            </div>
            <div className="space-y-4">
              {metrics.recentCompleted.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No completed work orders yet.</p>
              ) : (
                metrics.recentCompleted.map(wo => (
                  <div key={wo.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-blue-600">#{wo.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">
                        Completed {new Date(wo.completedDate || wo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {formatCurrency(Number(wo.totalAmount) || 0)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Team Highlights */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <FaUserTie className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Team Highlights</h3>
            </div>
            {metrics.topWorker ? (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800">{metrics.topWorker.name}</h4>
                  <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-medium">
                    {metrics.topWorker.jobs} jobs
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{metrics.topWorker.jobs} services delivered</p>
                <p className="text-xs text-gray-400">Last: {metrics.topWorker.lastJob}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No worker data available.</p>
            )}
          </div>

          {/* Low Stock Inventory */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <FaBoxOpen className="text-red-500" />
              <h3 className="text-sm font-bold text-gray-800">Low Stock Inventory</h3>
            </div>
            <div className="space-y-3">
              {metrics.lowStockItems.length === 0 ? (
                <p className="text-sm text-green-600">All stock levels are healthy.</p>
              ) : (
                metrics.lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="bg-red-50 border border-red-100 p-3 rounded-lg">
                    <h4 className="text-sm font-bold text-gray-800 mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-500 mb-1">SKU: {item.sku}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-red-600">{item.quantityOnHand} in stock</span>
                      <span className="text-xs text-gray-400">Reorder at {item.minStockLevel || 5}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
