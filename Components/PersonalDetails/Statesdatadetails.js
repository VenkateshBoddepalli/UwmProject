import React, { useState, useEffect } from 'react';
import Statesdata from './Statesdata';
import './Personaldetails.css';

const Statesdatadetails = ({ onStateSelect }) => {
  const [states, setStates] = useState([]);
  const [state, setState] = useState('');

  useEffect(() => {
    setStates(Statesdata);  
    const savedState = localStorage.getItem('state');
    if (savedState) {
      setState(savedState);
      onStateSelect(savedState); 
    }
  }, [onStateSelect]);

  const handleStateChange = (e) => {
    const state = e.target.value;
    setState(state);
    onStateSelect(state);
    localStorage.setItem('state', state);
        
  };

  return (
    <div className="form-row1">
      <div>
        <label className="state_name1">State<sup>*</sup></label></div>
      <div className="state-select1">
        <select className='state1' onChange={handleStateChange} value={state}>
          <option value="">Select a state</option>
          {states.map((eachUser, index) => {
            const { name } = eachUser;
            return (
              <option key={index} value={name}>
                {name}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default Statesdatadetails;