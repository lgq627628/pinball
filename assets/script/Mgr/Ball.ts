import Config from "../Common/Config";
import Util from "../Common/Util";
import Game from "../Common/Game";
import { BALL_STATUS } from "../Common/Enum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Ball extends cc.Component {

    rigidBody: cc.RigidBody = null
    hitGround: boolean = false

    start() {
      this.rigidBody = this.getComponent(cc.RigidBody)
    }

    closePhy() {
      if (!this.rigidBody) this.rigidBody = this.getComponent(cc.RigidBody)
      this.rigidBody.active = false
      this.rigidBody.linearVelocity = cc.Vec2.ZERO
    }

    openPhy(linearVelocity: cc.Vec2) {
      if (!this.rigidBody) this.rigidBody = this.getComponent(cc.RigidBody)
      this.rigidBody.active = true
      this.rigidBody.linearVelocity = linearVelocity
    }

    onBeginContact (contact, selfCollider, otherCollider) {
      // 碰撞到地面之后无法立即直接将 rigidBody 禁用掉，可能会影响当前碰撞后的其他操作，需要在下次更新中改动
      if (otherCollider.node.name === 'ground') this.hitGround = true
    }

    checkIsSleep() {
      if (this.node.group === BALL_STATUS.UP) return
      let l = this.rigidBody.linearVelocity.mag()
      // 弹的过程中可能停住了，需要判断一下，随便给个向上的初速度
      if (l <= 0.0000001) this.rigidBody.linearVelocity = cc.v2( Math.random() > 0.5 ? 100 : -100, 500)
    }

    update (dt) {
      this.checkIsSleep()
      if (!this.hitGround) return
      this.hitGround = false
      this.closePhy()
      let dir = this.node.x > 0 ? 1 : -1
      let pos1 = this.node.position
      let pos3 = cc.v2(dir * (Config.screenW/2 - this.node.width/2), - Config.screenH/2 + Config.groundH + this.node.height/2)
      let pos2 = pos1.add(pos3).divSelf(2)
      pos2.y = pos1.y + 10
      cc.tween(this.node)
        .then(cc.bezierTo(0.2, [pos1, pos2, pos3]))
        .to(.4, { position: cc.v2(dir * (Config.screenW/2 - this.node.width/2), Config.screenH/2 - 30) })
        .to(.2, { position: cc.v2(dir * (Config.screenW/2 - 200), Config.screenH/2 - 100 ) })
        .call(() => {
          Util.changeGroup(this.node, BALL_STATUS.UP)
          this.openPhy(cc.v2(0, 0))
          Game.mgr.checkCanShoot()
        })
        .start()
    }
}
