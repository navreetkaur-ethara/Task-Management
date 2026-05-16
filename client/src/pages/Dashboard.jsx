import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, CheckCircle2, Clock, ListTodo, AlertCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tasks/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex-grow flex items-center justify-center text-gray-400">Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Tasks', value: stats?.totalTasks || 0, icon: <ListTodo className="w-6 h-6 text-blue-500" />, color: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'To Do', value: stats?.todoTasks || 0, icon: <AlertCircle className="w-6 h-6 text-gray-400" />, color: 'bg-gray-500/10 border-gray-500/20' },
    { title: 'In Progress', value: stats?.inProgressTasks || 0, icon: <TrendingUp className="w-6 h-6 text-yellow-500" />, color: 'bg-yellow-500/10 border-yellow-500/20' },
    { title: 'Done', value: stats?.doneTasks || 0, icon: <CheckCircle2 className="w-6 h-6 text-primary-500" />, color: 'bg-primary-500/10 border-primary-500/20' },
    { title: 'My Tasks', value: stats?.myTasks || 0, icon: <LayoutDashboard className="w-6 h-6 text-purple-500" />, color: 'bg-purple-500/10 border-purple-500/20' },
    { title: 'Overdue', value: stats?.overdueTasks || 0, icon: <Clock className="w-6 h-6 text-red-500" />, color: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Track your team's progress across all projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`card ${stat.color} hover:-translate-y-1 transition-transform duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-dark-900 shadow-inner`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Visual aesthetic filler */}
      <div className="mt-12 glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]"></div>
        <h2 className="text-xl font-bold text-white mb-4 relative z-10">Welcome to TaskMaster!</h2>
        <p className="text-gray-400 max-w-2xl relative z-10">
          Navigate to the Projects tab to create a new project or view your existing ones. Assign tasks to your team members and keep track of everyone's progress seamlessly.
        </p>
      </div>
    </div>
  );
}
