export function getDraggableItems(newTODOs) {
  let newDraggableItems = [];
  let lastTODODay = null;
  newTODOs.map((newTODO, index) => {
    let dayPosition = "middle";
    let currentDay = new Date(newTODO.time).getDay();
    let nextTODO = newTODOs[index + 1];
    let nextTODODay = nextTODO ? new Date(nextTODO.time).getDay() : null;
    let beginOfDay = currentDay !== lastTODODay;
    let endOfDay = currentDay !== nextTODODay;

    let date = new Date(newTODO.time);
    let now = new Date();
    let isSameDate = date.toLocaleDateString() === now.toLocaleDateString();
    let happenToday = isSameDate;
    if (beginOfDay) {
      dayPosition = "top";
      let label = new Date(newTODO.time).toDateString();
      if (date.getDate() === now.getDate() + 1) label = "Tomorrow";
      else if (happenToday) {
        label = "Today";
      }
      if (!(index === 0 && happenToday))
        newDraggableItems.push({
          id: label,
          key: label,
          isLabel: true,
          label: label,
        });
    }

    newDraggableItems.push(
      JSON.parse(
        JSON.stringify({
          ...newTODO,
          id: newTODO.id,
          topOfDay: beginOfDay,
          bottomOfDay: endOfDay,
          passed: newTODO.time + newTODO.duration < now.getTime(),
        })
      )
    );
    lastTODODay = new Date(newTODO.time).getDay();
  });
  return newDraggableItems;
}

export function getColor(i: number, numItems: number = 25) {
  const multiplier = 60 / (numItems - 1);
  const colorVal = i * multiplier;

  return `rgb(107, ${152 - colorVal}, 35)`;
  // return `rgb(${colorVal}, ${Math.abs(255 - colorVal)}, ${Math.abs(128 - colorVal)})`;
}
