import './index.css'

const run = document.getElementById('run');
run.onclick = () => {
  const logs = document.getElementById('logs');
  logs.innerHTML = 'button clicked';
}