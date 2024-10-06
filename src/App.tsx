import type { Component } from 'solid-js';
import { currentView } from './signals/signals';
import Landing from './Pages/Landing';
import './style.css'

const hashMap = new Map([
  ['landing', <Landing />],
])

function App(): any {
  return (
    <div>
      {hashMap.get(currentView())}
    </div>
  );
};

export default App;
