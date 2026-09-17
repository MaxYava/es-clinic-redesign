export function photoSource(name) {
  if (['hero', 'reception', 'clinic', 'history', 'frolov', 'utin'].includes(name)) {
    return `/assets/enhanced/${name}.webp`;
  }
  if (['tishina', 'sorokin', 'maksakov'].includes(name)) {
    return `/assets/doctors-original/${name}.webp`;
  }
  return `/assets/${name}.webp`;
}
