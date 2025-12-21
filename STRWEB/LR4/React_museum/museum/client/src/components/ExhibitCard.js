import React from 'react';
import { Link } from 'react-router-dom';

const ExhibitCard = React.memo(({ 
  exhibit, 
 
}) => {
  
  return (
    <div 
      className="exhibit-card"
    >
      <div className="card-image-container">
        <img 
          src={exhibit.imageUrl || 'https://via.placeholder.com/300x200/4cc9f0/ffffff?text=Экспонат'} 
          alt={exhibit.name}
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay">
          <span className="card-category">{exhibit.category}</span>
          <span className="card-year">{exhibit.year}</span>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{exhibit.name}</h3>
        <p className="card-description">
          {exhibit.description?.substring(0, 100) || 'Описание отсутствует'}...
        </p>
        
        <div className="card-footer">
          <div className="card-status">
            <span className={`status-badge status-${exhibit.status}`}>
              {exhibit.status === 'exhibited' ? 'На выставке' : 
               exhibit.status === 'stored' ? 'В хранилище' : 'На реставрации'}
            </span>
            <span className={`conservation-badge conservation-${exhibit.conservationState}`}>
              {exhibit.conservationState === 'excellent' ? 'Отличное' :
               exhibit.conservationState === 'good' ? 'Хорошее' : 'Удовл.'}
            </span>
          </div>
          
          <Link to={`/exhibits/${exhibit._id}`} className="card-link">
            Подробнее →
          </Link>
        </div>
      </div>
    </div>
  );
});

ExhibitCard.displayName = 'ExhibitCard';

export default ExhibitCard;