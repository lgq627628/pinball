export default class Util {
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * Math.abs(max - min + 1)) + min
  }
}
