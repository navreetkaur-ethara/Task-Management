import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MoreHorizontal, Calendar, AlertCircle } from 'lucide-react';

const priorityColors = {
  High: 'bg-red-500/10 text-red-400 border-red-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Low: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function TaskBoard({ tasks, project, fetchTasks }) {
  const { user } = useContext(AuthContext);
  const [updating, setUpdating] = useState(null);

  const statuses = ['To Do', 'In Progress', 'Done'];

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const isAdmin = project.admin?.id === user.id || project.admin === user.id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {statuses.map(status => (
        <div key={status} className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/50 min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-200">{status}</h3>
            <span className="bg-dark-800 text-gray-400 text-xs px-2 py-1 rounded-full">
              {tasks.filter(t => t.status === status).length}
            </span>
          </div>
          
          <div className="space-y-4">
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} className="card p-4 hover:border-primary-500/30 transition-colors group relative cursor-grab active:cursor-grabbing">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded-md border ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  {/* Status Dropdown (only if assigned or admin) */}
                  {(isAdmin || task.assignedTo?.id === user.id) && (
                    <select 
                      className="bg-dark-900 text-gray-400 text-xs rounded border border-dark-700 p-1 focus:ring-primary-500"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      disabled={updating === task.id}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <h4 className="font-bold text-white mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{task.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700/50">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                  {task.assignedTo && (
                    <div 
                      className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-500 flex items-center justify-center text-xs font-bold border border-primary-500/30"
                      title={task.assignedTo.name}
                    >
                      {task.assignedTo.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
