import React, { useState, useEffect } from 'react';

const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState({
    local: '',
    utc: '',
    timezone: ''
  });

  const [userTimezone, setUserTimezone] = useState('');

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);

    const updateTime = () => {
      const now = new Date();
      
      setCurrentTime({
        local: now.toLocaleString('ru-RU', {
          timeZone: timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        utc: now.toUTCString(),
        timezone: timezone
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="time-display">
      <div className="time-container">
        <div className="time-section">
          <h3>⏰ Время пользователя</h3>
          <div className="time-value">{currentTime.local}</div>
          <div className="timezone-info">Часовой пояс: {userTimezone}</div>
        </div>
        
        <div className="time-section">
          <h3>🌐 UTC время</h3>
          <div className="time-value">{currentTime.utc}</div>
          <div className="timezone-info">Всемирное координированное время</div>
        </div>
        
        <div className="time-section">
          <h3>📅 Разница во времени</h3>
          <div className="time-value">
            {(() => {
              const now = new Date();
              const localOffset = now.getTimezoneOffset();
              const hoursDiff = Math.abs(localOffset) / 60;
              const sign = localOffset <= 0 ? '+' : '-';
              return `UTC${sign}${hoursDiff}`;
            })()}
          </div>
          <div className="timezone-info">Разница с UTC в часах</div>
        </div>
      </div>
    </div>
  );
};

export default TimeDisplay;