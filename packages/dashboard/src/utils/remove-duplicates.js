// ref: https://stackoverflow.com/a/36236204/8668515

function removeDuplicates(originalArray, prop) {
  return originalArray.filter((item, pos, array) => {
    return array.map(mapItem => mapItem[prop]).indexOf(item[prop]) === pos;
  });
}

export default removeDuplicates;
