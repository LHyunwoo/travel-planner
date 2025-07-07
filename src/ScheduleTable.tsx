import React from 'react';
import './ScheduleTable.css';

interface TimeSlot {
    id: string;
    time: string;
    activity: string;
    notes: string;
}

interface DaySchedule {
    date: string;
    timeSlots: TimeSlot[];
}

interface ScheduleTableProps {
    schedules: DaySchedule[];
    onBackToCalendar: () => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules, onBackToCalendar }) => {
    const formatDisplayDate = (date: Date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        return `${month}/${day} (${dayOfWeek})`;
    };

    const formatTime = (time: string) => {
        return time;
    };

    // 시간대별로 그룹화된 일정 생성
    interface TimeSlotWithDate extends TimeSlot {
        date: string;
    }

    const timeSlotsByTime = schedules
        .filter(schedule => schedule.timeSlots.length > 0)
        .flatMap(schedule =>
            schedule.timeSlots.map(timeSlot => ({
                ...timeSlot,
                date: schedule.date
            }))
        )
        .reduce((acc, timeSlot) => {
            const time = timeSlot.time;
            if (!acc[time]) {
                acc[time] = [];
            }
            acc[time].push(timeSlot);
            return acc;
        }, {} as Record<string, TimeSlotWithDate[]>);

    // 시간순으로 정렬된 시간대 배열
    const sortedTimes = Object.keys(timeSlotsByTime).sort();

    const totalTimeSlots = schedules.reduce((total, schedule) => total + schedule.timeSlots.length, 0);

    return (
        <div className="schedule-table-page">
            <header className="table-header">
                <button onClick={onBackToCalendar} className="back-btn">
                    ← 캘린더로 돌아가기
                </button>
                <h1 className="table-title">전체 일정표</h1>
                <div className="table-stats">
                    <span className="stat-item">
                        <strong>{schedules.filter(s => s.timeSlots.length > 0).length}</strong>일
                    </span>
                    <span className="stat-item">
                        <strong>{totalTimeSlots}</strong>개 일정
                    </span>
                </div>
            </header>

            <div className="table-container">
                {sortedTimes.length === 0 ? (
                    <div className="no-schedules">
                        <div className="no-schedules-icon">📅</div>
                        <h2>아직 등록된 일정이 없습니다</h2>
                        <p>캘린더에서 날짜를 선택하여 일정을 추가해보세요!</p>
                        <button onClick={onBackToCalendar} className="go-to-calendar-btn">
                            캘린더로 이동
                        </button>
                    </div>
                ) : (
                    <div className="schedule-table-wrapper">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th className="time-header">시간</th>
                                    <th className="date-header">날짜</th>
                                    <th className="activity-header">활동</th>
                                    <th className="notes-header">메모</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTimes.map((time) => {
                                    const timeSlots = timeSlotsByTime[time];
                                    return timeSlots.map((timeSlot, index) => (
                                        <tr key={timeSlot.id} className="schedule-row">
                                            {index === 0 && (
                                                <td
                                                    className="time-cell"
                                                    rowSpan={timeSlots.length}
                                                >
                                                    <span className="time-display">{formatTime(time)}</span>
                                                </td>
                                            )}
                                            <td className="date-cell">
                                                <div className="date-info">
                                                    <span className="date-display">
                                                        {formatDisplayDate(new Date(timeSlot.date))}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="activity-cell">
                                                <span className="activity-text">{timeSlot.activity}</span>
                                            </td>
                                            <td className="notes-cell">
                                                {timeSlot.notes ? (
                                                    <span className="notes-text">{timeSlot.notes}</span>
                                                ) : (
                                                    <span className="no-notes">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ));
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {sortedTimes.length > 0 && (
                <div className="table-summary">
                    <div className="summary-card">
                        <h3>일정 요약</h3>
                        <div className="summary-stats">
                            <div className="summary-stat">
                                <span className="stat-label">총 여행일</span>
                                <span className="stat-value">{schedules.filter(s => s.timeSlots.length > 0).length}일</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">총 일정</span>
                                <span className="stat-value">{totalTimeSlots}개</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">평균 일정</span>
                                <span className="stat-value">
                                    {Math.round(totalTimeSlots / schedules.filter(s => s.timeSlots.length > 0).length)}개/일
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleTable; 