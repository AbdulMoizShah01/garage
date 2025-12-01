import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWorkOrders,
    fetchSpendings,
    fetchInventoryItems,
    fetchWorkers,
    fetchServiceItems,
    fetchCustomers
} from '../redux/actions';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { FaDownload, FaInfoCircle, FaTruck, FaTools, FaBoxOpen } from 'react-icons/fa';

const InsightsPage = () => {
    const dispatch = useDispatch();

    // Selectors
    const workOrders = useSelector(state => state.workOrders || []);
    const spendings = useSelector(state => state.spendings || []);
    const inventoryItems = useSelector(state => state.inventoryItems || []);
    const workers = useSelector(state => state.workers || []);
    const customers = useSelector(state => state.customers || []);

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchWorkOrders());
        dispatch(fetchSpendings());
        dispatch(fetchInventoryItems());
        dispatch(fetchWorkers());
        dispatch(fetchServiceItems());
        dispatch(fetchCustomers());
    }, [dispatch]);

    // Calculations
    const metrics = useMemo(() => {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // Filter data for last 6 months
        const recentWorkOrders = workOrders.filter(wo => new Date(wo.createdAt) >= sixMonthsAgo && wo.status === 'Completed');
        const recentSpendings = spendings.filter(s => new Date(s.date) >= sixMonthsAgo);

        // 1. Net Earned (Revenue from completed work orders)
        const netEarned = recentWorkOrders.reduce((sum, wo) => {
            const total = Number(wo.totalAmount) ||
                ((Number(wo.labourCost) || 0) +
                    (Number(wo.partsCost) || 0) +
                    (Number(wo.parkingCharge) || 0) +
                    (Number(wo.taxes) || 0) -
                    (Number(wo.discount) || 0));
            return sum + total;
        }, 0);

        // 2. Net Expense
        // a. Parts Cost (Cost of goods sold)
        // Note: This assumes work orders have line items with cost data or we look up from inventory
        // For simplicity/robustness, we'll estimate based on inventory items used if direct cost isn't on WO
        // But ideally WO line items should snapshot the cost at time of service. 
        // Let's assume WO line items have 'cost' or we sum up 'unitCost' from inventory for now.
        // Since WO structure might vary, let's look at what we have. 
        // If WO doesn't have cost, we might need to approximate or use a margin.
        // Let's assume for now we can get it or use a proxy (e.g. 70% of parts revenue is cost if not tracked).
        // Better: Calculate from Spendings + Workforce + Estimated Parts Cost.

        // Let's calculate Parts Revenue first to estimate cost if needed
        // const partsRevenue = recentWorkOrders.reduce((sum, wo) => {
        //     return sum + (wo.lineItems?.filter(item => item.type === 'Part').reduce((s, i) => s + (i.price * i.quantity), 0) || 0);
        // }, 0);

        // Workforce Cost (Salary * 6 months)
        const monthlyWorkforceCost = workers.reduce((sum, w) => {
            const salary = Number(w.salaryAmount) || 0;
            const expenses = (Number(w.commuteExpense) || 0) + (Number(w.shiftExpense) || 0) + (Number(w.mealExpense) || 0) + (Number(w.otherExpenses) || 0);
            return sum + salary + expenses;
        }, 0);
        const totalWorkforceCost = monthlyWorkforceCost * 6;

        // Spendings (Operational expenses)
        const totalSpendings = recentSpendings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

        // Total Expenses (Simplified: Workforce + Spendings + (Revenue - Profit? No, let's use Spendings + Workforce as base operational cost))
        // If we don't have exact COGS for parts on WO, we might underreport expenses. 
        // Let's assume "Net Expense" in the design refers to "Parts + workforce budget" as per subtitle.
        // So we need Parts Cost.
        // Let's try to sum up cost from inventory items if possible, or use a placeholder if data is missing.
        // For this implementation, let's assume we sum up all 'Spendings' marked as 'Oil Acquire' or similar + Workforce.
        // AND we should probably include the cost of parts used in WOs.
        // Let's approximate Parts Cost as 60% of Parts Revenue if exact cost isn't stored.

        let partsCost = 0;
        recentWorkOrders.forEach(wo => {
            if (wo.lineItems) {
                wo.lineItems.forEach(item => {
                    if (item.type === 'Part') {
                        // Try to find current cost in inventory
                        const invItem = inventoryItems.find(i => i.id === item.itemId || i.name === item.name);
                        const unitCost = invItem ? (Number(invItem.unitCost) || 0) : 0;
                        partsCost += unitCost * (item.quantity || 1);
                    }
                });
            }
        });

        const netExpense = partsCost + totalWorkforceCost + totalSpendings;

        // 3. Net Profit
        const netProfit = netEarned - netExpense;

        // 4. Profit Margin
        const profitMargin = netEarned > 0 ? (netProfit / netEarned) * 100 : 0;

        // 5. Counts
        const vehiclesCount = customers.length; // Or unique VINs from WOs
        const servicesDelivered = recentWorkOrders.reduce((sum, wo) => {
            return sum + (wo.lineItems?.filter(i => i.type === 'Service').length || 0);
        }, 0);
        const partsSold = recentWorkOrders.reduce((sum, wo) => {
            return sum + (wo.lineItems?.filter(i => i.type === 'Part').reduce((s, i) => s + (i.quantity || 1), 0) || 0);
        }, 0);

        return {
            netEarned,
            netExpense,
            netProfit,
            profitMargin,
            totalSpendings,
            vehiclesCount,
            servicesDelivered,
            partsSold,
            partsCost,
            totalWorkforceCost
        };
    }, [workOrders, spendings, workers, inventoryItems, customers]);

    // Chart Data Preparation
    const chartData = useMemo(() => {
        const data = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short', year: 'numeric' });

            // Filter for this month
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthlyRevenue = workOrders
                .filter(wo => {
                    const woDate = new Date(wo.createdAt);
                    return woDate >= monthStart && woDate <= monthEnd && wo.status === 'Completed';
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

            const monthlySpendings = spendings
                .filter(s => {
                    const sDate = new Date(s.date);
                    return sDate >= monthStart && sDate <= monthEnd;
                })
                .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

            // Monthly Workforce (Fixed approximation)
            const monthlyWorkforce = workers.reduce((sum, w) => {
                const salary = Number(w.salaryAmount) || 0;
                const expenses = (Number(w.commuteExpense) || 0) + (Number(w.shiftExpense) || 0) + (Number(w.mealExpense) || 0) + (Number(w.otherExpenses) || 0);
                return sum + salary + expenses;
            }, 0);

            // Monthly Parts Cost (Approximation based on WOs in that month)
            let monthlyPartsCost = 0;
            workOrders
                .filter(wo => {
                    const woDate = new Date(wo.createdAt);
                    return woDate >= monthStart && woDate <= monthEnd && wo.status === 'Completed';
                })
                .forEach(wo => {
                    if (wo.lineItems) {
                        wo.lineItems.forEach(item => {
                            if (item.type === 'Part') {
                                const invItem = inventoryItems.find(i => i.id === item.itemId || i.name === item.name);
                                const unitCost = invItem ? (Number(invItem.unitCost) || 0) : 0;
                                monthlyPartsCost += unitCost * (item.quantity || 1);
                            }
                        });
                    }
                });

            const monthlyExpenses = monthlySpendings + monthlyWorkforce + monthlyPartsCost;

            data.push({
                name: monthName,
                Revenue: monthlyRevenue,
                Expenses: monthlyExpenses
            });
        }
        return data;
    }, [workOrders, spendings, workers, inventoryItems]);

    const pieData = [
        { name: 'Parts', value: metrics.partsCost, color: '#3B82F6' },
        { name: 'Workforce', value: metrics.totalWorkforceCost, color: '#F97316' },
        { name: 'Spendings', value: metrics.totalSpendings, color: '#22C55E' }
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Business Insights</h1>
                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm">
                    <FaDownload size={14} /> Export Report
                </button>
            </div>

            {/* Top Row Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Net Earned */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-500 font-bold">$</span>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">NET EARNED</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">RF {metrics.netEarned.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Completed orders - last 6 months</span>
                        <FaInfoCircle size={10} />
                    </div>
                </div>

                {/* Net Expense */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-500 font-bold">📉</span>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">NET EXPENSE</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">RF {metrics.netExpense.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Parts + workforce budget</span>
                        <FaInfoCircle size={10} />
                    </div>
                </div>

                {/* Net Profit */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 relative">
                    <div className="absolute top-4 right-4 text-blue-500 font-bold text-xs border border-blue-200 rounded-full px-2 py-0.5">
                        100%
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-500 font-bold">📈</span>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">NET PROFIT</h3>
                    </div>
                    <p className={`text-2xl font-bold mb-1 ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.netProfit < 0 ? '-' : ''}RF {Math.abs(metrics.netProfit).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Earned minus expenses</span>
                        <FaInfoCircle size={10} />
                    </div>
                </div>

                {/* Spendings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-500 font-bold">⏱️</span>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SPENDINGS</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">RF {metrics.totalSpendings.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Operational expenses (6 mo)</span>
                        <FaInfoCircle size={10} />
                    </div>
                </div>
            </div>

            {/* Second Row Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vehicles */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                        <FaTruck className="text-blue-400" />
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">VEHICLES</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">{metrics.vehiclesCount}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Total on record</span>
                        <FaInfoCircle size={10} />
                    </div>
                </div>

                {/* Services Delivered */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                        <FaTools className="text-blue-400" />
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SERVICES DELIVERED</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">{metrics.servicesDelivered}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Line items sold</span>
                        <FaInfoCircle size={10} />
                    </div>
                </div>

                {/* Parts Sold */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                        <FaBoxOpen className="text-blue-400" />
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">PARTS SOLD</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">{metrics.partsSold}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Line items sold</span>
                        <FaInfoCircle size={10} />
                    </div>
                </div>
            </div>

            {/* Profit Margin Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">↗</span>
                        <h3 className="text-sm font-bold text-gray-800">Profit Margin</h3>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{metrics.profitMargin.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full ${metrics.profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(metrics.profitMargin), 100)}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">Loss based on net earned vs expenses</p>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue vs Expenses Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-blue-500">📊</span>
                            <h3 className="text-sm font-bold text-gray-800">Revenue vs Expenses</h3>
                        </div>
                        <span className="text-xs text-gray-400">Last 6 months</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `RF ${value / 1000}k`} />
                                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`RF ${value.toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="Expenses" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-blue-500 font-medium">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-xs text-orange-500 font-medium">Expenses</span>
                        </div>
                    </div>
                </div>

                {/* Expense Mix Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-blue-500">pie</span>
                        <h3 className="text-sm font-bold text-gray-800">Expense Mix</h3>
                    </div>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `RF ${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="text-sm font-bold text-gray-800">RF {(metrics.netExpense / 1000).toFixed(1)}k</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
                                <span className="text-xs text-gray-400">
                                    ({((entry.value / metrics.netExpense) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsPage;
