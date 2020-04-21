export default class Util {
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * Math.abs(max - min + 1)) + min
  }
  static changeGroup(node: cc.Node, groupName: string) {
    node.active = false
    node.group = groupName
    node.active = true
  }
}
