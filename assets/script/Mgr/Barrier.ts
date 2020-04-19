import Game from "../Common/Game";
import Util from "../Common/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Barrier extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null

    num: number = 0

    onLoad () {
      this.initNum()
      this.initAngle()
    }

    initNum() {
      this.num = Util.random(50, 100)
      this.setNum(this.num)
    }

    initAngle() {
      this.node.angle = Util.random(0, 180)
      this.label.node.angle = -this.node.angle
    }

    setNum(num) {
      this.label.getComponent(cc.Label).string = String(num)
    }

    onBeginContact (contact, selfCollider, otherCollider) {
      this.num--
      if (this.num > 0) {
        this.setNum(this.num)
      } else {
        Game.mgr.removeBarrier(this.node)
      }
    }

    // update (dt) {}
}
