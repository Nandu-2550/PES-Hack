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
    <div className="page-container pb-20">
      <h1 className="text-white text-3xl font-extrabold mb-1">Job Board</h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />
      
      {/* View Toggles */}
      <div className="flex bg-[#13191C] border border-white/5 rounded-xl p-1 gap-1 mb-5">
        <button 
          className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 ${view === 'feed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`} 
          onClick={() => setView('feed')}
        >
          Job Feed
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 ${view === 'my' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`} 
          onClick={() => setView('my')}
        >
          My Posts
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 ${view === 'post' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`} 
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
            className="input-field mb-4"
          >
            <option value="" className="bg-[#13191C]">All Work Types</option>
            <option value="Harvesting" className="bg-[#13191C]">Harvesting</option>
            <option value="Weeding" className="bg-[#13191C]">Weeding</option>
            <option value="Planting" className="bg-[#13191C]">Planting</option>
            <option value="Irrigation" className="bg-[#13191C]">Irrigation</option>
            <option value="Spraying" className="bg-[#13191C]">Spraying</option>
            <option value="General" className="bg-[#13191C]">General</option>
          </select>

          {filteredJobs.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">No jobs found.</p>}
          <div className="space-y-3">
            {filteredJobs.map(job => (
              <JobCard key={job._id} job={job} isOwner={false} />
            ))}
          </div>
        </>
      )}

      {view === 'my' && (
        <div className="space-y-3">
          {myJobs.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">You haven't posted any jobs.</p>}
          {myJobs.map(job => (
            <div key={job._id} style={{ opacity: job.status === 'completed' ? 0.5 : 1 }}>
              {job.status === 'completed' && (
                <span className="inline-block bg-yellow-500/10 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded border border-yellow-500/20 mb-2">
                  Completed
                </span>
              )}
              <JobCard 
                job={job} 
                isOwner={true} 
                onComplete={handleComplete} 
                onDelete={handleDelete} 
              />
            </div>
          ))}
        </div>
      )}

      {view === 'post' && (
        <div className="card p-6 shadow-glow-md">
          <h2 className="text-white text-xl font-bold mb-4">Post a New Job</h2>
          <form onSubmit={handlePostSubmit}>
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Work Type</label>
            <select 
              value={formData.workType} 
              onChange={(e) => setFormData({...formData, workType: e.target.value})}
              className="input-field mb-4"
            >
              <option value="Harvesting" className="bg-[#13191C]">Harvesting</option>
              <option value="Weeding" className="bg-[#13191C]">Weeding</option>
              <option value="Planting" className="bg-[#13191C]">Planting</option>
              <option value="Irrigation" className="bg-[#13191C]">Irrigation</option>
              <option value="Spraying" className="bg-[#13191C]">Spraying</option>
              <option value="General" className="bg-[#13191C]">General</option>
            </select>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Workers Needed</label>
                <input 
                  type="number" min="1" required 
                  value={formData.workersNeeded}
                  onChange={(e) => setFormData({...formData, workersNeeded: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Duration (Days)</label>
                <input 
                  type="number" min="1" required 
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Salary Amount (₹)</label>
                <input 
                  type="number" min="1" required 
                  value={formData.salaryAmount}
                  onChange={(e) => setFormData({...formData, salaryAmount: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Salary Type</label>
                <select 
                  value={formData.salaryType}
                  onChange={(e) => setFormData({...formData, salaryType: e.target.value})}
                  className="input-field"
                >
                  <option value="per_day" className="bg-[#13191C]">Per Day</option>
                  <option value="contract" className="bg-[#13191C]">Total Contract</option>
                </select>
              </div>
            </div>

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Amenities Provided</label>
            <div className="flex gap-2 mb-6">
              {amenitiesList.map(a => (
                <button
                  key={a} type="button"
                  className={`flex-1 py-2 px-3 text-sm font-semibold rounded-xl transition-all duration-150 ${formData.amenities.includes(a) ? "bg-emerald-500 text-black shadow-glow-sm" : "bg-[#1A2228] text-slate-300 border border-white/5 hover:bg-[#222D35]"}`}
                  onClick={() => handleAmenityToggle(a)}
                >
                  {a}
                </button>
              ))}
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 mt-2">Post Job</button>
          </form>
        </div>
      )}

    </div>
  );
};

export default JobBoard;
