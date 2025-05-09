import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const CumpleañosModal = ({ fechaNacimiento }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [dimensiones, setDimensiones] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);

    const esCumple = hoy.getDate() === fechaNac.getDate() &&
                     hoy.getMonth() === fechaNac.getMonth();

    if (esCumple) {
      setMostrarModal(true);
      setDimensiones({ width: window.innerWidth, height: window.innerHeight });
    }
  }, [fechaNacimiento]);

  if (!mostrarModal) return null;

  return (
    <>
      <Confetti width={dimensiones.width} height={dimensiones.height} />
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2>🎉 ¡Feliz Cumpleaños! 🎂</h2>
          <img
            src="/assets/images/cumpleanos.png"
            alt="Feliz Cumpleaños"
            style={{ width: '200px', marginBottom: '1rem' }}
          />
          <p>Te deseamos un día lleno de alegría y sorpresas 🥳</p>
          <button onClick={() => setMostrarModal(false)} style={styles.btn}>
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 9999,
  },
  modal: {
    backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem',
    textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  btn: {
    marginTop: '1rem', padding: '0.5rem 1rem', border: 'none',
    backgroundColor: '#ff4081', color: 'white', borderRadius: '0.5rem',
    cursor: 'pointer',
  },
};

export default CumpleañosModal;
