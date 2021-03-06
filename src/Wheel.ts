/*
 * 控制轴组件
 */

class Wheel extends egret.DisplayObjectContainer {
    // 仪表盘参数
    private panel: egret.Shape = new egret.Shape();
    private panelColor: number;
    private panelOpacity: number;
    private panelRadius: number;
    // 摇杆参数
    private rocker: egret.Shape = new egret.Shape();
    private rockerColor: number;
    private rockerOpacity: number;
    private rockerRadius: number;
    // 对全局stage进行侦听
    public stage: egret.Stage;
    // 广播摇杆事件
    private evt: egret.Event;

    public constructor(stage, panelRadius, rockerRadius, panelColor, panelOpacity, rockerColor, rockerOpacity) {
        super();

        this.panelColor = panelColor;
        this.panelOpacity = panelOpacity;
        this.panelRadius = panelRadius;

        this.rockerColor = rockerColor;
        this.rockerOpacity = rockerOpacity;
        this.rockerRadius = rockerRadius;

        this.rocker.x = this.rocker.y = this.panel.x = this.panel.y = 0;

        this.addChild(this.panel);
        this.addChild(this.rocker);

        this.draw();
        this.touchEnabled = true;

        this.stage = stage;

        this.evt = new egret.Event('wheel', true, true);
        this.evt.data = {};
        stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.initOriPoint, this);
        stage.addEventListener(egret.TouchEvent.TOUCH_END, this.stopMove, this);
        stage.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.stopMove, this);
    }
    

    private draw() {
        this.panel.graphics.beginFill(this.panelColor, this.panelOpacity)
        this.panel.graphics.drawCircle(0, 0, this.panelRadius);
        this.panel.graphics.endFill;
        this.rocker.graphics.beginFill(this.rockerColor, this.rockerOpacity);
        this.rocker.graphics.drawCircle(0, 0, this.rockerRadius);
        this.rocker.graphics.endFill;
    }

    private stopMove(e: egret.TouchEvent):void {
        this.rocker.x = this.rocker.y = 0;
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMove, this);
    }

    private offsetX: number;
    private offsetY: number;
    private initOriPoint(e: egret.TouchEvent):void {
        if(e.stageX < window.innerWidth / 2) {
            this.offsetX = e.stageX - this.rocker.x;
            this.offsetY = e.stageY - this.rocker.y;
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMove, this);
        }
    }

    private onMove(e: egret.TouchEvent):void {
        let moveX:number = e.stageX;
        let moveY:number = e.stageY;
        let distant:number = Math.sqrt(Math.pow(moveX - this.x, 2) + Math.pow(moveY - this.y, 2));
        let deg:number = Math.atan2(moveY - this.y, moveX - this.x);
        if(distant > this.panelRadius) {
            this.rocker.x = this.panelRadius * Math.cos(deg);
            this.rocker.y = this.panelRadius * Math.sin(deg);
        } else {
            this.rocker.x = moveX - this.offsetX;
            this.rocker.y = moveY - this.offsetY;
        }
        this.evt.data.deg = deg;
        this.dispatchEvent(this.evt);
    }
}