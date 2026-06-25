/* --- Reset & Base --- */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 1.5rem;
    transition: background 1s ease;
    position: relative;
    overflow-x: hidden;
}

/* --- Canvas (Particles) --- */
#weather-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
}

/* --- App Container --- */
.app {
    max-width: 1000px;
    width: 100%;
    background: rgba(22, 28, 40, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 40px;
    padding: 2.5rem 2rem;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
    position: relative;
    z-index: 1;
}

/* --- Dynamic Backgrounds (applied to body) --- */
body.bg-sunny { background: linear-gradient(135deg, #f7971e, #ffd200); }
body.bg-cloudy { background: linear-gradient(135deg, #bdc3c7, #2c3e50); }
body.bg-rainy { background: linear-gradient(135deg, #2c3e50, #0f2027); }
body.bg-snowy { background: linear-gradient(135deg, #e6e9f0, #a8c0ff); }
body.bg-thunder { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); }
body.bg-night { background: linear-gradient(135deg, #0b0e14, #1a1a2e, #2d2d44); }
body.bg-foggy { background: linear-gradient(135deg, #606c88, #3f4c6b); }

/* --- Header --- */
header { text-align: center; margin-bottom: 1.5rem; }
header h1 {
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #60a5fa, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
header p { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; }

/* --- Controls --- */
.controls {
    display: flex;
    gap: 0.8rem;
    justify-content: flex-end;
    margin-bottom: 1rem;
}
.btn-toggle, .btn-location {
    font-family: 'Inter', sans-serif;
    background: rgba(13, 17, 26, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e8edf5;
    padding: 0.4rem 1.2rem;
    border-radius: 40px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-toggle:hover, .btn-location:hover {
    background: rgba(96, 165, 250, 0.2);
    border-color: #60a5fa;
}

/* --- Search --- */
.search-container { margin-bottom: 1.5rem; }
.search-box { display: flex; gap: 0.8rem; }
.search-box input {
    flex: 1;
    font-family: 'Inter', sans-serif;
    background: rgba(13, 17, 26, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 0.9rem 1.2rem;
    color: #e8edf5;
    font-size: 1rem;
}
.search-box input:focus {
    outline: none;
    border-color: #60a5fa;
}
.search-box button {
    font-family: 'Inter', sans-serif;
    background: #60a5fa;
    color: #0b0e14;
    border: none;
    border-radius: 16px;
    padding: 0.9rem 2rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}
.search-box button:hover { background: #3b82f6; transform: scale(1.02); }

.search-status {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #8892a8;
    min-height: 1.5rem;
}
.search-status.error { color: #f87171; }
.search-status.success { color: #4ade80; }

/* --- History Chips --- */
.history-chips {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.6rem;
}
.history-chip {
    background: rgba(13, 17, 26, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e8edf5;
    padding: 0.2rem 1rem;
    border-radius: 40px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}
.history-chip:hover {
    background: rgba(96, 165, 250, 0.3);
    border-color: #60a5fa;
}

/* --- Current Weather --- */
.current-weather {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(13, 17, 26, 0.4);
    border-radius: 28px;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.04);
}
.current-left h2 { font-size: 2rem; font-weight: 700; }
.current-temp { font-size: 3.2rem; font-weight: 700; line-height: 1.1; }
.current-feelslike { font-size: 0.95rem; color: #8892a8; margin-top: 0.1rem; }
.current-condition { font-size: 1.1rem; color: #8892a8; }
.current-details {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.6rem;
    font-size: 0.95rem;
    color: #8892a8;
    flex-wrap: wrap;
}
.sun-schedule {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.4rem;
    font-size: 0.9rem;
    color: #8892a8;
}
.current-right { font-size: 5rem; line-height: 1; }
.weather-icon-large { display: flex; align-items: center; justify-content: center; }

/* --- Hourly Forecast --- */
.hourly-forecast { margin-bottom: 2rem; }
.hourly-forecast h2 { font-size: 1.1rem; margin-bottom: 0.8rem; }
.hourly-scroll {
    display: flex;
    gap: 0.8rem;
    overflow-x: auto;
    padding: 0.5rem 0.2rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
}
.hourly-scroll::-webkit-scrollbar { height: 4px; }
.hourly-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }

.hourly-card {
    flex: 0 0 80px;
    background: rgba(13, 17, 26, 0.5);
    border-radius: 16px;
    padding: 0.8rem 0.4rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.04);
    scroll-snap-align: start;
    min-width: 70px;
}
.hourly-card .hourly-time { font-size: 0.7rem; color: #8892a8; }
.hourly-card .hourly-icon { font-size: 1.8rem; margin: 0.2rem 0; }
.hourly-card .hourly-temp { font-weight: 700; font-size: 1rem; }
.hourly-card .hourly-precip { font-size: 0.6rem; color: #60a5fa; }

/* --- 5-Day Forecast --- */
.forecast h2 { font-size: 1.1rem; margin-bottom: 0.8rem; }
.forecast-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.8rem;
}
.forecast-card {
    background: rgba(13, 17, 26, 0.5);
    border-radius: 20px;
    padding: 1.2rem 0.8rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.04);
    transition: all 0.2s;
}
.forecast-card:hover {
    background: rgba(13, 17, 26, 0.75);
    transform: translateY(-4px);
}
.forecast-day { font-weight: 600; font-size: 0.8rem; color: #8892a8; text-transform: uppercase; }
.forecast-icon { font-size: 2.4rem; margin: 0.4rem 0; }
.forecast-temp { font-weight: 700; font-size: 1.2rem; }
.forecast-temp .low { color: #8892a8; font-weight: 400; font-size: 0.95rem; }

/* --- Footer --- */
footer { text-align: center; color: #475569; font-size: 0.8rem; margin-top: 2rem; }
footer a { color: #60a5fa; text-decoration: none; }
footer a:hover { text-decoration: underline; }

/* --- Responsive --- */
@media (max-width: 768px) {
    .app { padding: 1.5rem 1rem; border-radius: 24px; }
    .controls { justify-content: stretch; }
    .controls button { flex: 1; text-align: center; }
    .search-box { flex-direction: column; }
    .search-box button { width: 100%; padding: 0.8rem; }
    .current-weather { flex-direction: column; text-align: center; padding: 1.5rem; }
    .current-details { justify-content: center; flex-wrap: wrap; }
    .sun-schedule { justify-content: center; }
    .current-right { font-size: 4rem; margin-top: 0.5rem; }
    .forecast-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 480px) {
    .forecast-grid { grid-template-columns: repeat(2, 1fr); }
    .hourly-card { flex: 0 0 65px; min-width: 60px; }
}
