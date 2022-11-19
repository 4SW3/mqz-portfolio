export function get3dMatrix(element) {
  const values = element.style.transform.split(/\w+\(|\);?/)
  const transform = values[1].split(/,\s?/g).map(el => parseInt(el))
  return {
    tx: transform[0],
    ty: transform[1],
    tz: transform[2]
  }
}