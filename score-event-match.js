function scoreEventMatch(left = {}, right = {}) {
  const actor = left.primaryActor && right.primaryActor && left.primaryActor === right.primaryActor;
  const action = left.primaryAction && right.primaryAction && left.primaryAction === right.primaryAction;
  const time = left.eventTimeWindow && right.eventTimeWindow && left.eventTimeWindow === right.eventTimeWindow;
  const object = Boolean((left.eventObject && left.eventObject === right.eventObject) || (left.consequence && left.consequence === right.consequence));
  const score = (actor ? 0.3 : 0) + (action ? 0.3 : 0) + (time ? 0.18 : 0) + (object ? 0.22 : 0);
  return { score, canMerge: actor && action && time && object && score >= 0.72 };
}

module.exports = { scoreEventMatch };
