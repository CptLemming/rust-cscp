import React from 'react';

import RenderFaders from './components/faders';
import Info from './components/info';
import StateManager from './components/state';

function App() {
  return (
    <StateManager>
        <div className="app">
            <Info />
            <RenderFaders />
        </div>
    </StateManager>
  );
}

export default App;
