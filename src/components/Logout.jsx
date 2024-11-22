import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    console.log('User logged out');

    navigate('/login');
  }, [navigate]);

  return null;
};

export default Logout;
