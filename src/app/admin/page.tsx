'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TrendingUp, CreditCard, Loader2, Calendar, CalendarDays } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const [totalProfit, setTotalProfit] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowserClient();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('status', 'paid');
      
      if (data && !error) {
        setTotalTransactions(data.length);
        
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD local time
        const thisMonthStr = todayStr.substring(0, 7); // YYYY-MM
        const thisYearStr = todayStr.substring(0, 4);  // YYYY

        let allTimeProfit = 0;
        let pToday = 0;
        let pMonth = 0;

        // Grouping maps
        const dailyMap: Record<string, number> = {};
        const monthlyMap: Record<string, number> = {};

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dailyMap[d.toLocaleDateString('en-CA')] = 0;
        }

        // Initialize 12 months for current year
        for (let i = 1; i <= 12; i++) {
          const m = i.toString().padStart(2, '0');
          monthlyMap[`${thisYearStr}-${m}`] = 0;
        }

        data.forEach(tx => {
          const amount = tx.amount || 0;
          allTimeProfit += amount;

          // Adjust created_at to local date for bucketing
          const d = new Date(tx.created_at);
          const dateStr = d.toLocaleDateString('en-CA');
          const monthStr = dateStr.substring(0, 7);

          if (dateStr === todayStr) pToday += amount;
          if (monthStr === thisMonthStr) pMonth += amount;

          // Add to daily if in map
          if (dailyMap[dateStr] !== undefined) {
            dailyMap[dateStr] += amount;
          }

          // Add to monthly if in map
          if (monthlyMap[monthStr] !== undefined) {
            monthlyMap[monthStr] += amount;
          }
        });

        setTotalProfit(allTimeProfit);
        setTodayProfit(pToday);
        setMonthProfit(pMonth);

        // Format for recharts
        const dData = Object.keys(dailyMap).map(key => {
           const d = new Date(key);
           return {
             name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
             pendapatan: dailyMap[key]
           };
        });
        setDailyData(dData);

        const mData = Object.keys(monthlyMap).map(key => {
           const d = new Date(`${key}-01`);
           return {
             name: d.toLocaleDateString('id-ID', { month: 'short' }),
             pendapatan: monthlyMap[key]
           };
        });
        setMonthlyData(mData);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // Format currency
  const formatRp = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Ringkasan performa dan pendapatan fotobooth Anda.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pendapatan */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pendapatan</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{formatRp(totalProfit)}</h2>
          </div>
        </div>

        {/* Pendapatan Bulan Ini */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bulan Ini</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{formatRp(monthProfit)}</h2>
          </div>
        </div>

        {/* Pendapatan Hari Ini */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hari Ini</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{formatRp(todayProfit)}</h2>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{totalTransactions}</h2>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Pendapatan 7 Hari Terakhir</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(value) => `Rp ${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRp(Number(value)), "Pendapatan"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pendapatan" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Pendapatan Tahun Ini</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(value) => `Rp ${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRp(Number(value)), "Pendapatan"]}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="pendapatan" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
