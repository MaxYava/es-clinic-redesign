export const TREE_STOP_FRAMES = {
  contract: [30, 68, 95],
  closeup: [33, 43, 95],
  sprout: [32, 67, 95],
  documentary: [35, 43, 95],
};

export const TREE_HOLD_VIEWPORTS = .62;
export const TREE_GROWTH_SEGMENTS = [.34, .32, .34];

export function treeStoryboard(distance, animationDistance, viewportHeight, frames) {
  const holdDistance = viewportHeight * TREE_HOLD_VIEWPORTS;
  let offset = 0;
  let previous = 0;

  for (let index = 0; index < frames.length; index++) {
    const stop = frames[index] / 95;
    const growthDistance = TREE_GROWTH_SEGMENTS[index] * animationDistance;
    if (distance < offset + growthDistance) {
      return { progress: previous + (distance - offset) / growthDistance * (stop - previous), active: -1 };
    }
    offset += growthDistance;
    if (distance < offset + holdDistance) {
      return { progress: stop, active: index };
    }
    offset += holdDistance;
    previous = stop;
  }

  // Keep the last point visible until the section leaves the viewport.
  return { progress: 1, active: frames.length - 1 };
}
