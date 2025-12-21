import React, { useState, useEffect, useRef } from 'react';

const ExhibitScanner = ({ onExhibitScan, onVisitorFlow }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scannedExhibits, setScannedExhibits] = useState([]);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(null);
  
  const scannerRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const previousScanCount = useRef(0);
  
  useEffect(() => {
    if (scannerRef.current) {
      scannerRef.current.focus();
      console.log('Сканер готов к использованию');
    }
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (scanCount !== previousScanCount.current) {
      console.log(`Количество сканирований изменилось: ${previousScanCount.current} → ${scanCount}`);
      previousScanCount.current = scanCount;
      
      if (onVisitorFlow) {
        const flowData = {
          totalScans: scanCount,
          lastScan: lastScanTime,
          activeUsers: scannedExhibits.length
        };
        onVisitorFlow(flowData);
      }
    }
  }, [scanCount, lastScanTime, scannedExhibits.length, onVisitorFlow]);
  
  const simulateScan = () => {
    if (!scannerRef.current) {
      console.error('Сканер не инициализирован');
      return;
    }
    setScanning(true);
    setScanResult(null);
    
    scannerRef.current.classList.add('active-focus');
    
    scanIntervalRef.current = setTimeout(() => {
      const mockExhibits = [
        {
          id: 1,
          name: "Древнегреческая амфора",
          category: "Археология",
          status: "scanned",
          scanTime: new Date().toLocaleTimeString(),
          location: "Зал Античности",
          value: "Высокая"
        },
        {
          id: 2,
          name: "Портрет Екатерины II",
          category: "Живопись",
          status: "scanned",
          scanTime: new Date().toLocaleTimeString(),
          location: "Зал Императоров",
          value: "Бесценно"
        },
        {
          id: 3,
          name: "Скифское золото",
          category: "Ювелирные изделия",
          status: "scanned",
          scanTime: new Date().toLocaleTimeString(),
          location: "Зал Скифов",
          value: "Бесценно"
        },
        {
          id: 4,
          name: "Египетский саркофаг",
          category: "Археология",
          status: "scanned",
          scanTime: new Date().toLocaleTimeString(),
          location: "Египетский зал",
          value: "Высокая"
        },
        {
          id: 5,
          name: "Средневековый меч",
          category: "Оружие",
          status: "scanned",
          scanTime: new Date().toLocaleTimeString(),
          location: "Рыцарский зал",
          value: "Средняя"
        }
      ];

      const randomExhibit = mockExhibits[Math.floor(Math.random() * mockExhibits.length)];
      
      setScanResult(randomExhibit);
      setScannedExhibits(prev => [randomExhibit, ...prev.slice(0, 9)]);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toLocaleTimeString());
      setScanning(false);
      
      scannerRef.current.classList.remove('active-focus');
      
      if (onExhibitScan) {
        onExhibitScan(randomExhibit);
      }
      
      // analyzeScan(randomExhibit);
      
    }, 1500);
  };
  

  const clearHistory = () => {
    setScannedExhibits([]);
    setScanCount(0);
    setScanResult(null);
    
    if (scannerRef.current) {
      scannerRef.current.focus();
    }
  };
  
  
  const startAutoScan = () => {
    const autoScan = () => {
      if (scanCount < 20) { 
        simulateScan();
      } else {
        stopAutoScan();
      }
    };
    
    scanIntervalRef.current = setInterval(autoScan, 3000);
  };
  
  const stopAutoScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };
  
  const getStats = () => {
    const categories = {};
    scannedExhibits.forEach(exhibit => {
      categories[exhibit.category] = (categories[exhibit.category] || 0) + 1;
    });
    
    return {
      total: scannedExhibits.length,
      categories: categories,
      uniqueItems: new Set(scannedExhibits.map(e => e.id)).size
    };
  };
  
  const stats = getStats();

  return (
    <div className="scanner-container" ref={scannerRef} tabIndex="0">
      <div className="scanner-header">
        <h2>📱 Сканер экспонатов</h2>
        <p>Используйте сканер для отслеживания экспонатов и сбора аналитики</p>
        <div className="scanner-stats">
          <span className="stat">Всего сканирований: <strong>{scanCount}</strong></span>
          <span className="stat">В истории: <strong>{scannedExhibits.length}</strong></span>
          <span className="stat">Уникальных: <strong>{stats.uniqueItems}</strong></span>
        </div>
      </div>

      <div className="scanner-main">
        <div className="scanner-area">
          <div className={`scanner-visual ${scanning ? 'scanning' : ''}`}>
            <div className="scanner-beam"></div>
            <div className="qr-placeholder">
              <div className="qr-code">📷</div>
              <p>Наведите камеру на QR-код экспоната</p>
            </div>
          </div>

          <div className="scan-controls">
            <button 
              onClick={simulateScan}
              disabled={scanning}
              className={`scan-btn ${scanning ? 'scanning' : ''}`}
            >
              {scanning ? 'Сканирование...' : '🔍 Начать сканирование'}
            </button>
            
            <div className="auto-scan-controls">
              <button onClick={startAutoScan} className="auto-btn">
                ▶️ Автосканирование
              </button>
              <button onClick={stopAutoScan} className="stop-btn">
                ⏹️ Остановить
              </button>
            </div>
          </div>

          {scanResult && (
            <div className="scan-result">
              <h3>✅ Экспонат отсканирован!</h3>
              <div className="result-details">
                <p><strong>Название:</strong> {scanResult.name}</p>
                <p><strong>Категория:</strong> {scanResult.category}</p>
                <p><strong>ID:</strong> {scanResult.id}</p>
                <p><strong>Местоположение:</strong> {scanResult.location}</p>
                <p><strong>Ценность:</strong> {scanResult.value}</p>
                <p><strong>Время:</strong> {scanResult.scanTime}</p>
              </div>
            </div>
          )}
        </div>

        <div className="scanned-history">
          <div className="history-header">
            <h3>📋 История сканирований</h3>
            <div className="history-actions">
              <button onClick={clearHistory} className="clear-btn">
                🗑️ Очистить
              </button>
            
            </div>
          </div>
          
          {scannedExhibits.length === 0 ? (
            <p className="no-history">Нет отсканированных экспонатов</p>
          ) : (
            <div className="history-list">
              {scannedExhibits.map((exhibit, index) => (
                <div key={`${exhibit.id}-${index}`} className="history-item">
                  <div className="item-number">{index + 1}</div>
                  <div className="item-details">
                    <h4>{exhibit.name}</h4>
                    <div className="item-meta">
                      <span className="item-category">{exhibit.category}</span>
                      <span className="item-location">{exhibit.location}</span>
                    </div>
                    <p>ID: {exhibit.id} • {exhibit.scanTime}</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge">✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default ExhibitScanner;