'use client';

import React, { useState } from 'react';
import { ProctoringStatus } from '@/types/proctoring';
import {
  Camera,
  CameraOff,
  Eye,
  EyeOff,
  Users,
  ShieldCheck,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface Props {
  status: ProctoringStatus;
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
}

export function ProctoringCandidateHUD({
  status,
  videoRef,
  className = '',
}: Props) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);

  // Derive active warning state
  let alertMessage = 'Integrity Active • Focus OK';
  let alertVariant = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  if (!status.cameraActive) {
    alertMessage = 'Camera Offline / Disconnected';
    alertVariant = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  } else if (!status.faceDetected) {
    alertMessage = 'No face detected in camera feed';
    alertVariant = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  } else if (status.multipleFaces) {
    alertMessage = 'Multiple faces in camera view';
    alertVariant = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  } else if (status.lookingAway) {
    alertMessage = 'Please face toward the screen';
    alertVariant = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2 select-none ${className}`}
    >
      {/* Privacy Explanation Popover */}
      {showPrivacyTooltip && (
        <div className="max-w-xs p-3.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-[11px] text-slate-300 space-y-1.5 animate-fadeIn backdrop-blur-lg">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy-Conscious Integrity</span>
          </div>
          <p className="leading-relaxed">
            All computer vision runs <strong>locally on your browser</strong>. Raw video is{' '}
            <em>never</em> recorded or uploaded to servers.
          </p>
          <p className="text-[10px] text-slate-400 italic">
            Events serve only as timeline context and do not make automated judgments.
          </p>
        </div>
      )}

      {/* Main HUD Capsule */}
      <div className="flex flex-col bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Header Bar */}
        <div className="h-8 px-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between space-x-3 text-[10px]">
          <div className="flex items-center space-x-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                status.cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="font-semibold text-slate-300">Proctor HUD</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowPrivacyTooltip((prev) => !prev)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Privacy Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={isMinimized ? 'Expand Camera' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Video Frame */}
        {!isMinimized && (
          <div className="relative w-44 h-32 bg-slate-950 overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                !status.cameraActive ? 'hidden' : 'block'
              }`}
            />

            {!status.cameraActive && (
              <div className="flex flex-col items-center space-y-1 text-slate-500">
                <CameraOff className="w-6 h-6" />
                <span className="text-[10px]">Camera Inactive</span>
              </div>
            )}

            {/* Live Centroid Guide Target */}
            {status.cameraActive && (
              <div
                className={`absolute inset-0 m-auto w-24 h-24 border rounded-full pointer-events-none transition-colors duration-300 ${
                  status.lookingAway || !status.faceDetected
                    ? 'border-amber-400/50 border-dashed animate-spin'
                    : 'border-emerald-400/30'
                }`}
              />
            )}
          </div>
        )}

        {/* Status Chip */}
        <div
          className={`px-3 py-1.5 border-t text-[10px] font-medium flex items-center justify-center space-x-1.5 ${alertVariant}`}
        >
          {status.multipleFaces ? (
            <Users className="w-3 h-3 flex-shrink-0" />
          ) : !status.faceDetected ? (
            <EyeOff className="w-3 h-3 flex-shrink-0" />
          ) : !status.cameraActive ? (
            <CameraOff className="w-3 h-3 flex-shrink-0" />
          ) : (
            <Eye className="w-3 h-3 flex-shrink-0" />
          )}
          <span className="truncate max-w-[170px]">{alertMessage}</span>
        </div>
      </div>
    </div>
  );
}

export default ProctoringCandidateHUD;
