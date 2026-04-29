"use client";

import React, { useState, useEffect } from "react";
import { useFocusData } from "../../lib/FocusDataContext";
import LimitModal from "./LimitModal";

interface ScheduleInterval {
  id: string;
  start: string;
  end: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminUnlocked: boolean;
  showUpgrade: boolean;
}

const DAYS = [
  { full: "Sunday", short: "Sun" },
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
  { full: "Saturday", short: "Sat" },
];

export default function ScheduleModal({ isOpen, onClose, isAdminUnlocked, showUpgrade }: ScheduleModalProps) {
  const { data, updateData } = useFocusData();
  const [localSchedule, setLocalSchedule] = useState(data.schedule || { enabled: false, intervals: [], days: [] });
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (isOpen && data.schedule) {
      setLocalSchedule(data.schedule);
    }
  }, [isOpen, data.schedule]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    const currentDays = localSchedule?.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setLocalSchedule({ ...localSchedule, days: newDays });
  };

  const addInterval = () => {
    const currentIntervals = localSchedule?.intervals || [];
    const limit = isAdminUnlocked ? 2 : 1;
    if (currentIntervals.length >= limit) {
      setShowLimitModal(true);
      return;
    }
    const newInterval = {
      id: Math.random().toString(36).substr(2, 9),
      start: "09:00",
      end: "17:00",
    };
    setLocalSchedule({
      ...localSchedule,
      intervals: [...currentIntervals, newInterval],
    });
  };

  const removeInterval = (id: string) => {
    const currentIntervals = localSchedule?.intervals || [];
    if (currentIntervals.length <= 1) return;
    setLocalSchedule({
      ...localSchedule,
      intervals: currentIntervals.filter((i) => i.id !== id),
    });
  };

  const updateInterval = (id: string, field: "start" | "end", value: string) => {
    const currentIntervals = localSchedule?.intervals || [];
    setLocalSchedule({
      ...localSchedule,
      intervals: currentIntervals.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      ),
    });
  };

  const handleSave = () => {
    updateData({ schedule: { ...localSchedule, enabled: true } });
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? "active" : ""}`} onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'left', padding: '24px 32px' }}>
          <h2 className="modal-title">Set up blocking schedule</h2>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body" style={{ padding: '0 32px 32px 32px' }}>
          <div className="schedule-section">
            <h4 className="section-label">SET TIMES</h4>
            <div className="intervals-list">
              {(localSchedule?.intervals || []).map((interval) => (
                <div key={interval.id} className="time-row">
                  <div className="time-input-group">
                    <label className="input-label">Start</label>
                    <div className="time-input-wrapper">
                      <input
                        type="time"
                        value={interval.start}
                        onChange={(e) => updateInterval(interval.id, "start", e.target.value)}
                        className="time-field"
                      />
                      {/* <i className="far fa-clock"></i> */}
                    </div>
                  </div>
                  <span className="time-separator">-</span>
                  <div className="time-input-group">
                    <label className="input-label">End</label>
                    <div className="time-input-wrapper">
                      <input
                        type="time"
                        value={interval.end}
                        onChange={(e) => updateInterval(interval.id, "end", e.target.value)}
                        className="time-field"
                      />
                      {/* <i className="far fa-clock"></i> */}
                    </div>
                  </div>
                  <button 
                    className="action-icon-btn delete-interval"
                    onClick={() => removeInterval(interval.id)}
                    title="Remove interval"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                  <button 
                    className="action-icon-btn add-interval"
                    onClick={addInterval}
                    title="Add interval"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {(!isAdminUnlocked && showUpgrade) && (
            <div className="upgrade-banner-small">
              <div className="upgrade-info">
                <span className="interval-count">
                  {(localSchedule?.intervals || []).length}/1 Free Interval - Upgrade for 2 intervals
                </span>
              </div>
              <button className="btn-upgrade-mini">Upgrade</button>
            </div>
          )}
          {(!isAdminUnlocked && !showUpgrade) && (
            <div className="upgrade-banner-small" style={{ opacity: 0.7 }}>
              <div className="upgrade-info">
                <span className="interval-count">
                  {(localSchedule?.intervals || []).length}/1 Free Interval
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max limit reached</span>
            </div>
          )}
          {isAdminUnlocked && (
            <div className="upgrade-banner-small" style={{ background: '#ecfdf5', borderColor: '#10b981' }}>
              <div className="upgrade-info">
                <span className="interval-count" style={{ color: '#047857' }}>
                  {(localSchedule?.intervals || []).length}/2 Intervals
                </span>
              </div>
              <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
            </div>
          )}

          <div className="schedule-section" style={{ marginTop: '24px' }}>
            <h4 className="section-label">SELECTED DAYS <span className="label-hint">(Click a day to deactivate)</span></h4>
            <div className="days-selector">
              {DAYS.map((day) => (
                <button
                  key={day.short}
                  className={`day-btn ${(localSchedule?.days || []).includes(day.short) ? "active" : ""}`}
                  onClick={() => toggleDay(day.short)}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-set-schedule" onClick={handleSave}>
            Set Schedule
          </button>
        </div>
      </div>

      <LimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)}
        title="Schedule Limit Reached!"
        message={`Your free plan allows only 1 blocking interval. Upgrade now to set multiple daily schedules and optimize your focus routine.`}
        limit={1}
      />

      <style jsx>{`
        .schedule-modal {
          background: #ffffff;
          width: 500px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          position: relative;
        }
        .close-x {
          position: absolute;
          right: 24px;
          top: 24px;
          background: none;
          border: none;
          font-size: 24px;
          color: var(--text-muted);
          cursor: pointer;
        }
        .section-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .label-hint {
          font-weight: 400;
          text-transform: none;
          font-size: 11px;
        }
        .intervals-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .time-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .time-input-group {
          flex: 1;
          position: relative;
        }
        .input-label {
          position: absolute;
          top: -8px;
          left: 12px;
          background: white;
          padding: 0 4px;
          font-size: 10px;
          color: var(--text-muted);
          z-index: 1;
        }
        .time-input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 12px;
          background: white;
        }
        .time-field {
          border: none;
          outline: none;
          font-size: 14px;
          font-weight: 600;
          width: 100%;
          color: var(--text-main);
          background: transparent;
        }
        .time-input-wrapper i {
          color: var(--text-muted);
          font-size: 16px;
        }
        .time-separator {
          color: var(--border);
          font-weight: 700;
        }
        .action-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .delete-interval {
          background: transparent;
          color: var(--text-muted);
        }
        .delete-interval:hover {
          color: var(--danger);
          background: #fee2e2;
        }
        .add-interval {
          background: #f1f5f9;
          color: var(--text-main);
        }
        .add-interval:hover {
          background: #e2e8f0;
        }
        .upgrade-banner-small {
          margin-top: 16px;
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .interval-count {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
        }
        .btn-upgrade-mini {
          background: #6366f1;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .days-selector {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .day-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #f1f5f9;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .day-btn.active {
          background: #10b981;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .btn-set-schedule {
          width: 100%;
          margin-top: 32px;
          background: #10b981;
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .btn-set-schedule:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}
