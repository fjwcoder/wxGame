import Animation from '../base/animation'
import DataBus   from '../databus'

const ENEMY_IMG_SRC = 'images/bullet.png'
const ENEMY_WIDTH   = 60
const ENEMY_HEIGHT  = 60

const __ = {
    speed: symbol('speed')
}

let databus = new DataBus()





export default class Hole extends Animation {
    constructor() {
        super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT)

        this.initExplosionAnimation()
    }

    init(speed){ // 虫洞运行速度
        this.x = rnd(0, window.innerWidth - ENEMY_WIDTH)
        this.y = -this.height

        this[__.speed] = speed

        this.visible = true
    }

    /**
     * 每一帧更新子弹位置
     */
    update(){
        this.y += this[__.speed]

        // 对象回收
        if( this.y > window.innerHeight + this.height)
            databus.removeHole(this)
    }

}