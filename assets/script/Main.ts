import Game from "./Common/Game";
import Config from "./Common/Config";
import { BALL_STATUS } from "./Common/Enum";
import Util from "./Common/Util";
import Ball from "./Mgr/Ball";
import Barrier from "./Mgr/Barrier";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Label)
    scoreLabel: cc.Label = null

    ballArr: Ball[] = []
    barrierArr: Barrier[] = []
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
      this.ballArr.forEach((ball, i) => {
        ball.closePhy()
        this.scheduleOnce(() => {
          cc.tween(ball.node)
          .to(0.1, { position: Config.originBallPos })
          .call(() => {
              let start = ball.node.position
              let dir = pos.sub(start)
              ball.openPhy(dir.mul(4))
              Util.changeGroup(ball.node, BALL_STATUS.BOUNCE)
          })
          .start()
        }, i * 0.4)
      })
    }

    initBall() {
      let ball = cc.instantiate(this.ballPrefab).getComponent(Ball)
      this.node.addChild(ball.node)
      ball.node.position = Config.originBallPos
      Util.changeGroup(ball.node, BALL_STATUS.UP)
      ball.closePhy()
      this.ballArr.push(ball)
    }

    addBall(pos) {
      let ball = cc.instantiate(this.ballPrefab).getComponent(Ball)
      this.node.addChild(ball.node)
      ball.node.position = pos
      this.ballArr.push(ball)
      Util.changeGroup(ball.node, BALL_STATUS.BOUNCE)
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
      // 也可以声明一个变量，采用计数法比较
      let canShoot = this.ballArr.every(ball => ball.node.group === BALL_STATUS.UP)
      if (canShoot) {
        this.barrierArr.forEach(b => {
          b.node.y += 150
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
      this.barrierArr.forEach(b => b.node.destroy())
    }

    removeAllBall() {
      this.ballArr.forEach(b => b.node.destroy())
    }

    checkIsOver() {
      return this.barrierArr.some(b => b.node.y > Config.originBallPos.y)
    }

    addBarrier() {
      let margin = 130
      let x = - Config.screenW / 2 + margin
      while(x < Config.screenW / 2 - margin) {
        let y = -Config.screenH / 2 + Config.barrierH + Util.random(-60, 60)
        let gap = Util.random(100, 300)
        let barrier = cc.instantiate(this.barrierPrefabArr[Util.random(0, this.barrierPrefabArr.length - 1)]).getComponent(Barrier)
        this.node.addChild(barrier.node)
        barrier.node.x = x
        barrier.node.y = y
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

    removeBarrier(barrier: Barrier) {
      let idx = this.barrierArr.indexOf(barrier)
      if (idx >= 0) {
        this.barrierArr.splice(idx, 1)
        barrier.node.removeFromParent(false)
      }
    }

    onDestroy() {
      this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    }
}
