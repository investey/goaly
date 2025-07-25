import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'black'
    }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Goaly App Test
        </h1>
        <p>Can you see this text?</p>
      </div>
    </div>
  );
};

export default App;