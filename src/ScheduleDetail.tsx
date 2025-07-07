import React from 'react';
import './ScheduleDetail.css';

interface TimeSlot {
    id: string;
    time: string;
    activity: string;
    notes: string;
}

interface ScheduleDetailProps {
    selectedDate: string;
    newTimeSlot: { time: string; activity: string; notes: string };
    setNewTimeSlot: (v: { time: string; activity: string; notes: string }) => void;
    addTimeSlot: () => void;
    getScheduleForDate: (date: string) => { date: string; timeSlots: TimeSlot[] };
    deleteTimeSlot: (id: string) => void;
    deleteSchedule: (date: string) => void;
    goBackToCalendar: () => void;
}

const formatDisplayDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
};

const ScheduleDetail: React.FC<ScheduleDetailProps> = ({
    selectedDate,
    newTimeSlot,
    setNewTimeSlot,
    addTimeSlot,
    getScheduleForDate,
    deleteTimeSlot,
    goBackToCalendar,
}) => {
    return (
        <div className="app schedule-page">
            <div className="schedule-header">
                <button onClick={goBackToCalendar} className="back-btn">
                    ← 캘린더로 돌아가기
                </button>
                <span className="schedule-title">{formatDisplayDate(new Date(selectedDate))} 일정</span>
            </div>

            <div className="schedule-main">
                <div className="schedule-container" style={{ display: 'flex', flexDirection: 'row', gap: '32px', width: '100%', flex: 1, minHeight: 0 }}>
                    <div className="time-slot-form" style={{ flex: '1 1 0', minWidth: 0 }}>
                        <h3>시간표 추가</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>시간</label>
                                <input
                                    type="time"
                                    value={newTimeSlot.time}
                                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, time: e.target.value })}
                                    placeholder="시간"
                                />
                            </div>
                            <div className="form-group">
                                <label>활동</label>
                                <input
                                    type="text"
                                    placeholder="활동 (예: 아침 식사, 관광, 쇼핑)"
                                    value={newTimeSlot.activity}
                                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, activity: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>메모</label>
                            <textarea
                                placeholder="메모 (선택사항)"
                                value={newTimeSlot.notes}
                                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, notes: e.target.value })}
                                style={{ height: '350px', resize: 'none' }}
                            />
                        </div>
                        <button
                            onClick={addTimeSlot}
                            className="add-btn"
                            disabled={!newTimeSlot.time || !newTimeSlot.activity}
                        >
                            시간표 추가
                        </button>
                    </div>

                    <div className="time-slots-list" style={{ flex: '2 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <h3>시간표</h3>
                        {getScheduleForDate(selectedDate).timeSlots.length === 0 ? (
                            <div className="no-slots">
                                <p>아직 등록된 시간표가 없습니다.</p>
                                <p>위에서 시간표를 추가해보세요!</p>
                            </div>
                        ) : (
                            <div className="time-slots-container">
                                {getScheduleForDate(selectedDate).timeSlots
                                    .sort((a, b) => a.time.localeCompare(b.time))
                                    .map(timeSlot => (
                                        <div key={timeSlot.id} className="time-slot-card">
                                            <div className="time-slot-header">
                                                <span className="time-display">{timeSlot.time}</span>
                                                <button
                                                    onClick={() => deleteTimeSlot(timeSlot.id)}
                                                    className="delete-btn"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <h4 className="activity-title">{timeSlot.activity}</h4>
                                            {timeSlot.notes && <p className="activity-notes">{timeSlot.notes}</p>}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetail; 