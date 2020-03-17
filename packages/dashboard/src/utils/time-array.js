// Source: https://codereview.stackexchange.com/questions/121066/creating-an-array-with-quarter-hour-times/121097
const timeArray = () => {
  const quarterHours = ['00', '15', '30', '45'];
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 4; j++) {
      let time = `${i}:${quarterHours[j]}`;
      if (i < 10) {
        time = `0${time}`;
      }
      times.push(time);
    }
  }
  return times;
};

export default timeArray;
