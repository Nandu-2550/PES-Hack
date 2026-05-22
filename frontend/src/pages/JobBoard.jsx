import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';

const JobBoard = () => {
  const { user } = useContext(AuthContext);
  const { data: jobsRaw, setData: setJobs, syncedAt, isStale } = useCachedFetch(
    `jobs_${user?.district}`,
    user ? `/api/jobs` : null
  );
  const jobs = jobsRaw || [];
  const [myJobs, setMyJobs] = useState([]);
  const [view, setView] = useState('feed'); // 'feed', 'my', 'post'
  const [workFilter, setWorkFilter] = useState('');
  
  // Post Job Form State
  const [formData, setFormData] = useState({
    workType: 'Harvesting',
    workersNeeded: 1,
    durationDays: 1,
    salaryAmount: 500,
    salaryType: 'per_day',
    amenities: []
  });

  const amenitiesList = ["Food", "Stay", "Transport"];

  useEffect(() => {
    
    // Socket.io connection (will be proxied by Vite)
    const socket = io();
    
    socket.on("job:new", (newJob) => {
      // If job is in same district, add it
      if (newJob.district === user.district) {
        setJobs(prev => [newJob, ...prev]);
        toast.success(`New ${newJob.workType} job posted in ${user.district}!`);
      }
    });

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    if (view === 'my') {
      fetchMyJobs();
    }
  }, [view]);

  const fetchMyJobs = async () => {
    try {
      const res = await client.get('/api/jobs/mine');
      setMyJobs(res.data);
    } catch (err) {
      toast.error("Failed to load your jobs");
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/jobs', formData);
      toast.success("Job posted successfully!");
      setView('my');
    } catch (err) {
      toast.error("Failed to post job");
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleComplete = async (id) => {
    try {
      await client.patch(`/api/jobs/${id}/complete`);
      toast.success("Job marked as completed");
      fetchMyJobs();
    } catch (err) {
      toast.error("Failed to update job");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await client.delete(`/api/jobs/${id}`);
      toast.success("Job deleted");
      fetchMyJobs();
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  const filteredJobs = workFilter ? jobs.filter(j => j.workType === workFilter) : jobs;

  return (
    <div className="page-container">
      <h1 className="mb-1">Job Board</h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />
      
      {/* View Toggles */}
      <div className="flex gap-2 mb-3">
        <button 
          className={view === 'feed' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px' }}
          onClick={() => setView('feed')}
        >
          Job Feed
        </button>
        <button 
          className={view === 'my' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px' }}
          onClick={() => setView('my')}
        >
          My Posts
        </button>
        <button 
          className={view === 'post' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px' }}
          onClick={() => setView('post')}
        >
          + Post Job
        </button>
      </div>

      {view === 'feed' && (
        <>
          <select 
            value={workFilter} 
            onChange={(e) => setWorkFilter(e.target.value)}
            className="mb-3"
          >
            <option value="">All Work Types</option>
            <option value="Harvesting">Harvesting</option>
            <option value="Weeding">Weeding</option>
            <option value="Planting">Planting</option>
            <option value="Irrigation">Irrigation</option>
            <option value="Spraying">Spraying</option>
            <option value="General">General</option>
          </select>

          {filteredJobs.length === 0 && <p className="text-center">No jobs found.</p>}
          {filteredJobs.map(job => (
            <JobCard key={job._id} job={job} isOwner={false} />
          ))}
        </>
      )}

      {view === 'my' && (
        <>
          {myJobs.length === 0 && <p className="text-center">You haven't posted any jobs.</p>}
          {myJobs.map(job => (
            <div key={job._id} style={{ opacity: job.status === 'completed' ? 0.5 : 1 }}>
              {job.status === 'completed' && <span style={{ color: 'yellow', fontSize: '12px' }}>Completed</span>}
              <JobCard 
                job={job} 
                isOwner={true} 
                onComplete={handleComplete} 
                onDelete={handleDelete} 
              />
            </div>
          ))}
        </>
      )}

      {view === 'post' && (
        <div className="surface-card">
          <h2 className="mb-2">Post a New Job</h2>
          <form onSubmit={handlePostSubmit}>
            <label className="mb-1 block">Work Type</label>
            <select 
              value={formData.workType} 
              onChange={(e) => setFormData({...formData, workType: e.target.value})}
            >
              <option value="Harvesting">Harvesting</option>
              <option value="Weeding">Weeding</option>
              <option value="Planting">Planting</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Spraying">Spraying</option>
              <option value="General">General</option>
            </select>

            <div className="flex gap-2">
              <div style={{ flex: 1 }}>
                <label className="mb-1 block">Workers Needed</label>
                <input 
                  type="number" min="1" required 
                  value={formData.workersNeeded}
                  onChange={(e) => setFormData({...formData, workersNeeded: e.target.value})}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="mb-1 block">Duration (Days)</label>
                <input 
                  type="number" min="1" required 
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div style={{ flex: 1 }}>
                <label className="mb-1 block">Salary Amount (₹)</label>
                <input 
                  type="number" min="1" required 
                  value={formData.salaryAmount}
                  onChange={(e) => setFormData({...formData, salaryAmount: e.target.value})}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="mb-1 block">Salary Type</label>
                <select 
                  value={formData.salaryType}
                  onChange={(e) => setFormData({...formData, salaryType: e.target.value})}
                >
                  <option value="per_day">Per Day</option>
                  <option value="contract">Total Contract</option>
                </select>
              </div>
            </div>

            <label className="mb-1 block">Amenities Provided</label>
            <div className="flex gap-2 mb-3">
              {amenitiesList.map(a => (
                <button
                  key={a} type="button"
                  className={formData.amenities.includes(a) ? "btn-primary" : "btn-secondary"}
                  style={{ padding: '4px 8px', width: 'auto', fontSize: '14px' }}
                  onClick={() => handleAmenityToggle(a)}
                >
                  {a}
                </button>
              ))}
            </div>

            <button type="submit" className="btn-primary">Post Job</button>
          </form>
        </div>
      )}

    </div>
  );
};

export default JobBoard;
