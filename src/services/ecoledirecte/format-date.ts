export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-indexed, so +1
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};
