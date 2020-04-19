import Main from "../Main";

/** 全局共享的数据都挂载在 Game 下面，可在每个文件直接调用 */
export default class Game {
  /** 当前关卡 */
  static curLevel: number = 0
  /** 总脚本 */
  static mgr: Main = null
}
