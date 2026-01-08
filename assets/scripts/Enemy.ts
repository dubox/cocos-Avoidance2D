import { _decorator, Component, Node, PhysicsSystem2D, Vec2, Vec3, physics, ERaycast2DType, CircleCollider2D, BoxCollider2D, Collider2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {


    target: Node = null;
    minDistance: number = 40;
    speed: number = 50;
    moveDir: Vec2 = new Vec2();
    moveDirAngleOffset: number = 0;
    get finalMoveDir() {
        return this.moveDir.rotate(this.moveDirAngleOffset * Math.PI / 180).normalize();
    }
    colliderVolume: number = 0;//碰撞体积
    obstacleColliderVolume: number = 0;//障碍物碰撞体积

    start() {
        this.target = this.node.parent.getChildByName('target');
        this.colliderVolume = Enemy.calculateColliderVolume(this.getComponent(Collider2D));
    }

    lastStepTargetPos: Vec3 = null;//上一帧的目标位置
    targetPos: Vec3 = null;
    update(deltaTime: number) {
        const targetPos = this.targetPos = this.target.getPosition();
        const currPos = this.node.getPosition().clone();
        const distance = Vec2.distance(targetPos, currPos);
        if (distance < this.minDistance) {
            return;
        }
        this.avoidance(this.lastStepTargetPos ? this.lastStepTargetPos : currPos);
        Vec2.subtract(this.moveDir, targetPos.toVec2(), currPos.toVec2());
        this.moveDir.normalize();
        this.lastStepTargetPos = currPos.add(this.finalMoveDir.multiplyScalar(this.speed * deltaTime).toVec3());
        this.node.setPosition(this.lastStepTargetPos);

        // console.log(this.moveDirAngleOffset);
    }

    avoidance(stepTargetPos: Vec3) {
        const currPos = this.node.getPosition();

        if (Vec2.distance(currPos.toVec2(), stepTargetPos.toVec2()) > 0.1) {//遇到障碍

            // 执行射线检测来检测前方障碍物
            let endPos = this.node.worldPosition.clone().add(this.moveDir.multiplyScalar(100).toVec3());
            let result = PhysicsSystem2D.instance.raycast(this.node.worldPosition, endPos, ERaycast2DType.Closest);

            if (result.length > 0) {
                this.obstacleColliderVolume = Enemy.calculateColliderVolume(result[0].collider);
                let normal = result[0].normal;
                //计算moveDir和normal的角度偏移
                let dirOffset = this.moveDir.signAngle(normal) * 180 / Math.PI;

                if (dirOffset < 0) {
                    this.moveDirAngleOffset = dirOffset + 90;
                } else {
                    this.moveDirAngleOffset = dirOffset - 90;
                }

            } else console.log('未检测到障碍物');

            if (this.moveDirAngleOffset > 0) {
                this.moveDirAngleOffset += 30;
                if (this.moveDirAngleOffset > 180) {
                    this.moveDirAngleOffset = 180;
                }
            } else {
                this.moveDirAngleOffset -= 30;
                if (this.moveDirAngleOffset < -180) {
                    this.moveDirAngleOffset = -180;
                }
            }

        } else {
            // 如果没有障碍物或避障完成，逐渐恢复原始方向实现迂回
            this.detour();

        }
        // console.log(this.moveDirAngleOffset);

    }

    detour() {
        if (this.moveDirAngleOffset > 0.1) {
            this.moveDirAngleOffset -= Math.min(this.colliderVolume / this.obstacleColliderVolume * 30, 1.5);
            // this.moveDirAngleOffset -= 1;
            if (this.moveDirAngleOffset < 1) {
                this.moveDirAngleOffset = 0.1;
            }
        } else if (this.moveDirAngleOffset < -0.1) {
            this.moveDirAngleOffset += Math.min(this.colliderVolume / this.obstacleColliderVolume * 30, 1.5);
            // this.moveDirAngleOffset += 1;
            if (this.moveDirAngleOffset > -1) {
                this.moveDirAngleOffset = -0.1;
            }
        }
    }


    static calculateColliderVolume(collider: Collider2D): number {
        if (collider instanceof CircleCollider2D) {
            // 圆形碰撞体体积：π × 半径²
            const radius = collider.radius;
            return Math.PI * radius * radius;
        } else if (collider instanceof BoxCollider2D) {
            // 矩形碰撞体体积：宽度 × 高度
            const size = collider.size;
            return size.width * size.height;
        }
        return 0;
    }
}


