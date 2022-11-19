import gsap from 'gsap'

export function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t
}

export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

export function interpolate(start, end, value) {
  return (start * (1.0 - value)) + (end * value)
}

export function clamp(min, max, number) {
  return Math.max(min, Math.min(number, max))
}

export function random(min, max) {
  return Math.random() * (max - min) + min
}

export function delay(ms) {
  return new Promise(res => gsap.delayedCall(ms / 1000, res))
}

Math.clamp = function (value, min = 0, max = 1) {
  return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max))
}
Math.range = function (value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, isClamp) {
  const newValue = (value - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin
  return isClamp ? Math.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax)) : newValue
}