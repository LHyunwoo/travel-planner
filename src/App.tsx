import { useState } from 'react'
import './App.css'
import ScheduleTable from './ScheduleTable'
import ScheduleDetail from './ScheduleDetail'

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

function App() {
  // 신혼여행 기간 고정
  const HONEYMOON_START = new Date('2026-05-31');
  const HONEYMOON_END = new Date('2026-06-12');

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<'calendar' | 'schedule' | 'table'>('calendar');
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    // localStorage에서 저장된 일정 불러오기
    const savedSchedules = localStorage.getItem('honeymoon-schedules');
    return savedSchedules ? JSON.parse(savedSchedules) : [];
  });
  const [newTimeSlot, setNewTimeSlot] = useState({
    time: '',
    activity: '',
    notes: ''
  });

  // 신혼여행 기간의 모든 날짜 생성
  const getHoneymoonDays = () => {
    const days = [];
    const currentDate = new Date(HONEYMOON_START);

    while (currentDate <= HONEYMOON_END) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getScheduleForDate = (date: string) => {
    return schedules.find(schedule => schedule.date === date) || { date, timeSlots: [] };
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setCurrentPage('schedule');
  };

  const goBackToCalendar = () => {
    setCurrentPage('calendar');
    setSelectedDate('');
  };

  const goToScheduleTable = () => {
    setCurrentPage('table');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(schedules, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `honeymoon-schedule-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSchedules = JSON.parse(e.target?.result as string);
        setSchedules(importedSchedules);
        localStorage.setItem('honeymoon-schedules', JSON.stringify(importedSchedules));
        alert('일정이 성공적으로 가져와졌습니다!');
      } catch (error) {
        alert('파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('모든 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setSchedules([]);
      localStorage.removeItem('honeymoon-schedules');
      alert('모든 일정이 삭제되었습니다.');
    }
  };

  const addTimeSlot = () => {
    if (!selectedDate || !newTimeSlot.time || !newTimeSlot.activity) return;

    const timeSlot: TimeSlot = {
      id: Date.now().toString(),
      time: newTimeSlot.time,
      activity: newTimeSlot.activity,
      notes: newTimeSlot.notes
    };

    const existingSchedule = schedules.find(schedule => schedule.date === selectedDate);
    let newSchedules: DaySchedule[];

    if (existingSchedule) {
      newSchedules = schedules.map(schedule =>
        schedule.date === selectedDate
          ? { ...schedule, timeSlots: [...schedule.timeSlots, timeSlot] }
          : schedule
      );
    } else {
      newSchedules = [...schedules, { date: selectedDate, timeSlots: [timeSlot] }];
    }

    setSchedules(newSchedules);
    // localStorage에 저장
    localStorage.setItem('honeymoon-schedules', JSON.stringify(newSchedules));

    setNewTimeSlot({ time: '', activity: '', notes: '' });
  };

  const deleteTimeSlot = (timeSlotId: string) => {
    const newSchedules = schedules.map(schedule => ({
      ...schedule,
      timeSlots: schedule.timeSlots.filter(slot => slot.id !== timeSlotId)
    }));
    setSchedules(newSchedules);
    // localStorage에 저장
    localStorage.setItem('honeymoon-schedules', JSON.stringify(newSchedules));
  };

  const deleteSchedule = (date: string) => {
    const newSchedules = schedules.filter(schedule => schedule.date !== date);
    setSchedules(newSchedules);
    // localStorage에 저장
    localStorage.setItem('honeymoon-schedules', JSON.stringify(newSchedules));
  };

  const honeymoonDays = getHoneymoonDays();
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // 캘린더 페이지
  if (currentPage === 'calendar') {
    return (
      <div className="app calendar-page">
        <header className="header">
          <h1 className="title">현우♡도인 신혼여행 계획</h1>
          <p className="subtitle">스페인 여행 계획 💕</p>
          <p className="honeymoon-period">2026년 5월 31일 ~ 2026년 6월 12일</p>
        </header>

        <div className="calendar-container">
          <div className="calendar-header-section">
            <div className="calendar-title-section">
              <h2 className="calendar-title">신혼여행 일정표</h2>
              <p className="calendar-subtitle">날짜를 클릭하여 상세 일정을 관리하세요</p>
            </div>
            <div className="calendar-actions">
              <div className="data-management">
                <button onClick={goToScheduleTable} className="action-btn">
                  📋 전체 일정표 보기
                </button>
                <button onClick={exportData} className="action-btn" disabled={schedules.length === 0}>
                  📤 내보내기
                </button>
                <label className="import-btn">
                  <span className="action-btn">📥 가져오기</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                  />
                </label>
                <button onClick={clearAllData} className="action-btn" disabled={schedules.length === 0}>
                  🗑️ 전체 삭제
                </button>
              </div>
            </div>
          </div>

          <div className="honeymoon-calendar">
            {honeymoonDays.map((day, index) => {
              const dateStr = formatDate(day);
              const schedule = getScheduleForDate(dateStr);
              const isToday = formatDate(new Date()) === dateStr;

              return (
                <div
                  key={index}
                  className={`honeymoon-day ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(dateStr)}
                >
                  <div className="day-header">
                    <span className="day-number">{day.getDate()}</span>
                    <span className="day-of-week">{['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}</span>
                  </div>
                  <div className="day-info">
                    <span className="month-day">{monthNames[day.getMonth()]} {day.getDate()}일</span>
                    {schedule.timeSlots.length > 0 && (
                      <div className="schedule-indicator">
                        <span className="schedule-count">{schedule.timeSlots.length}개 일정</span>
                      </div>
                    )}
                  </div>
                  <div className="day-hover-text">클릭하여 일정 관리</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 일정표 페이지
  if (currentPage === 'table') {
    return (
      <ScheduleTable
        schedules={schedules}
        onBackToCalendar={goBackToCalendar}
      />
    );
  }

  // 시간표 페이지
  if (currentPage === 'schedule') {
    return (
      <ScheduleDetail
        selectedDate={selectedDate}
        newTimeSlot={newTimeSlot}
        setNewTimeSlot={setNewTimeSlot}
        addTimeSlot={addTimeSlot}
        getScheduleForDate={getScheduleForDate}
        deleteTimeSlot={deleteTimeSlot}
        deleteSchedule={deleteSchedule}
        goBackToCalendar={goBackToCalendar}
      />
    );
  }
}

export default App