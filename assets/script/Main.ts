import Game from "./Common/Game";
import Config from "./Common/Config";
import Util from "./Common/Util";
import Ball from "./Mgr/Ball";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Label)
    scoreLabel: cc.Label = null

    ballArr: cc.Node[] = []
    barrierArr: cc.Node[] = []
    barrierPrefabArr: cc.Prefab[] = []
    ballPrefab: cc.Prefab = null

    isBouncing: boolean = false
    score: number = 0

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
      console.log(this.ballArr)
      this.ballArr.forEach((ball, i) => {
        this.scheduleOnce(() => {
          let start = ball.position
          let dir = pos.sub(start)
          let ts = ball.getComponent(Ball)
          ts.openPhy(dir.mul(4))
          ts.status = Config.ballStatus.BOUNCE
        }, i * 0.4)
      })
    }

    initBall() {
      let ball = cc.instantiate(this.ballPrefab)
      this.node.addChild(ball)
      ball.position = Config.originBallPos
      ball.getComponent(Ball).status = Config.ballStatus.UP
      this.ballArr.push(ball)
    }

    addBall(pos) {
      let ball = cc.instantiate(this.ballPrefab)
      let ts = ball.getComponent(Ball)
      this.node.addChild(ball)
      ball.position = pos
      this.ballArr.push(ball)
      ts.status = Config.ballStatus.BOUNCE
      ts.openPhy(cc.v2(0, 300))
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
        this.checkIsOver() ? this.replay() : this.isBouncing = false
      }
    }

    replay() {
      this.removeAllBarrier()
      this.removeAllBall()
      this.barrierArr = []
      this.ballArr = []
      this.addBarrier()
      this.initBall()
      this.isBouncing = false
      this.score = 0
      this.setScoreLabel()
    }

    removeAllBarrier() {
      this.barrierArr.forEach(b => b.destroy())
    }

    removeAllBall() {
      this.ballArr.forEach(b => b.destroy())
    }

    checkIsOver() {
      console.log('isOver', this.barrierArr.some(b => b.y > Config.originBallPos.y))
      return this.barrierArr.some(b => b.y > Config.originBallPos.y)
    }

    addBarrier() {
      let margin = 130
      let x = - Config.screenW / 2 + margin
      while(x < Config.screenW / 2 - margin) {
        let y = -Config.screenH / 2 + Config.barrierH + Util.random(-60, 60)
        let gap = Util.random(100, 300)
        let barrier = cc.instantiate(this.barrierPrefabArr[Util.random(0, this.barrierPrefabArr.length - 1)])
        this.node.addChild(barrier)
        barrier.x = x
        barrier.y = y
        this.barrierArr.push(barrier)
        x += gap
      }
    }

    setScoreLabel() {
      this.scoreLabel.string = String(this.score)
    }
    addScore() {
      this.score++
      this.setScoreLabel()
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
