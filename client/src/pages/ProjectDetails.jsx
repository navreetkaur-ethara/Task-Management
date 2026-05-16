import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';
import { Users, Plus, ArrowLeft, UserPlus, X } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`),
        axios.get(`http://localhost:5000/api/tasks/project/${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await axios.post('http://localhost:5000/api/tasks', { ...newTask, project: id });
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
      fetchProjectAndTasks();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await axios.put(`http://localhost:5000/api/projects/${id}/members`, { email: newMemberEmail });
      setIsMemberModalOpen(false);
      setNewMemberEmail('');
      fetchProjectAndTasks();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex-grow flex items-center justify-center text-gray-400">Loading project...</div>;
  if (error) return <div className="flex-grow flex items-center justify-center text-red-400">{error}</div>;

  const isAdmin = project.admin?._id === user.id;

  return (
    <div className="max-w-7xl mx-auto w-full p-6">
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              {isAdmin && <span className="px-2 py-1 text-xs font-bold rounded-md bg-primary-500/20 text-primary-400 border border-primary-500/20">Admin</span>}
            </div>
            <p className="text-gray-400 max-w-2xl">{project.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-4">
              {project.members.slice(0, 5).map(member => (
                <div key={member._id} className="w-8 h-8 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-gray-300" title={member.name}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-dark-800 border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-gray-400">
                  +{project.members.length - 5}
                </div>
              )}
            </div>
            
            {isAdmin && (
              <>
                <button onClick={() => setIsMemberModalOpen(true)} className="btn-secondary flex items-center gap-2 text-sm px-3 py-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Member</span>
                </button>
                <button onClick={() => setIsTaskModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-3 py-1.5">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Task</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <TaskBoard tasks={tasks} project={project} fetchTasks={fetchProjectAndTasks} />

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modalError && <div className="text-red-400 text-sm mb-4 bg-red-500/10 p-2 rounded">{modalError}</div>}
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input type="text" className="input-field" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea className="input-field min-h-[80px]" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                  <select className="input-field" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                  <input type="date" className="input-field" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Assign To</label>
                <select className="input-field" value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Team Member</h2>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modalError && <div className="text-red-400 text-sm mb-4 bg-red-500/10 p-2 rounded">{modalError}</div>}
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User Email</label>
                <input type="email" className="input-field" placeholder="user@example.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
