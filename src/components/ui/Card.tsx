import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

type CardProps = {
  title: string;
  description: string;
  category?: string;
  languages?: string[];
  link?: string;
  activeBorder?: boolean;
};

export const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  category, 
  languages = ['EN', 'ES'], 
  link,
  activeBorder = false
}) => {
  return (
    <div className={`card ${activeBorder ? 'card-active' : ''}`}>
      {category && (
        <span className="card-category">{category}</span>
      )}
      
      <h3 className="card-title font-serif">{title}</h3>
      <p className="card-description">{description}</p>
      
      <div className="card-footer">
        {link ? (
          <Link to={link} className="card-link">
            Open calculator <span>↗</span>
          </Link>
        ) : (
          <span className="card-planned">PLANNED</span>
        )}
        
        {languages && languages.length > 0 && (
          <span className="card-languages">
            {languages.join(' · ')}
          </span>
        )}
      </div>
    </div>
  );
};
