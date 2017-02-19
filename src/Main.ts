
class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private world:Box2D.Dynamics.b2World;
    private debug:Box2D.Dynamics.b2DebugDraw;
    private p2m:number = 30;
    private createGameScene():void {
        this.stage.orientation = egret.OrientationMode.LANDSCAPE;
        this.detectOrientation();

        let bg: Bg = new Bg(this.stage);
        this.addChild(bg);

        var sWidth:number = this.stage.stageWidth;
        var sHeight:number = this.stage.stageHeight;

        this.createWorld();
        this.createDebug();
        let tankBd:Box2D.Dynamics.b2Body = this.createBox(Math.random() * 100 + 350,sHeight - 150);
        this.createGround(0,sHeight - 10,sWidth,100);

		egret.Ticker.getInstance().register(function (dt) {
			if (dt < 10) {
				return;
			}
			if (dt > 1000) {
				return;
			}
            tank.x = tankBd.GetPosition().x * this.p2m;
            tank.y = tankBd.GetPosition().y * this.p2m;
            tank.rotation = tankBd.GetAngle() * 180 / Math.PI;
            this.world.Step(dt / 1000, 10, 10);
            this.world.DrawDebugData();
		}, this);

		var self = this;
        var tank: Tank = new Tank();
        // tank.width = tankBd.get * factor;
        // tank.height = tankBd.height * factor;
        tank.x = tankBd.GetPosition().x * this.p2m;
        tank.y = tankBd.GetPosition().y * this.p2m;
        tank.rotation = tankBd.GetAngle() * 180 / Math.PI;
        this.addChild(tank);

        // 摇杆
        let wheel: Wheel = new Wheel(this.stage, 80, 40, 0x000000, 0.5, 0x999999, 0.5);
        wheel.x = 150;
        wheel.y = 500;
        this.addChild(wheel);
        this.addEventListener('wheel', function(e) {
            console.log(e);
        }, this);

        // 发射按钮
        let fireBtn: FireBtn = new FireBtn(80);
        fireBtn.x = 950;
        fireBtn.y = 500;
        this.addChild(fireBtn);

        function fire() :void {
            tank.fire();
        }
        fireBtn.addEventListener(egret.TouchEvent.TOUCH_END, fire, this);
    }
    
    private createGround(posX:number,posY:number,w:number,h:number,isStatic:boolean=false){
        var bodyDef:Box2D.Dynamics.b2BodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.position = new Box2D.Common.Math.b2Vec2(posX/this.p2m,posY/this.p2m);
        bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        var body:Box2D.Dynamics.b2Body = this.world.CreateBody(bodyDef);

        var vertices:Box2D.Common.Math.b2Vec2[] = [
            new Box2D.Common.Math.b2Vec2(0,0),
            new Box2D.Common.Math.b2Vec2(150/this.p2m,-10/this.p2m),
            new Box2D.Common.Math.b2Vec2(250/this.p2m,1/this.p2m),
            new Box2D.Common.Math.b2Vec2(350/this.p2m,-20/this.p2m),
            new Box2D.Common.Math.b2Vec2(450/this.p2m,-11/this.p2m),
            new Box2D.Common.Math.b2Vec2(650/this.p2m,0/this.p2m),
            new Box2D.Common.Math.b2Vec2(750/this.p2m,-11/this.p2m),
            new Box2D.Common.Math.b2Vec2(850/this.p2m,0/this.p2m),
            new Box2D.Common.Math.b2Vec2(950/this.p2m,-11/this.p2m),
            new Box2D.Common.Math.b2Vec2(1350/this.p2m,0/this.p2m),
        ];
        for (var i = 1; i<vertices.length; i++)
        {
            var v1:Box2D.Common.Math.b2Vec2 = vertices[i-1];
            var v2:Box2D.Common.Math.b2Vec2 = vertices[i];
            var edge:Box2D.Collision.Shapes.b2PolygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
            edge.SetAsEdge(v1,v2);
            var fixtureDef:Box2D.Dynamics.b2FixtureDef = new Box2D.Dynamics.b2FixtureDef();
            fixtureDef.shape = edge;
            body.CreateFixture(fixtureDef);
        }
    }
    private createBox(posX:number,posY:number): Box2D.Dynamics.b2Body{
        var bodyDef:Box2D.Dynamics.b2BodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.position = new Box2D.Common.Math.b2Vec2(posX/this.p2m,posY/this.p2m);
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        var body:Box2D.Dynamics.b2Body = this.world.CreateBody(bodyDef);

        var poly:Box2D.Collision.Shapes.b2PolygonShape;
        var vertices:Box2D.Common.Math.b2Vec2[] = [
            new Box2D.Common.Math.b2Vec2(0, -15/this.p2m),
            new Box2D.Common.Math.b2Vec2(50/this.p2m, 40/this.p2m),
            new Box2D.Common.Math.b2Vec2(-50/this.p2m, 40/this.p2m)
        ];
        poly = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, 3);
        var fixtureDef:Box2D.Dynamics.b2FixtureDef = new Box2D.Dynamics.b2FixtureDef();
        fixtureDef.density = 3;
        fixtureDef.restitution = 0.2;
        fixtureDef.shape = poly;

        body.CreateFixture(fixtureDef);
        return body;
    }
    private createWorld(){
        var gravity:Box2D.Common.Math.b2Vec2 = new Box2D.Common.Math.b2Vec2(0,10);
        this.world = new Box2D.Dynamics.b2World(gravity,true);
    }
    private createDebug(){
        var s:egret.Sprite = new egret.Sprite();
        this.addChild(s);

        this.debug = new Box2D.Dynamics.b2DebugDraw();
        this.debug.SetSprite(s);
        this.debug.SetDrawScale(this.p2m);
        this.debug.SetLineThickness(1);
        this.debug.SetAlpha(0.8);
        this.debug.SetFillAlpha(0.5);
        this.debug.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit);
        this.world.SetDebugDraw(this.debug);
    }

    // 判断是否是横屏
    private detectOrientation():void {
        if(window.orientation === 0) {
            console.log('show orientation tip');
        }
        this.stage.addEventListener(egret.StageOrientationEvent.ORIENTATION_CHANGE, function() {
            if(window.orientation !== 90) {
                console.log('show orientation tip');
            } else {
                console.log('hide orientation tip');
            }
        }, this);
    }
}


