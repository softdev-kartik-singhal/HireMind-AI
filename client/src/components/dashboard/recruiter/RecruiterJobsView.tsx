'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Job, Application, CreateJobDto, JobStatus, ApplicationStatus, JobExperienceLevel, JobEmploymentType } from '@/types/job';
import { JobApi } from '@/lib/api-jobs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Users,
  Video,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FileText,
  Clock,
  Filter,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

interface Props {
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenScheduleInterview?: (candidateName?: string) => void;
}

export function RecruiterJobsView({
  isCreateModalOpen,
  onCloseCreateModal,
  onOpenScheduleInterview,
}: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Job Details / Applicants Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobApplicants, setJobApplicants] = useState<Application[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  // Edit Job Modal State
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Engineering');
  const [formDescription, setFormDescription] = useState('');
  const [formResponsibilities, setFormResponsibilities] = useState('');
  const [formRequiredSkills, setFormRequiredSkills] = useState('');
  const [formPreferredSkills, setFormPreferredSkills] = useState('');
  const [formExperienceLevel, setFormExperienceLevel] = useState<JobExperienceLevel>('SENIOR');
  const [formEmploymentType, setFormEmploymentType] = useState<JobEmploymentType>('FULL_TIME');
  const [formLocation, setFormLocation] = useState('Remote (US/EU)');
  const [formSalaryRange, setFormSalaryRange] = useState('$150,000 - $200,000');
  const [formStatus, setFormStatus] = useState<JobStatus>('ACTIVE');
  const [formDeadline, setFormDeadline] = useState('2026-10-31');

  const { success, error, info } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await JobApi.getJobs({
        search: searchQuery,
        department: departmentFilter,
        status: statusFilter,
      });
      setJobs(res.jobs);
    } catch {
      error('Failed to load job requisitions');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, departmentFilter, statusFilter, error]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const loadJobApplicants = async (job: Job) => {
    setSelectedJob(job);
    try {
      setIsLoadingApplicants(true);
      const applicants = await JobApi.getJobApplicants(job.id);
      setJobApplicants(applicants);
    } catch {
      error('Failed to load applicants');
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: CreateJobDto = {
        title: formTitle,
        department: formDepartment,
        description: formDescription,
        responsibilities: formResponsibilities,
        requiredSkills: formRequiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        preferredSkills: formPreferredSkills ? formPreferredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        experienceLevel: formExperienceLevel,
        location: formLocation,
        employmentType: formEmploymentType,
        salaryRange: formSalaryRange || undefined,
        status: formStatus,
        applicationDeadline: formDeadline ? new Date(formDeadline).toISOString() : undefined,
      };

      const created = await JobApi.createJob(payload);
      setJobs((prev) => [created, ...prev]);
      success(`Requisition "${created.title}" published!`);
      onCloseCreateModal();
      resetForm();
    } catch (err: any) {
      error(err.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (job: Job) => {
    setJobToEdit(job);
    setFormTitle(job.title);
    setFormDepartment(job.department);
    setFormDescription(job.description);
    setFormResponsibilities(job.responsibilities);
    setFormRequiredSkills(job.requiredSkills.join(', '));
    setFormPreferredSkills(job.preferredSkills?.join(', ') || '');
    setFormExperienceLevel(job.experienceLevel);
    setFormEmploymentType(job.employmentType);
    setFormLocation(job.location);
    setFormSalaryRange(job.salaryRange || '');
    setFormStatus(job.status);
    setFormDeadline(job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '');
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobToEdit) return;
    try {
      setIsSubmitting(true);
      const payload: Partial<CreateJobDto> = {
        title: formTitle,
        department: formDepartment,
        description: formDescription,
        responsibilities: formResponsibilities,
        requiredSkills: formRequiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        preferredSkills: formPreferredSkills ? formPreferredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        experienceLevel: formExperienceLevel,
        location: formLocation,
        employmentType: formEmploymentType,
        salaryRange: formSalaryRange || undefined,
        status: formStatus,
        applicationDeadline: formDeadline ? new Date(formDeadline).toISOString() : undefined,
      };

      const updated = await JobApi.updateJob(jobToEdit.id, payload);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      if (selectedJob?.id === updated.id) setSelectedJob(updated);
      success(`Job "${updated.title}" updated successfully`);
      setJobToEdit(null);
      resetForm();
    } catch (err: any) {
      error(err.message || 'Failed to update job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (job: Job, newStatus: JobStatus) => {
    try {
      const updated = await JobApi.updateJobStatus(job.id, newStatus);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? { ...j, status: newStatus } : j)));
      success(`Job status changed to ${newStatus}`);
    } catch {
      error('Failed to change job status');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await JobApi.deleteJob(jobToDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      if (selectedJob?.id === jobToDelete.id) setSelectedJob(null);
      success(`Job "${jobToDelete.title}" removed`);
      setJobToDelete(null);
    } catch {
      error('Failed to delete job');
    }
  };

  const handleUpdateApplicantStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      await JobApi.updateApplicationStatus(applicationId, status);
      setJobApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
      success(`Applicant moved to ${status} stage`);
    } catch {
      error('Failed to update applicant stage');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDepartment('Engineering');
    setFormDescription('');
    setFormResponsibilities('');
    setFormRequiredSkills('');
    setFormPreferredSkills('');
    setFormExperienceLevel('SENIOR');
    setFormEmploymentType('FULL_TIME');
    setFormLocation('Remote (US/EU)');
    setFormSalaryRange('$150,000 - $200,000');
    setFormStatus('ACTIVE');
    setFormDeadline('2026-10-31');
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'PAUSED':
        return <Badge variant="warning">PAUSED</Badge>;
      case 'CLOSED':
        return <Badge variant="destructive">CLOSED</Badge>;
      default:
        return <Badge variant="secondary">DRAFT</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Job Requisitions Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, publish, edit, and track applicant pipelines for your technical hiring positions
          </p>
        </div>
        <Button onClick={onCloseCreateModal} size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white">
          <Plus className="h-4 w-4" />
          Create Job Requisition
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ACTIVE', 'DRAFT', 'PAUSED', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Department & Search */}
        <div className="flex items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Data & AI">Data & AI</option>
            <option value="DevOps">DevOps</option>
            <option value="Product">Product</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search jobs or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job requisitions found"
          description="Try adjusting your filters, search terms, or create a new job opening."
          actionLabel="Create First Job"
          onAction={onCloseCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-purple-500/40 transition-all backdrop-blur-xl flex flex-col justify-between shadow-xl"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="role" roleType="RECRUITER">
                      {job.department}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {job.experienceLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                  </div>
                </div>

                <div>
                  <CardTitle className="text-base font-bold text-white hover:text-purple-300 transition-colors cursor-pointer" onClick={() => loadJobApplicants(job)}>
                    {job.title}
                  </CardTitle>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-purple-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    {job.salaryRange || 'Competitive'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Skills tags */}
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-medium text-slate-300 border border-slate-700/50"
                    >
                      {sk}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-500">
                      +{job.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>

                {/* Footer Controls: Applicants count & Action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => loadJobApplicants(job)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <Users className="h-4 w-4 text-purple-400" />
                    <span>{job._count?.applications || 0} Applicants</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Status quick toggle */}
                    <select
                      value={job.status}
                      onChange={(e) => handleToggleStatus(job, e.target.value as JobStatus)}
                      className="h-8 rounded-lg bg-slate-950/60 border border-slate-800 px-2 text-[10px] font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(job)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      title="Edit Job"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setJobToDelete(job)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400"
                      title="Delete Job"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. CREATE / EDIT JOB REQUISITION DIALOG MODAL           */}
      {/* ======================================================== */}
      {(isCreateModalOpen || jobToEdit) && (
        <Dialog
          isOpen={isCreateModalOpen || !!jobToEdit}
          onClose={() => {
            onCloseCreateModal();
            setJobToEdit(null);
            resetForm();
          }}
          title={jobToEdit ? `Edit Requisition: ${jobToEdit.title}` : 'Create Technical Job Opening'}
          description="Define the role requirements, technical skills, and candidate expectations."
          maxWidth="2xl"
        >
          <form onSubmit={jobToEdit ? handleUpdateJob : handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Full Stack Engineer (Distributed Systems)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Department</Label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Data & AI">Data & AI</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Product">Product</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Experience Level</Label>
                <select
                  value={formExperienceLevel}
                  onChange={(e) => setFormExperienceLevel(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ENTRY">ENTRY</option>
                  <option value="MID">MID</option>
                  <option value="SENIOR">SENIOR</option>
                  <option value="LEAD">LEAD</option>
                  <option value="EXECUTIVE">EXECUTIVE</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="loc">Location</Label>
                <Input
                  id="loc"
                  placeholder="e.g. Remote (US/EU) or San Francisco, CA"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Employment Type</Label>
                <select
                  value={formEmploymentType}
                  onChange={(e) => setFormEmploymentType(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="FULL_TIME">FULL TIME</option>
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="REMOTE">REMOTE</option>
                  <option value="PART_TIME">PART TIME</option>
                  <option value="INTERNSHIP">INTERNSHIP</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  placeholder="e.g. $160,000 - $210,000 + Equity"
                  value={formSalaryRange}
                  onChange={(e) => setFormSalaryRange(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="reqSkills">Required Technical Skills (comma-separated)</Label>
                <Input
                  id="reqSkills"
                  placeholder="e.g. TypeScript, Node.js, PostgreSQL, Docker, Redis"
                  value={formRequiredSkills}
                  onChange={(e) => setFormRequiredSkills(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="prefSkills">Preferred Skills / Bonus (optional)</Label>
                <Input
                  id="prefSkills"
                  placeholder="e.g. Go, Kubernetes, gRPC, Kafka"
                  value={formPreferredSkills}
                  onChange={(e) => setFormPreferredSkills(e.target.value)}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="desc">Job Summary & Role Mission</Label>
                <textarea
                  id="desc"
                  rows={3}
                  placeholder="Describe the team mission, tech stack, and key technical challenges..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="resp">Key Responsibilities & Deliverables</Label>
                <textarea
                  id="resp"
                  rows={3}
                  placeholder="• Architect distributed backend microservices...&#10;• Optimize database query throughput..."
                  value={formResponsibilities}
                  onChange={(e) => setFormResponsibilities(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label>Publication Status</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={formStatus === 'ACTIVE'}
                      onChange={() => setFormStatus('ACTIVE')}
                    />
                    <span className="text-emerald-400 font-semibold">Active & Accepting Applications</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="DRAFT"
                      checked={formStatus === 'DRAFT'}
                      onChange={() => setFormStatus('DRAFT')}
                    />
                    <span className="text-slate-400">Save as Draft</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  onCloseCreateModal();
                  setJobToEdit(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                {jobToEdit ? 'Save Changes' : 'Publish Requisition'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* 2. JOB DETAILS & APPLICANT MANAGEMENT DRAWER / MODAL    */}
      {/* ======================================================== */}
      {selectedJob && (
        <Dialog
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          description={`${selectedJob.department} • ${selectedJob.location} • ${selectedJob.salaryRange || 'Competitive'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs text-slate-300">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Level & Type</span>
                <span className="font-bold text-white mt-1 block">
                  {selectedJob.experienceLevel} ({selectedJob.employmentType.replace('_', ' ')})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Applicants</span>
                <span className="font-black text-purple-400 text-base mt-0.5 block">
                  {jobApplicants.length || selectedJob._count?.applications || 0}
                </span>
              </div>
            </div>

            {/* Required Skills list */}
            <div>
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block mb-2">
                Required Technical Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Applicants Management Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  Candidate Applicants Pipeline ({jobApplicants.length})
                </h4>
              </div>

              {isLoadingApplicants ? (
                <div className="flex justify-center p-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                </div>
              ) : jobApplicants.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-400">
                  No candidates have applied to this requisition yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  {jobApplicants.map((app) => (
                    <div key={app.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.candidate?.name || 'Applicant'} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-xs">{app.candidate?.name || 'Candidate'}</h5>
                            {app.matchScore && (
                              <span className="text-[10px] font-bold text-emerald-400">
                                {app.matchScore}% Match
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{app.candidate?.email || 'candidate@example.com'}</p>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Applied {formatDate(app.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Candidate Stage Selector & Action */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value as ApplicationStatus)}
                          className="h-8 rounded-lg bg-slate-900 border border-slate-700 px-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="SCREENING">SCREENING</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="INTERVIEW">INTERVIEW</option>
                          <option value="SELECTED">SELECTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>

                        {onOpenScheduleInterview && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const candidateName = app.candidate?.name || 'Candidate';
                              setSelectedJob(null);
                              onOpenScheduleInterview(candidateName);
                            }}
                            className="h-8 text-xs gap-1"
                          >
                            <Video className="h-3.5 w-3.5 text-purple-400" />
                            Schedule
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleOpenEdit(selectedJob);
              }}
              className="gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Requisition
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* 3. DELETE CONFIRMATION MODAL                            */}
      {/* ======================================================== */}
      {jobToDelete && (
        <Dialog
          isOpen={!!jobToDelete}
          onClose={() => setJobToDelete(null)}
          title="Delete Job Requisition"
          description="Are you sure you want to permanently delete this job requisition? All applicant links will be detached."
        >
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200">
            <span className="font-bold block">{jobToDelete.title}</span>
            <p className="text-slate-400 mt-1">Department: {jobToDelete.department} • Location: {jobToDelete.location}</p>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteJob}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
