/*
 * 子弹类
*/

class Bullet extends egret.Shape {

    public constructor() {
        super();
        // this.addChild(this.createBody());
    }

    private createBody(): egret.Shape {
        let body: egret.Shape = new egret.Shape();
        body.graphics.beginFill(0xffffff);
        body.graphics.drawRect(18, -4, 50, 8);
        body.graphics.drawRect(70, -6, 6, 12);
        body.graphics.endFill();

        return body;
    }

    public fire(): void {
        
    }
}