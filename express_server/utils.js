/**
# Utility Functions
**/


// asynchronous filter function
exports.asyncFilter = async function (arr, cb) {
  // console.log(arr);
  const res = await Promise.all(arr.map(cb));
  return arr.filter((_, idx) => res[idx]);
}


exports.isValidTime = function (str) {
  const re = new RegExp(/^([0]?[1-9]|1[0-2]):([0-5]\d)\s(AM|PM)$/i);

  return re.test(str);
}


// convert to 24-hour format hour
// 1 PM -> 13
// 2 PM -> 14
exports.to24HourFormat = function (time) {
  const period = time.slice(-2);
  const hour = parseInt(time.split(':')[0]);

  if (hour === 12)  return 12;

  return (period.toLowerCase() === 'pm') ? hour + 12 : hour;
}


function zeroPadding (value, type) {
  let strValue = value.toString();
  if (type === "ms") {
    while (strValue.length < 3)
      strValue = '0' + strValue;
  }
  else {
    while (strValue.length < 2)
      strValue = '0' + strValue;
  }
  return strValue;
}


exports.generateId = function (initial) {
  const date = new Date();
  const year = date.getFullYear();
  const month = zeroPadding(date.getMonth() + 1);
  const day = zeroPadding(date.getDate());
  const hr = zeroPadding(date.getHours());
  const mm = zeroPadding(date.getMinutes());
  const ss = zeroPadding(date.getSeconds());
  const ms = zeroPadding(date.getMilliseconds());
  return `${initial}_${year}${month}${day}${hr}${mm}${ss}${ms}`;
}
