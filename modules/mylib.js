// Toggles the active value for buttons
export function toggleButton(current) {
  const arr = document.getElementById('arr');
  const dep = document.getElementById('dep');
  if (current === 'ARRIVAL') {
    arr.classList.add('active');
    dep.classList.remove('active');
  } else {
    arr.classList.remove('active');
    dep.classList.add('active');
  }
}

export function compare(a, b) {
  if (a.time < b.time) return -1;
  if (a.time > b.time) return 1;
  return 0;
}
// Checks if train is a passanger train (Long-distance or commuter)
export function isPassengerTrain(trainCategory) {
  if (['Long-distance', 'Commuter'].indexOf(trainCategory) >= 0) return true;
  return false;
}
