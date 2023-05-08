interface TODO {
  time: number;
  duration: number;
}

export function getIndexForTime(TODOs, time) {
  for (let x = 0; x < TODOs.length; x++) {
    if (TODOs[x].time > time) return x;
  }
  return TODOs.length;
}

export function getDraggableItems(newTODOs) {
  let newDraggableItems = [];
  let lastTODODay = null;
  let lastTODO: TODO | null = null;
  newTODOs.map((newTODO, index) => {
    // iterate todos
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
      if (!(index === 0 && happenToday)) {
        newDraggableItems.push({
          id: label,
          key: label,
          type: "label",
          label: label,
        });
      }
    }
    let padding = new Date(newTODO.time).toDateString();
    // push red padding if clash with next item
    let clashedWithPrevious = lastTODO
      ? lastTODO.time + lastTODO.duration > newTODO.time
      : false;
    if (clashedWithPrevious) {
      newDraggableItems.push({
        id: padding,
        key: padding,
        type: "padding",
        label: padding,
      });
    }
    newDraggableItems.push(
      JSON.parse(
        JSON.stringify({
          ...newTODO,
          id: newTODO.id,
          type: "todo",
          topOfDay: beginOfDay,
          bottomOfDay: endOfDay,
          passed: newTODO.time + newTODO.duration < now.getTime(),
        })
      )
    );
    lastTODODay = new Date(newTODO.time).getDay();
    lastTODO = newTODO;
  });
  return newDraggableItems;
}

export function getColor(i: number, numItems: number = 25) {
  const multiplier = 60 / (numItems - 1);
  const colorVal = i * multiplier;

  return `rgb(107, ${152 - colorVal}, 35)`;
  // return `rgb(${colorVal}, ${Math.abs(255 - colorVal)}, ${Math.abs(128 - colorVal)})`;
}
