export default class Config {
  static ballStatus = {
    UP: 'ballInUp',
    BOUNCE: 'ballInBounce'
  }
  static ballInGameGroupName: string = 'ballInGame'
/** 地面高度 */
  static groundH: number = 145
  static barrierH: number = 300
  static wallH: number = 1080
  static originBallPos: cc.Vec2 = cc.v2(0, 435)
  static screenW: number = 0
  static screenH: number = 0
}
