'use client';

import React, { useState } from 'react';
import { ParsedCandidateProfile } from '@/types/resume';
import {
  X,
  Sparkles,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface CandidateAiProfileModalProps {
  profile: ParsedCandidateProfile | null;
  isOpen: boolean;
  onClose: () => void;
  resumeFileName?: string;
  resumeVersion?: number;
}

export const CandidateAiProfileModal: React.FC<CandidateAiProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  resumeFileName,
  resumeVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'skills' | 'projects' | 'education'>('overview');

  if (!isOpen || !profile) return null;

  const totalSkillsCount =
    (profile.skills.languages?.length || 0) +
    (profile.skills.frameworks?.length || 0) +
    (profile.skills.databases?.length || 0) +
    (profile.skills.tools?.length || 0) +
    (profile.skills.other?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-scaleUp">
        {/* Header Bar */}
        <div className="flex items-start justify-between px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {profile.fullName || 'Candidate Profile'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Verified</span>
                </span>
                {resumeVersion && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Source: v{resumeVersion}.0
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-indigo-300/90 font-medium mt-0.5">
                {profile.headline || 'Software Engineering Professional'}
              </p>

              {/* Contact meta strip */}
              <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2 flex-wrap gap-y-1">
                {profile.email && (
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{profile.email}</span>
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{profile.phone}</span>
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{profile.location}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{profile.yearsOfExperience} Years Experience</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Layers },
            { id: 'skills', label: `Skills Matrix (${totalSkillsCount})`, icon: Code2 },
            { id: 'experience', label: `Experience (${profile.workExperience?.length || 0})`, icon: Briefcase },
            { id: 'projects', label: `Projects (${profile.projects?.length || 0})`, icon: FolderGit2 },
            { id: 'education', label: `Education & Awards`, icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/50">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Profile Summary</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {profile.summary || 'No summary text available.'}
                </p>
              </div>

              {/* Skills Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center space-x-2">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Core Languages & Frameworks</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.languages?.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {s}
                      </span>
                    ))}
                    {profile.skills.frameworks?.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Databases & Infrastructure</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.databases?.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {s}
                      </span>
                    ))}
                    {profile.skills.tools?.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Role Snapshot */}
              {profile.workExperience && profile.workExperience.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center space-x-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Current / Most Recent Role</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-white">
                        {profile.workExperience[0].position}{' '}
                        <span className="text-slate-400 font-normal">at</span>{' '}
                        <span className="text-indigo-300">{profile.workExperience[0].company}</span>
                      </p>
                      <span className="text-xs text-slate-400 font-mono">
                        {profile.workExperience[0].startDate} — {profile.workExperience[0].endDate || 'Present'}
                      </span>
                    </div>
                    {profile.workExperience[0].description && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {profile.workExperience[0].description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKILLS MATRIX */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Programming Languages */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-purple-300 mb-3 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span>Programming Languages</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.languages?.length > 0 ? (
                    profile.skills.languages.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-200 border border-purple-500/30 shadow-sm"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None specified</span>
                  )}
                </div>
              </div>

              {/* Frameworks & Libraries */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>Frameworks, Libraries & Runtimes</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.frameworks?.length > 0 ? (
                    profile.skills.frameworks.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-200 border border-indigo-500/30 shadow-sm"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None specified</span>
                  )}
                </div>
              </div>

              {/* Databases */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-emerald-300 mb-3 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Databases & Caching</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.databases?.length > 0 ? (
                    profile.skills.databases.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-200 border border-emerald-500/30 shadow-sm"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None specified</span>
                  )}
                </div>
              </div>

              {/* Tools & Cloud */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>DevOps, Cloud & Developer Tools</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.tools?.length > 0 ? (
                    profile.skills.tools.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-200 border border-blue-500/30 shadow-sm"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None specified</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              {profile.workExperience && profile.workExperience.length > 0 ? (
                profile.workExperience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {exp.position}
                        </h4>
                        <p className="text-sm text-indigo-400 font-medium">
                          {exp.company}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {exp.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                            Current Role
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                          {exp.startDate || 'N/A'} — {exp.endDate || (exp.isCurrent ? 'Present' : 'N/A')}
                        </span>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[11px] font-medium text-slate-500">Tech Stack:</span>
                        {exp.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">No work experience records extracted.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-bold text-white">
                          {proj.title}
                        </h4>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors p-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {proj.description && (
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}

                      {proj.highlights && proj.highlights.length > 0 && (
                        <ul className="mt-2.5 space-y-1">
                          {proj.highlights.map((h, hIdx) => (
                            <li key={hIdx} className="text-xs text-slate-400 flex items-start space-x-1.5">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-950/50 text-indigo-300 border border-indigo-800/40"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800 col-span-2">
                  <p className="text-xs text-slate-400">No project records extracted.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EDUCATION & CERTIFICATIONS */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {/* Education Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Degrees & Universities</span>
                </h3>

                {profile.education && profile.education.length > 0 ? (
                  profile.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-start justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {edu.degree}
                        </h4>
                        <p className="text-sm text-indigo-300 font-medium mt-0.5">
                          {edu.institution}
                        </p>
                        {edu.fieldOfStudy && (
                          <p className="text-xs text-slate-400 mt-1">
                            Major: {edu.fieldOfStudy}
                          </p>
                        )}
                        {edu.grade && (
                          <p className="text-xs text-emerald-400 font-medium mt-1">
                            Grade / GPA: {edu.grade}
                          </p>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        {edu.startDate ? `${edu.startDate} — ` : ''}{edu.endDate || 'Graduated'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No education records found.</p>
                )}
              </div>

              {/* Certifications & Awards Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center space-x-2">
                    <Award className="w-3.5 h-3.5" />
                    <span>Certifications</span>
                  </h4>
                  {profile.certifications && profile.certifications.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.certifications.map((c, idx) => (
                        <li key={idx} className="text-xs text-slate-200 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No certifications listed.</p>
                  )}
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Key Achievements & Honors</span>
                  </h4>
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.achievements.map((a, idx) => (
                        <li key={idx} className="text-xs text-slate-200 flex items-start space-x-2">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No specific achievements listed.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
