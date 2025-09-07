

export const getPeriodName = (name: string) => {
  // return only digits
  let digits = name.replace(/[^0-9]/g, '').trim();
  let newName = name.replace(digits, '').trim();

  return newName;
}

export const getPeriodNumber = (name: string) => {
  // return only digits
  let newName = name.replace(/[^0-9]/g, '').trim();

  if (newName.length === 0) {
    newName = name[0].toUpperCase();
  }

  return newName.toString()[0];
}