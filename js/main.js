import Player     from './player/index'
import Enemy      from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo   from './runtime/gameinfo'
import Music      from './runtime/music'
import DataBus    from './databus'

let ctx   = canvas.getContext('2d')
let databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    this.restart()
  }

  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg       = new BackGround(ctx)
    this.player   = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music    = new Music()

    // add by fjw in 18.1.9
    this.frame = 0 // 当前秒的帧数
    this.stopTime = 5 // 速度衰减为0的时间 默认5秒
    this.defaultSpeed = 300 // 前三秒从0-该速度
    this.addSpeed = 50 //每秒增加的速度
    

    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {

    if ( databus.frame % 30 === 0 ) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6) 
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this

    databus.bullets.forEach((bullet) => {
      for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
        let enemy = databus.enemys[i]

        if ( !enemy.isPlaying && enemy.isCollideWith(bullet) ) {
          enemy.playAnimation() // 敌人动画
          that.music.playExplosion() // 碰撞声音

          bullet.visible = false
          databus.score  += 1

          break
        }
      }
    })

    for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
      let enemy = databus.enemys[i]

      if ( this.player.isCollideWith(enemy) ) {
        databus.gameOver = true

        break
      }
    }
  }

  //游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
     e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (   x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY  )
      this.restart()
    }

    /**
     * canvas重绘函数
     * 每一帧重新绘制所有的需要展示的元素
     */
    render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    // databus.bullets 注释 by fjw
    //        .concat(databus.enemys)
    //        .forEach((item) => {
    //           item.drawToCanvas(ctx)
    //         })

    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if ( ani.isPlaying ) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)
  }

  /** 
   * 游戏逻辑更新主函数
   *@function enemyGenerate 生成敌人
   * 
   */
  update() {
    this.bg.update(databus.speed/100)

    // databus.bullets 注释 by fjw
    //        .concat(databus.enemys)
    //        .forEach((item) => {
    //           item.update()
    //         })

    // 注释 by fjw 
    //this.enemyGenerate()

    this.collisionDetection()
  }

  // 实现游戏帧循环
  loop() {
    // console.log(databus.speed);
    // ** add by fjw **

    // 按住飞机的时间
    if(this.player.touched){
      
      databus.touchTime++
      if(databus.touchTime % 60 == 0){

        if(databus.speed >= this.defaultSpeed){
          databus.speed += this.addSpeed
        }else{
          databus.speed += 100
        }
      }
    }else{
      if(databus.speed > 50){
        databus.touchTime++
        if(databus.touchTime % 60 == 0){
          databus.speed -= parseInt(databus.speed*0.2) // databus.subSpeed
        }
      }else{
        databus.speed = 0;
      }
    }


    // 飞出的米数
    if(this.frame >= 60){
      databus.score += databus.speed // 飞出的距离
      this.frame = 0
    }
    this.frame++
    // ** end add **


    databus.frame++ // 帧
    this.update()
    this.render()

    // 注释 by fjw 
    // if ( databus.frame % 20 === 0 ) {
      // this.player.shoot() // 发射子弹
      // this.music.playShoot() // 发射子弹的声音
    // }

    // 游戏结束停止帧循环
    if ( databus.gameOver ) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      this.touchHandler = this.touchEventHandler.bind(this)
      canvas.addEventListener('touchstart', this.touchHandler)

      return
    }

    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }
}
