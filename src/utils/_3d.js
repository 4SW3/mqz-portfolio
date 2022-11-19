export function getObjectFitSize(contains, containerWidth, containerHeight, width, height) {
  const doRatio = width / height,
    cRatio = containerWidth / containerHeight
  let targetWidth = 0,
    targetHeight = 0
  return (contains ? doRatio > cRatio : doRatio < cRatio) ? (targetWidth = containerWidth, targetHeight = targetWidth / doRatio) : (targetHeight = containerHeight, targetWidth = targetHeight * doRatio), {
    width: targetWidth,
    height: targetHeight,
    x: (containerWidth - targetWidth) / 2,
    y: (containerHeight - targetHeight) / 2
  }
}

export function getViewportSize(fov, dist, aspect) {
  const height = 2 * dist * Math.tan(.5 * fov * (Math.PI / 180)),
    width = height * aspect

  return {
    width: width,
    height: height,
    w: width,
    h: height
  }
}
