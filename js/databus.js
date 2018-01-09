import Pool from './base/pool'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.pool = new Pool()

    this.reset()
  }

  reset() {
    this.frame      = 0
    this.score      = 0
    this.bullets    = []
    this.enemys     = []
    this.animations = []
    this.gameOver   = false

    // add by fjw 
    this.hole       = [] // 虫洞
    this.speed      = 0 // 飞机的速度
    this.touchTime  = 0 // 按住飞机的时间 默认 0 秒
    this.subSpeed   = 0
  }

  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   */
  removeEnemey(enemy) {
    let temp = this.enemys.shift()

    temp.visible = false

    this.pool.recover('enemy', enemy)
  }

  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   */
  removeBullets(bullet) {
    let temp = this.bullets.shift()

    temp.visible = false

    this.pool.recover('bullet', bullet)
  }

  /**
   * 回收虫洞
   * 此后不进入帧循环
   */
  removeHole(hole) {
    let temp = this.hole.shift()

    temp.visible = false

    this.pool.recover('hole', hole)
  }

}
