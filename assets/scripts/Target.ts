import { _decorator, Component, input, Input, Vec3, view } from 'cc';
const { ccclass } = _decorator;

@ccclass('Target')
export class Target extends Component {
    private isDragging: boolean = false;
    private offset: Vec3 = new Vec3();

    onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    onMouseDown(event: any) {
        this.isDragging = true;
        const canvasSize = view.getVisibleSize();
        const mouseX = event.getLocationX() - canvasSize.width / 2;
        const mouseY = event.getLocationY() - canvasSize.height / 2;
        
        const nodePos = this.node.getPosition();
        this.offset.set(nodePos.x - mouseX, nodePos.y - mouseY, 0);
    }

    onMouseMove(event: any) {
        if (!this.isDragging) return;
        
        const canvasSize = view.getVisibleSize();
        const mouseX = event.getLocationX() - canvasSize.width / 2;
        const mouseY = event.getLocationY() - canvasSize.height / 2;
        
        const newX = mouseX + this.offset.x;
        const newY = mouseY + this.offset.y;
        
        this.node.setPosition(newX, newY, 0);
    }

    onMouseUp(event: any) {
        this.isDragging = false;
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}