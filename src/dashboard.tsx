import React, { useState, useEffect } from 'react';
import './style.css';

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  effort?: string; // HH:MM
  loggedHours?: string;
  completedDate?: string;
  type?: string;
  assignedTo?: string;
  assignedBy?: string;
}

interface DashboardProps {
  onLogout: () => void;
  user?: {
    Id: number;
    FullName: string;
    Email: string;
    Role: string;
    DOB?: string;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Complete Project Proposal',
      description: 'Prepare and finalize the Q2 project proposal',
      deadline: '2026-02-15',
      status: 'In Progress',
      priority: 'High',
      effort: '08:00',
      loggedHours: '02:30',
      completedDate: '',
      type: 'Documentation',
      assignedTo: 'Sahil',
      assignedBy: 'Manager'
    },

    {
      id: 2,
      title: 'Review Team Feedback',
      description: 'Review and analyze feedback from team members',
      deadline: '2026-02-10',
      status: 'Pending',
      priority: 'Medium',
      effort: '03:00',
      loggedHours: '00:45',
      completedDate: '',
      type: 'Review',
      assignedTo: 'Asha',
      assignedBy: 'Sahil'
    },

    {
      id: 3,
      title: 'Database Migration',
      description: 'Migrate legacy database to new system',
      deadline: '2026-02-20',
      status: 'Pending',
      priority: 'High',
      effort: '16:00',
      loggedHours: '01:15',
      completedDate: '',
      type: 'Migration',
      assignedTo: 'Ravi',
      assignedBy: 'Lead'
    },

    {
      id: 4,
      title: 'Training Documentation',
      description: 'Update training documentation and guides',
      deadline: '2026-02-12',
      status: 'Completed',
      priority: 'Low',
      effort: '05:00',
      loggedHours: '05:00',
      completedDate: '2026-02-12',
      type: 'Docs',
      assignedTo: 'Meera',
      assignedBy: 'Documentation Lead'
    },

  ]);

  const [sortBy, setSortBy] = useState<'deadline' | 'status'>('deadline');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    // Apply dark mode
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const handleStatusChange = (taskId: number, newStatus: Task['status']) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        // If attempting to mark Completed, ask for confirmation
        if (newStatus === 'Completed' && task.status !== 'Completed') {
          const ok = window.confirm('Are you sure this task is completed?');
          if (!ok) return task; // no change
          return { ...task, status: 'Completed', completedDate: new Date().toISOString() };
        }

        // Prevent changes if already completed
        if (task.status === 'Completed') return task;

        return { ...task, status: newStatus };
      })
    );
  };

  const handleView = (taskId: number) => {
    const t = tasks.find((x) => x.id === taskId);
    if (t) alert(`Task: ${t.title}\nAssigned To: ${t.assignedTo || '-'}\nStatus: ${t.status}`);
  };

  const handleEdit = (taskId: number) => {
    console.log('Edit task', taskId);
  };

  const handleDelete = (taskId: number) => {
    if (!window.confirm('Delete this task?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const sortedAndFilteredTasks = tasks
    .filter((task) => filterStatus === 'All' || task.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else {
        const statusOrder = { 'Pending': 0, 'In Progress': 1, 'Completed': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
    });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Pending':
        return '#ff6b6b';
      case 'In Progress':
        return '#ffa500';
      case 'Completed':
        return '#51cf66';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-logo">TMRS</div>
          </div>

          <ul className="nav-links">
            <li className="nav-link">Dashboard</li>
            <li className="nav-link">Task Management</li>
            <li className="nav-link">Reports</li>
            <li className="nav-link" onClick={onLogout}>Logout</li>
          </ul>

          <div className="nav-right">
            <button
              className="theme-btn-top"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 3v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.22 4.22l1.42 1.42" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.36 18.36l1.42 1.42" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 12h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.22 19.78l1.42-1.42" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.36 5.64l1.42-1.42" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <div className="welcome-text">Welcome {user?.FullName?.toUpperCase() || 'EMPLOYEE'}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <h2 className="page-title">My Tasks</h2>
          <p className="page-subtitle">Manage and track your assigned tasks</p>
        </div>

        {/* Controls */}
        <div className="dashboard-controls">
          <div className="filter-group">
            <label htmlFor="filterStatus">Filter by Status:</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="dashboard-select"
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortBy">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'deadline' | 'status')}
              className="dashboard-select"
            >
              <option value="deadline">Deadline</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="task-count">
            {sortedAndFilteredTasks.length} task{sortedAndFilteredTasks.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Task Table */}
        <div className="task-area">
          <div className="controls-row">
            <div className="filter-group">
              <label htmlFor="filterStatus">Filter by Status:</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="dashboard-select"
              >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'deadline' | 'status')}
                className="dashboard-select"
              >
                <option value="deadline">Deadline</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="task-count">
              {sortedAndFilteredTasks.length} task{sortedAndFilteredTasks.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="task-container">
            <table className="professional-table" role="table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Effort</th>
                  <th>Logged</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Assigned By</th>
                  <th>Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedAndFilteredTasks.length === 0 ? (
                  <tr className="empty-row"><td colSpan={11}>No tasks available</td></tr>
                ) : (
                  sortedAndFilteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="title-cell">
                        <div className="row-title">{task.title}</div>
                        <div className="row-desc">{task.description}</div>
                      </td>
                      <td>{task.priority || '-'}</td>
                      <td>
                        <div className="status-block">
                          {task.status === 'In Progress' ? (
                            <span className="task-status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>{task.status}</span>
                          ) : (
                            <span className="status-text">{task.status}</span>
                          )}
                          <div style={{ marginTop: 6 }}>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                              className="status-dropdown"
                              aria-label={`Change status for ${task.title}`}
                              disabled={task.status === 'Completed'}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td>{task.type || '-'}</td>
                      <td>{task.effort || '-'}</td>
                      <td>{task.loggedHours || '-'}</td>
                      <td>{formatDate(task.deadline)}</td>
                      <td>{task.assignedTo || '-'}</td>
                      <td>{task.assignedBy || '-'}</td>
                      <td>{task.completedDate ? formatDate(task.completedDate) : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-view" onClick={() => handleView(task.id)} aria-label={`View ${task.title}`}>View</button>
                          <button className="btn btn-edit" onClick={() => handleEdit(task.id)} aria-label={`Edit ${task.title}`}>Edit</button>
                          <button className="btn btn-delete" onClick={() => handleDelete(task.id)} aria-label={`Delete ${task.title}`}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile Panel */}
        {showProfile && (
          <div className="profile-panel-main">
            <div className="profile-panel-header">
              <h3>My Profile</h3>
              <button className="profile-close" onClick={() => setShowProfile(false)}>✕</button>
            </div>
            <div className="profile-details">
              <div className="profile-field">
                <label>Full Name</label>
                <p>{user?.FullName}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user?.Email}</p>
              </div>
              <div className="profile-field">
                <label>Role</label>
                <p>{user?.Role}</p>
              </div>
               <div className="profile-field">
                <label>DOB</label>
                <p>{user?.DOB}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
