import Game from "./Common/Game";
import Config from "./Common/Config";
import Util from "./Common/Util";
import Ball from "./Mgr/Ball";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    ballArr: cc.Node[] = []
    barrierArr: cc.Node[] = []
    barrierPrefabArr: cc.Prefab[] = []
    ballPrefab: cc.Prefab = null

    isBouncing: boolean = false

    onLoad () {
      this.initGameData()
    }

    initGameData() {
      Game.curLevel = 1
      Game.mgr = this
      Config.screenW = cc.winSize.width
      Config.screenH = cc.winSize.height
      cc.loader.loadResDir('barrierPrefab', (err, assets) => {
        if (err) console.log(err)
        this.barrierPrefabArr = assets
        this.addBarrier()
        this.addTouchEvent()
      })
      cc.loader.loadRes('ball', (err, prefab) => {
        if (err) console.log(err)
        this.ballPrefab = prefab
        this.initBall()
      })
    }

    shoot(pos) {
      this.ballArr.forEach((ball, i) => {
        this.scheduleOnce(() => {
          let start = ball.position
          let dir = pos.sub(start)
          let ts = ball.getComponent(Ball)
          ts.openPhy(dir.mul(4))
          ts.status = Config.ballStatus.BOUNCE
        }, i * 0.3)
      })
    }

    initBall() {
      let ball = cc.instantiate(this.ballPrefab)
      this.node.addChild(ball)
      ball.position = Config.originBallPos
      ball.getComponent(Ball).status = Config.ballStatus.UP
      this.ballArr.push(ball)
    }

    addTouchEvent() {
      this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    }

    onTouchStart(e) {
      if (this.isBouncing) return
      this.isBouncing = true
      let pos = this.node.convertToNodeSpaceAR(e.getLocation())
      this.shoot(pos)
    }

    checkCanShoot() {
      let canShoot = this.ballArr.every(ball => ball.getComponent(Ball).status === Config.ballStatus.UP)
      if (canShoot) {
        this.barrierArr.forEach(b => {
          b.y += 150
        })
        this.addBarrier()
        this.isBouncing = false
      }
    }

    addBarrier() {
      let margin = 130
      let x = - Config.screenW / 2 + margin
      while(x < Config.screenW / 2 - margin) {
        let y = -Config.screenH / 2 + Config.barrierH + Util.random(-20, 20)
        let gap = Util.random(100, 200)
        let barrier = cc.instantiate(this.barrierPrefabArr[Util.random(0, this.barrierPrefabArr.length - 1)])
        this.node.addChild(barrier)
        barrier.x = x
        barrier.y = y
        this.barrierArr.push(barrier)
        x += gap
      }
    }

    removeBarrier(barrier: cc.Node) {
      let idx = this.barrierArr.indexOf(barrier)
      if (idx >= 0) {
        this.barrierArr.splice(idx, 1)
        barrier.removeFromParent(false)
      }
    }

    onDestroy() {
      this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    }
}
