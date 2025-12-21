import React from 'react';
import '../TourPlanner.css';

class TourPlanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTour: null,
      selectedTime: '',
      visitorCount: 1,
      tours: [],
      bookingStatus: 'idle',
      bookingDetails: null,
      isLoading: true,
      error: null
    };
    
    this.handleTourSelect = this.handleTourSelect.bind(this);
    this.handleTimeSelect = this.handleTimeSelect.bind(this);
    this.handleVisitorCountChange = this.handleVisitorCountChange.bind(this);
    this.handleBookTour = this.handleBookTour.bind(this);
    this.handleSecurityCheck = this.handleSecurityCheck.bind(this);
    this.loadTours = this.loadTours.bind(this);
  }

  componentDidMount() {
    console.log('TourPlanner компонент смонтирован');
    this.loadTours();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedTour !== this.state.selectedTour) {
      console.log('Выбранная экскурсия изменилась:', this.state.selectedTour?.name);
    }
  }

  componentWillUnmount() {
    console.log('TourPlanner компонент будет размонтирован');
  }

  async loadTours() {
    try {
      this.setState({ isLoading: true, error: null });
      
      const token = localStorage.getItem('authToken') || 'demo-token';
      const response = await fetch('http://localhost:5000/api/tours', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Туры загружены:', data.tours?.length);
        
        this.setState({ 
          tours: data.tours || [],
          isLoading: false 
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка загрузки экскурсий');
      }
    } catch (error) {
      console.error('Ошибка загрузки экскурсий:', error);
      this.setState({ 
        error: error.message,
        isLoading: false,
        tours: [] 
      });
    }
  }

  handleTourSelect(tour) {
    this.setState({
      selectedTour: tour,
      selectedTime: '',
      visitorCount: 1
    });
    
    if (this.props.onTourCreate) {
      this.props.onTourCreate(tour);
    }
  }

  handleTimeSelect(time) {
    this.setState({ selectedTime: time });
  }

  handleVisitorCountChange(delta) {
    const { visitorCount } = this.state;
    const newCount = visitorCount + delta;
    
    if (newCount >= 1) {
      this.setState({ visitorCount: newCount });
    }
  }

  handleSecurityCheck(area) {
    console.log(`Проверка безопасности для зоны: ${area}`);
    
    if (this.props.onSecurityCheck) {
      this.props.onSecurityCheck(area);
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ Проверка безопасности пройдена');
        resolve(true);
      }, 300);
    });
  }

  async handleBookTour() {
    const { selectedTour, selectedTime, visitorCount } = this.state;
    
    if (!selectedTour) {
      alert('Пожалуйста, выберите экскурсию');
      return;
    }

    if (!selectedTime) {
      alert('Пожалуйста, выберите время');
      return;
    }

    if (visitorCount < 1) {
      alert('Количество посетителей должно быть не менее 1');
      return;
    }

    try {
      this.setState({ bookingStatus: 'checking_security' });
      
      await this.handleSecurityCheck('экскурсионная зона');
      
      this.setState({ bookingStatus: 'processing' });
      
      setTimeout(() => {
        const totalPrice = selectedTour.price * visitorCount;
        const bookingDetails = {
          bookingId: `TOUR-${Date.now()}`,
          tourId: selectedTour.id,
          tourName: selectedTour.name,
          time: selectedTime,
          visitors: visitorCount,
          totalPrice: totalPrice,
          status: 'confirmed',
          bookingDate: new Date().toLocaleString('ru-RU'),
          tourDuration: selectedTour.duration,
          unitPrice: selectedTour.price
        };
        
        this.setState({
          bookingStatus: 'success',
          bookingDetails: bookingDetails
        });
        
        
        alert(`🎉 Экскурсия "${selectedTour.name}" забронирована!
Подробности будут отправлены на email.`);
        
      }, 1500);
      
    } catch (error) {
      this.setState({ 
        bookingStatus: 'error',
        bookingDetails: null 
      });
      alert('Ошибка при бронировании. Попробуйте позже.');
    }
  }

  renderBookingStatus() {
    const { bookingStatus } = this.state;
    
    switch (bookingStatus) {
      case 'checking_security':
        return <div className="status-checking"> Проверка безопасности...</div>;
      case 'processing':
        return <div className="status-processing"> Обработка бронирования...</div>;
      case 'success':
        return <div className="status-success"> Бронирование завершено!</div>;
      case 'error':
        return <div className="status-error"> Ошибка бронирования</div>;
      default:
        return null;
    }
  }

  renderTours() {
    const { tours, selectedTour, isLoading, error } = this.state;

    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка экскурсий...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p>Ошибка загрузки: {error}</p>
          <button onClick={this.loadTours} className="retry-btn">
            Повторить попытку
          </button>
        </div>
      );
    }

    if (tours.length === 0) {
      return (
        <div className="empty-container">
          <p> Нет доступных экскурсий</p>
          <button onClick={this.loadTours} className="retry-btn">
            Обновить список
          </button>
        </div>
      );
    }

    return (
      <div className="tours-grid">
        {tours.map(tour => (
          <div 
            key={tour.id || tour._id}
            className={`tour-card ${selectedTour?.id === tour.id ? 'selected' : ''}`}
            onClick={() => this.handleTourSelect(tour)}
          >
            <div className="tour-header">
              <h4>{tour.name}</h4>
              <span className="tour-price">{tour.price} руб.</span>
            </div>
            <p className="tour-description">{tour.description}</p>
            <div className="tour-details">
              <span>⏱️ {tour.duration} мин.</span>
              <span>👥 без ограничений</span>
            </div>
            <div className="tour-schedule">
              <small>Доступное время: {tour.schedule.join(', ')}</small>
            </div>
            {!tour.isActive && (
              <div className="tour-inactive">
                <span>Неактивна</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { 
      selectedTour, 
      selectedTime, 
      visitorCount, 
      bookingDetails,
      tours
    } = this.state;

    return (
      <div className="tour-planner">
        <div className="planner-header">
          <h2>🗺️ Планировщик экскурсий</h2>
          <p>Выберите и забронируйте экскурсию по музею</p>
          <div className="tours-stats">
            <span>Доступно экскурсий: {tours.length}</span>
            <button onClick={this.loadTours} className="refresh-tours-btn">
              🔄 Обновить
            </button>
          </div>
        </div>

        <div className="planner-content">
          <div className="tours-selection">
            <h3>Доступные экскурсии</h3>
            {this.renderTours()}
          </div>

          {selectedTour && (
            <div className="booking-form">
              <h3>Бронирование: {selectedTour.name}</h3>
              
              <div className="form-group">
                <label>Выберите время:</label>
                <div className="time-slots">
                  {selectedTour.schedule.map(time => (
                    <button
                      key={time}
                      className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => this.handleTimeSelect(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Количество посетителей:</label>
                <div className="visitor-counter">
                  <button 
                    onClick={() => this.handleVisitorCountChange(-1)}
                    disabled={visitorCount <= 1}
                  >
                    -
                  </button>
                  <span>{visitorCount}</span>
                  <button 
                    onClick={() => this.handleVisitorCountChange(1)}
                  >
                    +
                  </button>
                  <span className="counter-info">(без ограничений)</span>
                </div>
              </div>

              {this.renderBookingStatus()}

              <div className="booking-summary">
                <h4>Сводка бронирования:</h4>
                <div className="summary-details">
                  <p>Экскурсия: <strong>{selectedTour.name}</strong></p>
                  <p>Время: <strong>{selectedTime || 'не выбрано'}</strong></p>
                  <p>Длительность: <strong>{selectedTour.duration} минут</strong></p>
                  <p>Количество посетителей: <strong>{visitorCount}</strong></p>
                  <p>Цена за билет: <strong>{selectedTour.price} руб.</strong></p>
                  <p className="total-price">
                    Итого: <strong>{selectedTour.price * visitorCount} руб.</strong>
                  </p>
                </div>
              </div>

              <button 
                onClick={this.handleBookTour}
                className="book-btn"
                disabled={!selectedTime || this.state.bookingStatus === 'processing'}
              >
                🎫 Забронировать экскурсию
              </button>

              {bookingDetails && (
                <div className="booking-confirmation">
                  <h4>Подтверждение бронирования:</h4>
                  <div className="confirmation-details">
                    <p><strong>ID:</strong> {bookingDetails.bookingId}</p>
                    <p><strong>Экскурсия:</strong> {bookingDetails.tourName}</p>
                    <p><strong>Время:</strong> {bookingDetails.time}</p>
                    <p><strong>Посетителей:</strong> {bookingDetails.visitors}</p>
                    <p><strong>Общая стоимость:</strong> {bookingDetails.totalPrice} руб.</p>
                    <p><strong>Статус:</strong> <span className="status-confirmed">Подтверждено</span></p>
                    <p><strong>Дата бронирования:</strong> {bookingDetails.bookingDate}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      
      
        
      </div>
    );
  }
}

export default TourPlanner;