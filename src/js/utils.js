/* eslint-disable linebreak-style */
export default function formatDate(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const mount = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}.${mount}.${year}`;
}
