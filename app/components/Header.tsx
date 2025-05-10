import React from 'react';

const Header = () => {
  return (
    <header className="w-full py-5 text-center backdrop-blur-sm" style={{
      background: 'linear-gradient(to right, var(--purple-dark), var(--purple-medium))',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 className="text-4xl font-bold tracking-wide" style={{ 
        color: 'var(--purple-lightest)',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
      }}>
        Course Tracker
      </h1>
    </header>
  );
};

export default Header; 