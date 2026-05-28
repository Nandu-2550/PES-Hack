import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, MapPin } from 'lucide-react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { useLanguage } from '../context/LanguageContext';
import GlassCard from '../components/ui/GlassCard';
import { SkeletonJobGrid } from '../components/ui/SkeletonCard';
import ScopeSelector from '../components/ui/ScopeSelector';
import ProgressButton from '../components/ui/ProgressButton';

const WORK_TYPES = ['Harvesting', 'Weeding', 'Planting', 'Irrigation', 'Spraying', 'General'];
const AMENITIES_LIST = ['Food', 'Stay', 'Transport'];

const tabVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const JobBoard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState('district');
  const district = user?.district || localStorage.getItem('userDistrict') || '';
  const state = user?.state || localStorage.getItem('userState') || 'Karnataka';

  const cacheKey = `jobs_${scope}_${district}_${state}`;
  const queryParams = new URLSearchParams({ scope, district, state }).toString();

  const { data: jobsRaw, setData: setJobs, syncedAt, isStale, loading: feedLoading } = useCachedFetch(
    cacheKey,
    user ? `/api/jobs?${queryParams}` : null
  );
  const jobs = jobsRaw || [];
  const [myJobs, setMyJobs] = useState([]);
  const [view, setView] = useState('feed'); // 'feed', 'my', 'post'
  const [workFilter, setWorkFilter] = useState('');

  // Post Job Form State — all variable names preserved
  const [formData, setFormData] = useState({
    workType: 'Harvesting',
    workersNeeded: 1,
    durationDays: 1,
    salaryAmount: 500,
    salaryType: 'per_day',
    amenities: []
  });

  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const amenitiesList = AMENITIES_LIST;

  useEffect(() => {
    if (!user) return;

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
  }, [user, setJobs]);

  useEffect(() => {
    if (view === 'my') {
      fetchMyJobs();
    }
  }, [view]);

  const fetchMyJobs = async () => {
    setLoading(true);
    const t0 = Date.now();
    try {
      const res = await client.get('/api/jobs/mine');
      const wait = Math.max(0, 300 - (Date.now() - t0));
      setTimeout(() => {
        setMyJobs(res.data);
        setLoading(false);
      }, wait);
    } catch (err) {
      setLoading(false);
      toast.error('Connection slow — retrying…', { duration: 5000 });
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostSubmitting(true);
    setPostSuccess(false);
    try {
      await client.post('/api/jobs', formData);
      toast.success(t('posted_success') || "Job posted successfully!");
      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
        setView('my');
      }, 700);
    } catch (err) {
      toast.error(t('error'));
    } finally {
      setPostSubmitting(false);
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
      toast.error(t('error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete') || "Delete this job?")) return;
    try {
      await client.delete(`/api/jobs/${id}`);
      toast.success(t('deleted_success') || "Job deleted");
      fetchMyJobs();
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const filteredJobs = workFilter ? jobs.filter(j => j.workType === workFilter) : jobs;

  return (
    <div className="page-container pb-20">
      
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Briefcase className="text-emerald-400" size={22} />
            {t('jobs.title') || 'Job Board'}
          </h1>
          <p className="page-subtitle flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-emerald-400/60" />
            {scope === 'district' ? district : scope === 'state' ? state : 'All India'}
          </p>
        </div>
        <button
          onClick={() => setView('post')}
          className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 min-h-[44px]"
        >
          <Plus size={14} />
          Post Job
        </button>
      </motion.div>

      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      {/* ── View Toggles ── */}
      <div className="tab-dock">
        <button className={`tab-pill ${view === 'feed' ? 'active' : ''}`} onClick={() => setView('feed')}>
          {t('market') || 'Job Feed'}
        </button>
        <button className={`tab-pill ${view === 'my' ? 'active' : ''}`} onClick={() => setView('my')}>
          {t('my_listings') || 'My Posts'}
        </button>
        <button className={`tab-pill ${view === 'post' ? 'active' : ''}`} onClick={() => setView('post')}>
          + {t('nav_jobs') || 'Post Job'}
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── JOB FEED ── */}
        {view === 'feed' && (
          <motion.div key="feed" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <ScopeSelector activeScope={scope} onScopeChange={setScope} />
            <p className="text-center text-white/35 text-xs mb-4">
              {scope === 'district' && `Showing jobs in ${district}`}
              {scope === 'state'    && `Showing jobs across ${state}`}
              {scope === 'india'    && 'Showing all jobs across India'}
            </p>

            {/* Work Type Filter — styled pill bar */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setWorkFilter('')}
                className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all min-h-[36px] ${
                  workFilter === ''
                    ? 'bg-emerald-500 text-black shadow-glow-sm'
                    : 'border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                All Types
              </button>
              {WORK_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setWorkFilter(type)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all min-h-[36px] ${
                    workFilter === type
                      ? 'bg-emerald-500 text-black shadow-glow-sm'
                      : 'border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {feedLoading ? (
              <SkeletonJobGrid count={4} />
            ) : (
              <>
                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-3 block">🔍</span>
                    <p className="text-slate-500 text-sm">{t('no_listings_found') || 'No jobs found.'}</p>
                  </div>
                )}
                <div className="space-y-3">
                  {filteredJobs.map(job => (
                    <JobCard key={job._id} job={job} isOwner={false} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── MY JOBS ── */}
        {view === 'my' && (
          <motion.div key="my" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3">
            {loading ? (
              <SkeletonJobGrid count={3} />
            ) : (
              <>
                {myJobs.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-3 block">📋</span>
                    <p className="text-slate-500 text-sm">{t('no_listings_found') || "You haven't posted any jobs."}</p>
                    <button onClick={() => setView('post')} className="btn-emerald mt-4 text-sm py-2 px-5">
                      Post Your First Job
                    </button>
                  </div>
                )}
                {myJobs.map(job => (
                  <div key={job._id} style={{ opacity: job.status === 'completed' ? 0.55 : 1 }}>
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
              </>
            )}
          </motion.div>
        )}

        {/* ── POST JOB FORM ── */}
        {view === 'post' && (
          <motion.div key="post" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <GlassCard>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Plus size={16} className="text-emerald-400" />
                </div>
                <h2 className="text-white text-base font-bold">{t('jobs.title') || 'Post a New Job'}</h2>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                {/* Work Type */}
                <div>
                  <label className="nfv-label">{t('category') || 'Work Type'}</label>
                  <div className="flex flex-wrap gap-2">
                    {WORK_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, workType: type })}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all min-h-[36px] ${
                          formData.workType === type
                            ? 'bg-emerald-500 text-black shadow-glow-sm'
                            : 'border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Workers + Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="nfv-label">{t('workers_needed') || 'Workers Needed'}</label>
                    <input
                      type="number" min="1" required
                      value={formData.workersNeeded}
                      onChange={(e) => setFormData({ ...formData, workersNeeded: e.target.value })}
                      className="input-field w-full mb-0"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div>
                    <label className="nfv-label">{t('duration') || 'Duration (Days)'}</label>
                    <input
                      type="number" min="1" required
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      className="input-field w-full mb-0"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </div>

                {/* Salary */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="nfv-label">{t('price_per_day') || 'Salary Amount (₹)'}</label>
                    <input
                      type="number" min="1" required
                      value={formData.salaryAmount}
                      onChange={(e) => setFormData({ ...formData, salaryAmount: e.target.value })}
                      className="input-field w-full mb-0"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div>
                    <label className="nfv-label">{t('salary_type') || 'Salary Type'}</label>
                    <select
                      value={formData.salaryType}
                      onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                      className="input-field w-full mb-0"
                      style={{ marginBottom: 0 }}
                    >
                      <option value="per_day" className="bg-slate-900">Per Day</option>
                      <option value="contract" className="bg-slate-900">Total Contract</option>
                    </select>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="nfv-label">{t('amenities') || 'Amenities Provided'}</label>
                  <div className="flex gap-2">
                    {amenitiesList.map(a => (
                      <button
                        key={a} type="button"
                        className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-xl transition-all min-h-[44px] ${
                          formData.amenities.includes(a)
                            ? 'bg-emerald-500 text-black shadow-glow-sm'
                            : 'border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                        }`}
                        onClick={() => handleAmenityToggle(a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <ProgressButton
                  isLoading={postSubmitting}
                  isSuccess={postSuccess}
                  className="w-full py-3 text-sm"
                >
                  {t('submit') || 'Post Job'}
                </ProgressButton>
              </form>
            </GlassCard>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default JobBoard;


