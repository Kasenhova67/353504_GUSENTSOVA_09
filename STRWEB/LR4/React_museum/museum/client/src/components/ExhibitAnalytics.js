import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

class ExhibitAnalytics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      analyticsData: [],
      loading: true,
      error: null,
      selectedPeriod: 'week',
      totalViews: 0,
      totalInteractions: 0,
      popularExhibit: null
    };
    
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
    this.fetchAnalyticsData = this.fetchAnalyticsData.bind(this);
    this.exportToCSV = this.exportToCSV.bind(this);
    this.simulateInteraction = this.simulateInteraction.bind(this);
  }

  componentDidMount() {
    this.fetchAnalyticsData();
    this.interval = setInterval(() => {
      this.simulateInteraction();
    }, 30000); 
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedPeriod !== this.state.selectedPeriod) {
      this.fetchAnalyticsData();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async fetchAnalyticsData() {
    try {
      this.setState({ loading: true, error: null });
   
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const periods = {
        week: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        month: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'],
        year: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      };
      
      const labels = periods[this.state.selectedPeriod];
      const data = labels.map((label, index) => ({
        name: label,
        просмотры: Math.floor(Math.random() * 100) + 50,
        аудиогиды: Math.floor(Math.random() * 30) + 20,
        сканирования: Math.floor(Math.random() * 20) + 10,
        'время (мин)': Math.floor(Math.random() * 15) + 5
      }));
      
      const totalViews = data.reduce((sum, item) => sum + item.просмотры, 0);
      const totalInteractions = data.reduce((sum, item) => 
        sum + item.аудиогиды + item.сканирования, 0
      );
      
      const popularDay = data.reduce((max, item) => 
        item.просмотры > max.views ? { day: item.name, views: item.просмотры } : max,
        { day: '', views: 0 }
      );
      
      this.setState({
        analyticsData: data,
        loading: false,
        totalViews,
        totalInteractions,
        popularExhibit: popularDay
      });
      
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
      this.setState({
        error: 'Не удалось загрузить данные аналитики',
        loading: false
      });
    }
  }

  handlePeriodChange(event) {
    this.setState({ selectedPeriod: event.target.value });
  }

  simulateInteraction() {
    const newData = [...this.state.analyticsData];
    const lastIndex = newData.length - 1;
    
    if (newData[lastIndex]) {
      newData[lastIndex] = {
        ...newData[lastIndex],
        просмотры: newData[lastIndex].просмотры + Math.floor(Math.random() * 5),
        аудиогиды: newData[lastIndex].аудиогиды + Math.floor(Math.random() * 2)
      };
      
      this.setState(prevState => ({
        analyticsData: newData,
        totalViews: prevState.totalViews + Math.floor(Math.random() * 5),
        totalInteractions: prevState.totalInteractions + Math.floor(Math.random() * 2)
      }));
    }
  }

  exportToCSV() {
    const { analyticsData, selectedPeriod } = this.state;
    const headers = ['Период', 'Просмотры', 'Аудиогиды', 'Сканирования', 'Среднее время (мин)'];
    
    const csvContent = [
      headers.join(','),
      ...analyticsData.map(row => 
        [row.name, row.просмотры, row.аудиогиды, row.сканирования, row['время (мин)']].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `аналитика_экспонатов_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  render() {
    const { 
      analyticsData, 
      loading, 
      error, 
      selectedPeriod,
      totalViews,
      totalInteractions,
      popularExhibit
    } = this.state;

    if (loading) {
      return (
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Загрузка аналитики...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="analytics-error">
          <p>❌ {error}</p>
          <button onClick={this.fetchAnalyticsData}>Повторить</button>
        </div>
      );
    }

    return (
      <div className="exhibit-analytics">
        <div className="analytics-header">
          <h2>📊 Аналитика посещений экспонатов</h2>
          <div className="analytics-controls">
            <select 
              value={selectedPeriod} 
              onChange={this.handlePeriodChange}
              className="period-select"
            >
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
              <option value="year">За год</option>
            </select>
            <button onClick={this.exportToCSV} className="export-btn">
              📥 Экспорт в CSV
            </button>
            <button onClick={this.fetchAnalyticsData} className="refresh-btn">
              🔄 Обновить
            </button>
          </div>
        </div>

        <div className="analytics-stats">
          <div className="stat-card">
            <h3>👁️ Всего просмотров</h3>
            <div className="stat-value">{totalViews}</div>
            <div className="stat-trend">↑ 12% за период</div>
          </div>
          <div className="stat-card">
            <h3>🎧 Взаимодействий</h3>
            <div className="stat-value">{totalInteractions}</div>
            <div className="stat-trend">↑ 8% за период</div>
          </div>
          <div className="stat-card">
            <h3>📈 Пик посещаемости</h3>
            <div className="stat-value">{popularExhibit?.day || 'Н/Д'}</div>
            <div className="stat-trend">{popularExhibit?.views || 0} просмотров</div>
          </div>
          <div className="stat-card">
            <h3>⏱️ Среднее время</h3>
            <div className="stat-value">7.5 мин</div>
            <div className="stat-trend">↔ без изменений</div>
          </div>
        </div>

        <div className="analytics-chart">
          <h3>График активности</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="просмотры" 
                stroke="#4cc9f0" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="аудиогиды" 
                stroke="#f72585" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="сканирования" 
                stroke="#7209b7" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-table">
          <h3>Детальная статистика</h3>
          <table>
            <thead>
              <tr>
                <th>Период</th>
                <th>Просмотры</th>
                <th>Аудиогиды</th>
                <th>Сканирования</th>
                <th>Ср. время (мин)</th>
                <th>Эффективность</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((row, index) => (
                <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.просмотры}</td>
                  <td>{row.аудиогиды}</td>
                  <td>{row.сканирования}</td>
                  <td>{row['время (мин)']}</td>
                  <td>
                    <div className="efficiency-bar">
                      <div 
                        className="efficiency-fill"
                        style={{ 
                          width: `${Math.min(100, (row.аудиогиды / row.просмотры) * 100)}%` 
                        }}
                      />
                      <span>
                        {Math.round((row.аудиогиды / row.просмотры) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="analytics-insights">
          <h3>💡 Инсайты и рекомендации</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>📅 Лучшее время</h4>
              <p>Пик посещаемости: среда, 14:00-16:00</p>
              <p>Рекомендуем увеличить персонал в это время</p>
            </div>
            <div className="insight-card">
              <h4>🎧 Аудиогиды</h4>
              <p>Используются в 35% посещений</p>
              <p>Рекомендуем добавить больше языков</p>
            </div>
            <div className="insight-card">
              <h4>🔍 Популярность</h4>
              <p>Самый популярный экспонат: "Скифское золото"</p>
              <p>Рассмотрите специальную выставку</p>
            </div>
            <div className="insight-card">
              <h4>⏱️ Время просмотра</h4>
              <p>Среднее время: 7.5 минут на экспонат</p>
              <p>Оптимально для восприятия информации</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ExhibitAnalytics;