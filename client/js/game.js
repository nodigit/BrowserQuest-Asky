define(['infomanager', 'bubble', 'renderer', 'map', 'sprite', 'animation',
        'tile', 'warrior', 'archer', 'gameclient', 'audio', 'updater',
        'transition', 'pathfinder', 'item', 'mob', 'npc', 'player', 'character',
        'chest', 'mobs', 'chathandler', 'menu', 'boardhandler',
        'kkhandler', 'questhandler', 'statehandler', 'partyhandler', 'items',
        'rankinghandler', 'shophandler', 'inventoryhandler',
        'playerpopupmenu', 'storedialog', '../../shared/js/gametypes'],
function(InfoManager, BubbleManager, Renderer, Map, Sprite, Animation,
         AnimatedTile, Warrior, Archer, GameClient, AudioManager, Updater,
         Transition, Pathfinder, Item, Mob, Npc, Player, Character, Chest, Mobs,
         ChatHandler, Menu, BoardHandler, KkHandler, QuestHandler,
         StateHandler, PartyHandler, Items, RankingHandler,
         ShopHandler, InventoryHandler, PlayerPopupMenu, StoreDialog){
  var Game = Class.extend({
    init: function(app) {
      this.app = app;
      this.ready = false;
      this.started = false;
      this.hasNeverStarted = true;

      this.host = 'burgerburger.kr';
//      this.host = '192.168.0.5';
      this.port = 8001;

      this.renderer = null;
      this.updater = null;
      this.pathfinder = null;
      this.chatinput = null;
      this.bubbleManager = null;
      this.audioManager = null;

      // FPS
      this.lastFPSTime = new Date().getTime();
      this.FPSCount = 0;
        
      // Player
      this.player = null;
    
      // Game state
      this.entities = {};
      this.deathpositions = {};
      this.entityGrid = null;
      this.pathingGrid = null;
      this.renderingGrid = null;
      this.itemGrid = null;
      this.currentCursor = null;
      this.mouse = { x: 0, y: 0 };
      this.zoningQueue = [];
      this.previousClickPosition = {};
    
      this.selectedX = 0;
      this.selectedY = 0;
      this.selectedCellVisible = false;
      this.targetColor = "rgba(255, 255, 255, 0.5)";
      this.targetCellVisible = true;
      this.hoveringTarget = false;
      this.hoveringPlayer = false;
      this.hoveringMob = false;
      this.hoveringItem = false;
      this.hoveringCollidingTile = false;

      // Global chats
      this.chats = 0;
      this.maxChats = 3;
      this.globalChatColor = '#A6FFF9';
        
      // combat
      this.infoManager = new InfoManager(this);

      this.kkhandler = new KkHandler();
      this.chathandler = new ChatHandler(this, this.kkhandler);
      this.boardhandler = new BoardHandler(this);
      this.questhandler = new QuestHandler(this);
      this.statehandler = new StateHandler(this);
      this.partyhandler = new PartyHandler(this);
      this.rankingHandler = new RankingHandler(this);
      this.shopHandler = new ShopHandler(this);
      this.inventoryHandler = new InventoryHandler(this);
      this.playerPopupMenu = new PlayerPopupMenu(this);

      this.dialogs = new Array();

      this.characterDialog = new CharacterDialog(this);
      this.dialogs.push(this.characterDialog);

      this.itemInfoDialog = new ItemInfoDialog(this);
      this.dialogs.push(this.itemInfoDialog);

      this.storeDialog = new StoreDialog(this);
      this.dialogs.push(this.storeDialog);
      // Menu
      this.menu = new Menu();

      // Item Info
      this.itemInfoOn = false;
        
      // zoning
      this.currentZoning = null;
        
      this.cursors = {};

      this.sprites = {};
        
      // tile animation
      this.animatedTiles = null;
        
      // debug
      this.debugPathing = false;
            
      // pvp
      this.pvpFlag = false;

      // Shortcut Healing
      this.healShortCut = -1;
      this.hpGuide = 0;
      this.autoEattingHandler = null;

      // Current cursor
      this.namedEntity = null;

      this.attackerKind = 0;

      // sprites
      this.spriteNames = [
  "item-frankensteinarmor", "ancientmanumentnpc", "provocationeffect",
  "bearseonbiarmor", "item-bearseonbiarmor", "frankensteinarmor",
  "item-gayarcherarmor", "redsicklebow", "item-redsicklebow", "jirisanmoonbear",
  "halloweenjkarmor", "item-halloweenjkarmor", "mojojojonpc", "gayarcherarmor",
  "combatuniform", "item-combatuniform", "bloodbow", "item-bloodbow",
  "item-paewoldo", "cursedhahoemask", "secondsonangelnpc", "item-essentialrage",
  "sicklebow", "item-sicklebow", "radisharmor", "item-radisharmor", "paewoldo",
  "firstsonangelnpc", "archerschooluniform", "item-archerschooluniform",
  "item-forestbow", "adhererarcherarmor", "item-adhererarcherarmor",
  "supercateffect", "burgerarmor", "item-burgerarmor", "item-marblependant",
  "friedpotatoarmor", "item-friedpotatoarmor", "superiorangelnpc", "forestbow",
  "frogarmor", "legolasarmor", "item-legolasarmor", "gaybow", "item-gaybow",
  "crystalbow", "item-crystalbow", "momangelnpc", "frog", "item-frogarmor",
  "crystalarcherarmor", "item-crystalarcherarmor", "item-cokearmor",
  "item-blackspiderarmor", "item-rainbowapro", "item-spiritring", "cokearmor",
  "fallenarcherarmor", "hellspider", "blackspiderarmor", "rainbowapro",
  "item-rosebow", "item-pearlpendant", "angelnpc", "item-fallenarcherarmor",
  "bluewingarcherarmor", "item-bamboospear", "item-bluewingarcherarmor",
  "item-justicebow", "snowshepherdboy", "suicideghost", "bamboospear",
  "item-pearlring", "wolfarcherarmor", "item-wolfarcherarmor", "justicebow",
  "item-snowfoxarcherarmor", "marinebow", "item-marinebow", "cursedjangseung",
  "redwingarcherarmor", "bridalmask", "item-bridalmask", "snowfoxarcherarmor",
  "item-redmetalbow", "item-devilkazyasword", "item-redwingarcherarmor",
  "item-gbwingarcherarmor", "item-captainbow", "redmetalbow", "devilkazyasword",
  "devilkazyaarmor", "item-devilkazyaarmor", "gbwingarcherarmor", "captainbow",
  "dovakinarcherarmor", "item-dovakinarcherarmor", "devilkazya", "elfnpc",
  "skylightbow", "item-greenpendant", "redlightbow", "item-redlightbow",
  "cheoliarcherarmor", "item-cheoliarcherarmor", "item-skylightbow", "rosebow",
  "item-piratearcherarmor", "item-greenlightbow", "item-cactusaxe",
  "item-hunterbow", "item-sproutring", "piratearcherarmor", "greenlightbow",
  "bluestoremannpc", "ratarcherarmor", "item-ratarcherarmor", "hunterbow",
  "seahorsebow", "item-seahorsebow", "iceelfnpc", "redstoremannpc",
  "item-conferencecall", "whitearcherarmor", "item-whitearcherarmor", "cactus",
  "item-redguardarcherarmor", "skydinosaur", "conferencecall", "cactusaxe",
  "item-reddamboarmor", "mermaidbow", "item-mermaidbow", "redguardarcherarmor",
  "iamverycoldnpc", "item-blackpotion", "queenspider", "reddamboarmor",
  "bluebikinigirlnpc", "babyspider", "redenelbow", "item-redenelbow",
  "item-guardarcherarmor", "item-greenbow", "pirategirlnpc", "redbikinigirlnpc",
  "greendamboarmor", "item-greendamboarmor", "guardarcherarmor", "greenbow",
  "mantis", "item-pinksword", "item-greenwingarcherarmor", "poisonspider",
  "watermelonbow", "item-watermelonbow", "pinksword", "greenwingarcherarmor",
  "shepherdboy", "zombiegf", "greenarcherarmor", "item-greenarcherarmor",
  "item-ironknightarmor", "goldenbow", "item-goldenbow", "item-evilarmor",
  "weastaff", "item-weastaff", "smalldevil", "ironknightarmor", "fairynpc",
  "item-goldenarcherarmor", "blackwizard", "wizardrobe", "item-wizardrobe",
  "whitetiger", "tigerarmor", "item-tigerarmor", "goldenarcherarmor", "pierrot",
  "deathbow", "item-deathbow", "fireplay", "item-fireplay", "blazespider",
  "squeakyhammer", "item-squeakyhammer", "violetbow", "item-violetbow",
  "item-redbow", "hongcheol", "hongcheolarmor", "item-hongcheolarmor",
  "item-platearcherarmor", "item-beetlearmor", "item-redarcherarmor", "redbow",
  "mailarcherarmor", "item-mailarcherarmor", "queenant", "platearcherarmor",
  "snowmanarmor", "item-snowmanarmor", "plasticbow", "item-plasticbow", "comb",
  "goldmedal", "silvermedal", "bronzemedal", "sponge", "snowman", "item-comb",
  "item-archerarmor", "firespider", "fireshot", "item-fireshot", "item-ironbow",
  "item-catarmor", "leatherarcherarmor", "item-leatherarcherarmor", "ironbow",
  "item-dinosaurarmor", "mermaidnpc", "healeffect", "cat", "catarmor", "beetle",
  "soldier", "fisherman", "octopus", "earthworm", "dinosaurarmor", "evilarmor",
  "item-butcherknife", "shieldbenef", "bucklerbenef", "criticaleffect",
  "cockroachsuit", "item-cockroachsuit", "soybeanbug", "butcherknife",
  "item-pinkcockroacharmor", "vendingmachine", "bluecockroach", "beetlearmor",
  "item-robocoparmor", "redcockroach", "pinkcockroacharmor", "oddeyecat",
  "candybar", "item-candybar", "vampire", "christmasarmor", "santa",
  "item-christmasarmor", "doctor", "soldierant", "robocoparmor", "stuneffect",
  "rudolf", "rudolfarmor", "item-rudolfarmor", "boxingman", "santaelf",
  "ant", "bluedamboarmor", "item-bluedamboarmor", "archerarmor", "woodenbow",
  "rhaphidophoridae", "memme", "item-memme", "bee", "beearmor", "item-beearmor",
  "typhoon", "item-typhoon", "windguardian", "squid", "squidarmor",
  "kaonashi", "damboarmor", "item-damboarmor", "item-royalazalea",
  "rainbowsword", "item-rainbowsword", "item-sword1", "item-squidarmor",
  "miniemperor", "huniarmor", "item-huniarmor", "slime", "item-woodenbow",
  "miniseadragon", "miniseadragonarmor", "item-miniseadragonarmor",
  "eneltrident", "item-eneltrident", "item-snowpotion", "minidragon",
  "magicspear", "item-magicspear", "enelarmor", "item-enelarmor",
  "lightningguardian", "breaker", "item-breaker", "enel", "flaredanceeffect",
  "shadowregion", "shadowregionarmor", "item-shadowregionarmor",
  "seadragon", "seadragonarmor", "item-seadragonarmor", "searage",
  "item-searage", "purplecloudkallege", "item-purplecloudkallege",
  "snowlady", "daywalker", "item-daywalker", "pirateking", "item-pirateking",
  "hermitcrab", "zombie", "piratecaptain", "ironogre", "ogrelord", "adherer",
  "icegolem", "flaredeathknight", "redsickle", "item-redsickle",
  "regionhenchman", "plunger", "item-plunger", "purplepreta", "sickle",
  "item-sickle", "icevulture", "portalarmor", "item-portalarmor",
  "item-adminarmor", "adminarmor", "pain", "rabbitarmor", "item-rabbitarmor",
  "crystalscolpion", "eliminator", "firebenef", "taekwondo", "item-taekwondo",
  "darkogre", "item-book", "item-cd", "frostqueen", "snowrabbit", "snowwolf",
  "iceknight", "miniiceknight", "snowelf", "whitebear", "cobra", "goldgolem",
  "darkregion", "darkregionillusion", "nightmareregion", "justicehammer",
  "item-justicehammer", "firesword", "item-firesword", "whip", "item-whip",
  "forestguardiansword", "item-forestguardiansword", "gayarmor",
  "item-gayarmor", "schooluniform", "item-schooluniform", "beautifullife",
  "item-beautifullife", "regionarmor", "item-regionarmor", "ghostrider",
  "item-ghostrider", "desertscolpion", "darkscolpion", "vulture",
  "forestdragon", "bluewingarmor", "item-bluewingarmor", "thiefarmor",
  "item-thiefarmor", "ninjaarmor", "item-ninjaarmor", "dragonarmor",
  "item-dragonarmor", "fallenarmor", "item-fallenarmor", "paladinarmor",
  "item-paladinarmor", "crystalarmor", "item-crystalarmor", "adhererrobe",
  "item-adhererrobe", "frostarmor", "item-frostarmor", "redmetalsword",
  "item-redmetalsword", "bastardsword", "item-bastardsword", "halberd",
  "item-halberd", "rose", "item-rose", "icerose", "item-icerose", "hand",
  "sword", "loot", "target", "talk", "sparks", "shadow16", "rat", "skeleton",
  "skeleton2", "spectre", "skeletonking", "deathknight", "ogre", "crab",
  "snake", "eye", "bat", "goblin", "wizard", "guard", "king", "villagegirl",
  "villager", "coder", "agent", "rick", "scientist", "nyan", "priest", 
  "sorcerer", "octocat", "beachnpc", "forestnpc", "desertnpc", "lavanpc",
  "clotharmor", "item-clotharmor", "leatherarmor", "mailarmor", "platearmor",
  "redarmor", "goldenarmor", "firefox", "death", "sword1", "axe", "chest",
  "sword2", "redsword", "bluesword", "goldensword", "item-sword2", "item-axe",
  "item-redsword", "item-bluesword", "item-goldensword", "item-leatherarmor",
  "item-mailarmor", "item-platearmor", "item-redarmor", "item-goldenarmor",
  "item-flask", "item-cake", "item-burger", "morningstar", "item-morningstar",
  "item-firepotion", "orc", "oldogre", "golem", "mimic", "hobgoblin",
  "greenarmor", "greenwingarmor", "item-greenarmor", "item-greenwingarmor",
  "redmouse", "redguard", "scimitar", "item-scimitar", "redguardarmor",
  "item-redguardarmor", "whitearmor", "item-whitearmor", "infectedguard",
  "livingarmor", "mermaid", "trident", "item-trident", "ratarmor",
  "item-ratarmor", "yellowfish", "greenfish", "redfish", "clam", "preta",
  "pirateskeleton", "bluescimitar", "item-bluescimitar", "bluepiratearmor",
  "item-bluepiratearmor", "penguin", "moleking", "cheoliarmor",
  "item-cheoliarmor", "hammer", "item-hammer", "darkskeleton", "redarcherarmor",
  "greenpirateskeleton", "blackpirateskeleton", "redpirateskeleton",
  "yellowpreta", "bluepreta", "miniknight", "wolf", "dovakinarmor",
  "item-dovakinarmor", "gbwingarmor", "item-gbwingarmor", "redwingarmor",
  "item-redwingarmor", "snowfoxarmor", "item-snowfoxarmor", "wolfarmor",
  "item-wolfarmor", "pinkelf", "greenlightsaber", "item-greenlightsaber",
  "skyelf", "skylightsaber", "item-skylightsaber", "redelf", "redlightsaber",
  "item-redlightsaber", "item-sidesword", "sidesword", "yellowmouse",
  "whitemouse", "brownmouse", "spear", "item-spear", "guardarmor",
  "item-guardarmor",
  "item-pendant1", "item-ring1"];
    },
    setup: function($bubbleContainer, canvas, background, foreground, input) {
      this.setBubbleManager(new BubbleManager($bubbleContainer));
      this.setRenderer(new Renderer(this, canvas, background, foreground));
      this.setChatInput(input);
    },
    setRenderer: function(renderer) {
      this.renderer = renderer;
    },
    setUpdater: function(updater) {
      this.updater = updater;
    },
    setPathfinder: function(pathfinder) {
      this.pathfinder = pathfinder;
    },
    setChatInput: function(element) {
      this.chatinput = element;
    },
    setBubbleManager: function(bubbleManager) {
      this.bubbleManager = bubbleManager;
    },
    loadMap: function() {
      var self = this;
    
      this.map = new Map(!this.renderer.upscaledRendering, this);
    
      this.map.ready(function() {
        log.info("Map loaded.");
        var tilesetIndex = self.renderer.upscaledRendering ? 0 : self.renderer.scale - 1;
        self.renderer.setTileset(self.map.tilesets[tilesetIndex]);
      });
    },
    initPlayer: function() {
      this.app.initHealthBar();
      this.app.initManaBar();
      this.app.initTargetHud();
      this.app.initExpBar();
      this.player.setSprite(this.sprites[this.player.getSpriteName()]);
      this.player.idle();
        
      log.debug("Finished initPlayer");
    },
    initShadows: function() {
      this.shadows = {};
      this.shadows["small"] = this.sprites["shadow16"];
    },
    initCursors: function() {
      this.cursors["hand"] = this.sprites["hand"];
      this.cursors["sword"] = this.sprites["sword"];
      this.cursors["loot"] = this.sprites["loot"];
      this.cursors["target"] = this.sprites["target"];
      this.cursors["arrow"] = this.sprites["arrow"];
      this.cursors["talk"] = this.sprites["talk"];
    },
    initAnimations: function() {
      this.targetAnimation = new Animation("idle_down", 4, 0, 16, 16);
      this.targetAnimation.setSpeed(50);
        
      this.sparksAnimation = new Animation("idle_down", 6, 0, 16, 16);
      this.sparksAnimation.setSpeed(120);

      this.benefAnimation = new Animation("idle_down", 8, 0, 48, 48);
      this.benefAnimation.setSpeed(120);

      this.benef10Animation = new Animation("idle_down", 10, 0, 32, 32);
      this.benef10Animation.setSpeed(80);

      this.benef4Animation = new Animation("idle_down", 4, 0, 48, 48);
      this.benef4Animation.setSpeed(80);
    },
    initHurtSprites: function() {
      var self = this;
        
      Types.forEachArmorKind(function(kind, kindName) {
        self.sprites[kindName].createHurtSprite();
      });
    },
    initSilhouettes: function() {
      var self = this;

      Types.forEachMobOrNpcKind(function(kind, kindName) {
        self.sprites[kindName].createSilhouette();
      });
      self.sprites["chest"].createSilhouette();
      self.sprites["item-cake"].createSilhouette();
    },
    loadSprite: function(name) {
      if(this.renderer.upscaledRendering) {
        this.spritesets[0][name] = new Sprite(name, 1);
      } else {
        this.spritesets[1][name] = new Sprite(name, 2);
      }
    },
    setSpriteScale: function(scale) {
      var self = this;
            
      if(this.renderer.upscaledRendering) {
        this.sprites = this.spritesets[0];
      } else {
        this.sprites = this.spritesets[scale - 1];
                
        _.each(this.entities, function(entity) {
          entity.sprite = null;
          entity.setSprite(self.sprites[entity.getSpriteName()]);
        });
        this.initHurtSprites();
        this.initShadows();
        this.initCursors();
      }
    },
    loadSprites: function() {
      log.info("Loading sprites...");
      this.spritesets = [];
      this.spritesets[0] = {};
      this.spritesets[1] = {};
      _.map(this.spriteNames, this.loadSprite, this);
    },
    spritesLoaded: function() {
      if(_.any(this.sprites, function(sprite) { return !sprite.isLoaded; })) {
        return false;
      }
      return true;
    },
    setCursor: function(name, orientation) {
      if(name in this.cursors) {
        this.currentCursor = this.cursors[name];
        this.currentCursorOrientation = orientation;
      } else {
        log.error("Unknown cursor name :"+name);
      }
    },
    updateCursorLogic: function() {
      if(this.hoveringCollidingTile && this.started) {
        this.targetColor = "rgba(255, 50, 50, 0.5)";
      } else {
        this.targetColor = "rgba(255, 255, 255, 0.5)";
      }
            
      if(this.hoveringPlayer && this.started) {
        if(this.pvpFlag || (this.namedEntity && this.namedEntity instanceof Player && this.namedEntity.isWanted)){
          this.setCursor("sword");
        } else{
          this.setCursor("hand");
        }
        this.hoveringTarget = false;
        this.hoveringMob = false;
        this.targetCellVisible = false;
      } else if(this.hoveringMob && this.started) {
        this.setCursor("sword");
        this.hoveringTarget = false;
        this.hoveringPlayer = false;
        this.targetCellVisible = false;
      } else if(this.hoveringNpc && this.started) {
        this.setCursor("talk");
        this.hoveringTarget = false;
        this.targetCellVisible = false;
      } else if((this.hoveringItem || this.hoveringChest) && this.started) {
        this.setCursor("loot");
        this.hoveringTarget = false;
        this.targetCellVisible = true;
      } else {
        this.setCursor("hand");
        this.hoveringTarget = false;
        this.hoveringPlayer = false;
        this.targetCellVisible = true;
      }
    },
    focusPlayer: function() {
      this.renderer.camera.lookAt(this.player);
    },
    addEntity: function(entity) {
      var self = this;
            
      if(this.entities[entity.id] === undefined) {
        this.entities[entity.id] = entity;
        this.registerEntityPosition(entity);
                
        if(!(entity instanceof Item && entity.wasDropped)
        && !(this.renderer.mobile || this.renderer.tablet)) {
          entity.fadeIn(this.currentTime);
        }
                
        if(this.renderer.mobile || this.renderer.tablet) {
          entity.onDirty(function(e) {
            if(self.camera.isVisible(e)) {
              e.dirtyRect = self.renderer.getEntityBoundingRect(e);
              self.checkOtherDirtyRects(e.dirtyRect, e, e.gridX, e.gridY);
            }
          });
        }
      } else {
        log.error("This entity already exists : " + entity.id + " ("+entity.kind+")");
      }
    },
    removeEntity: function(entity) {
      if(entity.id in this.entities) {
        this.unregisterEntityPosition(entity);
        delete this.entities[entity.id];
      } else {
        log.error("Cannot remove entity. Unknown ID : " + entity.id);
      }
    },
    addItem: function(item, x, y) {
      item.setSprite(this.sprites[item.getSpriteName()]);
      item.setGridPosition(x, y);
      item.setAnimation("idle", 150);
      this.addEntity(item);

      this.createBubble(item.id, item.getInfoMsg(this.language));
      this.assignBubbleTo(item);
    },
    removeItem: function(item) {
      if(item) {
        this.removeFromItemGrid(item, item.gridX, item.gridY);
        this.removeFromRenderingGrid(item, item.gridX, item.gridY);
        delete this.entities[item.id];
      } else {
        log.error("Cannot remove item. Unknown ID : " + item.id);
      }
    },
    initPathingGrid: function() {
      this.pathingGrid = [];
      for(var i=0; i < this.map.height; i += 1) {
        this.pathingGrid[i] = [];
        for(var j=0; j < this.map.width; j += 1) {
          this.pathingGrid[i][j] = this.map.grid[i][j];
        }
      }
      log.info("Initialized the pathing grid with static colliding cells.");
    },
    initEntityGrid: function() {
      this.entityGrid = [];
      for(var i=0; i < this.map.height; i += 1) {
        this.entityGrid[i] = [];
        for(var j=0; j < this.map.width; j += 1) {
          this.entityGrid[i][j] = {};
        }
      }
      log.info("Initialized the entity grid.");
    },
    initRenderingGrid: function() {
      this.renderingGrid = [];
      for(var i=0; i < this.map.height; i += 1) {
        this.renderingGrid[i] = [];
        for(var j=0; j < this.map.width; j += 1) {
          this.renderingGrid[i][j] = {};
        }
      }
      log.info("Initialized the rendering grid.");
    },
    initItemGrid: function() {
      this.itemGrid = [];
      for(var i=0; i < this.map.height; i += 1) {
        this.itemGrid[i] = [];
        for(var j=0; j < this.map.width; j += 1) {
          this.itemGrid[i][j] = {};
        }
      }
      log.info("Initialized the item grid.");
    },
    initAnimatedTiles: function() {
      var self = this,
          m = this.map;

      this.animatedTiles = [];
      this.forEachVisibleTile(function (id, index) {
        if(m.isAnimatedTile(id)) {
          var tile = new AnimatedTile(id, m.getTileAnimationLength(id), m.getTileAnimationDelay(id), index),
              pos = self.map.tileIndexToGridPosition(tile.index);
                    
          tile.x = pos.x;
          tile.y = pos.y;
          self.animatedTiles.push(tile);
        }
      }, 1);
    },
    addToRenderingGrid: function(entity, x, y) {
      if(!this.map.isOutOfBounds(x, y)) {
        this.renderingGrid[y][x][entity.id] = entity;
      }
    },
    removeFromRenderingGrid: function(entity, x, y) {
      if(entity && this.renderingGrid[y][x] && entity.id in this.renderingGrid[y][x]) {
        delete this.renderingGrid[y][x][entity.id];
      }
    },
    removeFromEntityGrid: function(entity, x, y) {
      if(this.entityGrid[y][x][entity.id]) {
        delete this.entityGrid[y][x][entity.id];
      }
    },
    removeFromItemGrid: function(item, x, y) {
      if(item && this.itemGrid[y][x][item.id]) {
        delete this.itemGrid[y][x][item.id];
      }
    },
    removeFromPathingGrid: function(x, y) {
      this.pathingGrid[y][x] = 0;
    },
    /**
     * Registers the entity at two adjacent positions on the grid at the same time.
     * This situation is temporary and should only occur when the entity is moving.
     * This is useful for the hit testing algorithm used when hovering entities with the mouse cursor.
     *
     * @param {Entity} entity The moving entity
     */
    registerEntityDualPosition: function(entity) {
      if(entity) {
        this.entityGrid[entity.gridY][entity.gridX][entity.id] = entity;
        this.addToRenderingGrid(entity, entity.gridX, entity.gridY);
            
        if(entity.nextGridX >= 0 && entity.nextGridY >= 0) {
          this.entityGrid[entity.nextGridY][entity.nextGridX][entity.id] = entity;
          if(!(entity instanceof Player)) {
            this.pathingGrid[entity.nextGridY][entity.nextGridX] = 1;
          }
        }
      }
    },
    /**
     * Clears the position(s) of this entity in the entity grid.
     *
     * @param {Entity} entity The moving entity
     */
    unregisterEntityPosition: function(entity) {
      if(entity) {
        if(entity instanceof Item){
          this.removeFromItemGrid(entity, entity.gridX, entity.gridY);
        } else{
          this.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
        }
        this.removeFromPathingGrid(entity.gridX, entity.gridY);
        this.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
            
        if(entity.nextGridX >= 0 && entity.nextGridY >= 0) {
          this.removeFromEntityGrid(entity, entity.nextGridX, entity.nextGridY);
          this.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
        }
      }
    },
    registerEntityPosition: function(entity) {
      var x = entity.gridX,
          y = entity.gridY;
        
      if(entity && x && y) {
        if(entity instanceof Character || entity instanceof Chest) {
          this.entityGrid[y][x][entity.id] = entity;
          if(!(entity instanceof Player)) {
            this.pathingGrid[y][x] = 1;
          }
        }
        if(entity instanceof Item) {
          this.itemGrid[y][x][entity.id] = entity;
        }
            
        this.addToRenderingGrid(entity, x, y);
      }
    },
    setServerOptions: function(username, userpw, email, isJoin, language) {
      this.username = username;
      this.userpw = userpw;
      this.email = email;
      this.isJoin = isJoin;
      this.language = language;
    },
    loadAudio: function() {
      this.audioManager = new AudioManager(this);
    },
    initMusicAreas: function() {
      var self = this;
      _.each(this.map.musicAreas, function(area) {
        self.audioManager.addArea(area.x, area.y, area.w, area.h, area.id);
      });
    },
    run: function() {
      var self = this;
        
      this.loadSprites();
      this.setUpdater(new Updater(this));
      this.camera = this.renderer.camera;
        
      this.setSpriteScale(this.renderer.scale);
        
      var wait = setInterval(function() {
        if(self.map.isLoaded && self.spritesLoaded()) {
          log.debug('All sprites loaded.');
                            
          self.loadAudio();
                    
          self.initMusicAreas();
          self.initCursors();
          self.initAnimations();
          self.initShadows();
          self.initHurtSprites();
                
          if(!self.renderer.mobile
          && !self.renderer.tablet 
          && self.renderer.upscaledRendering) {
            self.initSilhouettes();
          }
            
          self.initEntityGrid();
          self.initItemGrid();
          self.initPathingGrid();
          self.initRenderingGrid();
                
          self.setPathfinder(new Pathfinder(self.map.width, self.map.height));
            
          self.setCursor("hand");
                    
          self.connect();
          self.ready = true;
                
          clearInterval(wait);
        }
      }, 100);
    },
    tick: function() {
      this.currentTime = new Date().getTime();

      if(this.started) {
        this.updateCursorLogic();
        this.updater.update();
        this.renderer.renderFrame();

        this.FPSCount++;
        if(this.currentTime - this.lastFPSTime > 1000){
          $('#fps').html("FPS: " + this.FPSCount);
          this.lastFPSTime = this.currentTime;
          this.FPSCount = 0;
        }
      }

      if(!this.isStopped) {
        requestAnimFrame(this.tick.bind(this));
      }
    },
    // Line
        start: function() {
            this.tick();
            this.hasNeverStarted = false;
            log.info("Game loop started.");
        },

        stop: function() {
            log.info("Game stopped.");
            this.isStopped = true;
        },
    
        entityIdExists: function(id) {
            return id in this.entities;
        },

        getEntityById: function(id) {
            if(id in this.entities) {
                return this.entities[id];
            }
            else {
                log.error("Unknown entity id : " + id, true);
            }
        },
        getEntityByKind: function(kind){
          for(id in this.entities){
            var entity = this.entities[id];
            if(entity.kind === kind){
              return entity;
            }
          }
          return null;
        },

        connect: function() {
            var self = this,
                connecting = false; // always in dispatcher mode in the build version
    
            this.client = new GameClient(this.host, this.port, this);
            this.boardhandler.setClient(this.client);
            this.client.wrongpw_callback = function(){
                self.showNotification(Types.Language.Translate.WRONG_PASSWORD[self.language]);
            };
            this.client.ban_callback = function(){
                self.showNotification(Types.Language.Translate.YOU_BANNED[self.language]);
            };
            this.client.alreadyExist_callback = function(){
                self.showNotification(Types.Language.Translate.ALREADY_EXIST_ID[self.language]);
            };
            
            if(!connecting) {
                this.client.connect(false); // always use the dispatcher in production
            }
            
            this.client.onDispatched(function(host, port) {
                log.debug("Dispatched to game server "+host+ ":"+port);
                
                self.client.host = host;
                self.client.port = port;
                self.client.connect(); // connect to actual game server
            });
            
            this.client.onConnected(function() {
                log.info("Starting client/server handshake");
                
                self.started = true;
            
                self.client.sendHello(self.username, self.userpw, self.email, self.isJoin ? 1 : 0, self.language);
            });
        
            this.client.onEntityList(function(list) {
                var entityIds = _.pluck(self.entities, 'id'),
                    knownIds = _.intersection(entityIds, list),
                    newIds = _.difference(list, knownIds);
            
                self.obsoleteEntities = _.reject(self.entities, function(entity) {
                    return _.include(knownIds, entity.id) || entity.id === self.player.id;
                });
            
                // Destroy entities outside of the player's zone group
                self.removeObsoleteEntities();
                
                // Ask the server for spawn information about unknown entities
                if(_.size(newIds) > 0) {
                    self.client.sendWho(newIds);
                }
            });
        
            this.client.onWelcome(function(id, name, x, y, hp, mana,
                                           armor, weapon, avatar, weaponAvatar,
                                           experience, admin, rank,
                                           inventory, inventoryNumber,
                                           questFound, questProgress,
                                           maxInventoryNumber, kind, inventorySkillKind, inventorySkillLevel) {
                log.info("Received player ID from server : "+ id);
                if(kind === Types.Entities.ARCHER){
                  self.player = new Archer(id, name, self);
                } else{
                  self.player = new Warrior(id, name, self);
                }
                self.player.id = id;
                self.playerId = id;
                // Always accept name received from the server which will
                // sanitize and shorten names exceeding the allowed length.
                self.player.name = name;
                self.player.admin = admin;
                self.player.rank = rank;
                self.player.setGridPosition(x, y);
                self.player.setMaxHitPoints(hp);
                self.player.setMaxMana(mana);
                self.player.setArmorName(armor);
                self.player.setSpriteName(avatar);
                self.player.setWeaponName(weaponAvatar ? weaponAvatar : weapon);
                self.inventoryHandler.initInventory(maxInventoryNumber, inventory, inventoryNumber, inventorySkillKind, inventorySkillLevel);
                self.shopHandler.setMaxInventoryNumber(maxInventoryNumber);
                self.initPlayer();
                self.questhandler.initQuest(questFound, questProgress);

                self.player.experience = experience;
                self.player.level = Types.getLevel(experience);
            
                self.updateBars();
                self.updateExpBar();
                self.resetCamera();
                self.updatePlateauMode();
                self.audioManager.updateMusic();
            
                self.addEntity(self.player);
                self.player.dirtyRect = self.renderer.getEntityBoundingRect(self.player);

                $('#loadingscreen').css('display', 'none');
                $('#gamescreen').css('display', 'block');
                self.showNotification(Types.Language.Translate.CONNECTED1[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED2[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED3[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED4[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED5[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED6[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED7[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED8[self.language]);
                self.showNotification(Types.Language.Translate.CONNECTED9[self.language]);
                self.chathandler.show();
        
                self.player.onStartPathing(function(path) {
                    var i = path.length - 1,
                        x =  path[i][0],
                        y =  path[i][1];
                
                    if(self.player.isMovingToLoot()) {
                        self.player.isLootMoving = false;
                    }
                    else if(!self.player.isAttacking()) {
                        self.client.sendMove(x, y);
                    }
                
                    // Target cursor position
                    self.selectedX = x;
                    self.selectedY = y;
                    self.selectedCellVisible = true;

                    if(self.renderer.mobile || self.renderer.tablet) {
        	            self.drawTarget = true;
        	            self.clearTarget = true;
        	            self.renderer.targetRect = self.renderer.getTargetBoundingRect();
        	            self.checkOtherDirtyRects(self.renderer.targetRect, null, self.selectedX, self.selectedY);
        	        }
                });
                
                self.player.onCheckAggro(function() {
                    self.forEachMob(function(mob) {
                        if(mob.isAggressive && !mob.isAttacking() && self.player.isNear(mob, mob.aggroRange)) {
                            self.player.aggro(mob);
                        }
                    });
                });
            
                self.player.onAggro(function(mob) {
                    if(!mob.isWaitingToAttack(self.player) && !self.player.isAttackedBy(mob)) {
                        self.player.log_info("Aggroed by " + mob.id + " at ("+self.player.gridX+", "+self.player.gridY+")");
                        self.client.sendAggro(mob);
                        mob.waitToAttack(self.player);
                    }
                });

                self.player.onBeforeStep(function() {
                    var blockingEntity = self.getEntityAt(self.player.nextGridX, self.player.nextGridY);
                    if(blockingEntity && blockingEntity.id !== self.playerId) {
                        log.debug("Blocked by " + blockingEntity.id);
                    }
                    self.unregisterEntityPosition(self.player);
                });
            
                self.player.onStep(function() {
                    if(self.player.hasNextStep()) {
                        self.registerEntityDualPosition(self.player);
                    }
                
                    if(self.isZoningTile(self.player.gridX, self.player.gridY)) {
                        self.enqueueZoningFrom(self.player.gridX, self.player.gridY);
                    }
                
                    self.player.forEachAttacker(function(attacker) {
                        if(attacker.isAdjacent(attacker.target)) {
                            attacker.lookAtTarget();
                        } else {
//                            attacker.follow(self.player);
                        }
                    });
                
                    self.updatePlayerCheckpoint();
                
                    if(!self.player.isDead) {
                        self.audioManager.updateMusic();
                    }
                });
            
                self.player.onStopPathing(function(x, y) {
                    if(self.player.hasTarget()) {
                        self.player.lookAtTarget();
                    }
                
                    self.selectedCellVisible = false;
                
                    if(self.isItemAt(x, y)) {
                        var item = self.getItemAt(x, y);
                    
                        try {
                            self.client.sendLoot(item);
                        } catch(e) {
                            throw e;
                        }
                    }
                
                    if(!self.player.hasTarget() && self.map.isDoor(x, y)) {
                        var dest = self.map.getDoorDestination(x, y);

                        if(dest.level > self.player.level){
                            self.showNotification("" + dest.level + "레벨 이상만 들어가실 수 있습니다.");
                            self.unregisterEntityPosition(self.player);
                            self.registerEntityPosition(self.player);
                            return;
                        }
                        if(dest.admin === 1 && !self.player.admin){
                            self.unregisterEntityPosition(self.player);
                            self.registerEntityPosition(self.player);
                            return;
                        }
                    
                        self.player.setGridPosition(dest.x, dest.y);
                        self.player.nextGridX = dest.x;
                        self.player.nextGridY = dest.y;
                        self.player.turnTo(dest.orientation);
                        self.client.sendTeleport(dest.x, dest.y);
                        
                        if(self.renderer.mobile && dest.cameraX && dest.cameraY) {
                            self.camera.setGridPosition(dest.cameraX, dest.cameraY);
                            self.resetZone();
                        } else {
                            if(dest.portal) {
                                self.assignBubbleTo(self.player);
                            } else {
                                self.camera.focusEntity(self.player);
                                self.resetZone();
                            }
                        }
                        
                        self.player.forEachAttacker(function(attacker) {
                            attacker.disengage();
                            attacker.idle();
                        });
                    
                        self.updatePlateauMode();
                        
                        if(self.renderer.mobile || self.renderer.tablet){ 
                            // When rendering with dirty rects, clear the whole screen when entering a door.
                            self.renderer.clearScreen(self.renderer.context);
                        }
                        
                        if(dest.portal) {
                            self.audioManager.playSound("teleport");
                        }
                        
                        if(!self.player.isDead) {
                            self.audioManager.updateMusic();
                        }
                    }
                
                    if(self.player.target instanceof Npc) {
                        self.makeNpcTalk(self.player.target);
                    } else if(self.player.target instanceof Chest) {
                        self.client.sendOpen(self.player.target);
                        self.audioManager.playSound("chest");
                    }
                    
                    self.player.forEachAttacker(function(attacker) {
                        if(!attacker.isAdjacentNonDiagonal(self.player) && attacker instanceof Mob) {
                            attacker.follow(self.player);
                        }
                    });
                
                    self.unregisterEntityPosition(self.player);
                    self.registerEntityPosition(self.player);
                });
            
                self.player.onRequestPath(function(x, y) {
                    var ignored = [self.player]; // Always ignore self
                
                    if(self.player.hasTarget()) {
                        ignored.push(self.player.target);
                    }
                    return self.findPath(self.player, x, y, ignored);
                });
            
                self.player.onDeath(function() {
                    log.info(self.playerId + " is dead");
                
                    self.player.skillHandler.clear();
                    self.player.stopBlinking();
                    self.player.setSprite(self.sprites["death"]);
                    self.player.animate("death", 120, 1, function() {
                        log.info(self.playerId + " was removed");
                    
                        self.removeEntity(self.player);
                        self.removeFromRenderingGrid(self.player, self.player.gridX, self.player.gridY);
                    
                        self.player = null;
                        self.client.disable();
                    });
                
                    self.player.forEachAttacker(function(attacker) {
                        attacker.disengage();
                        attacker.idle();
                    });
                
                    self.audioManager.fadeOutCurrentMusic();
                    $('#revive').css('display', 'block');
                    self.audioManager.playSound("death");
                });
            
                self.player.onHasMoved(function(player) {
                    self.assignBubbleTo(player);
                });
                self.client.onPVPChange(function(pvpFlag){
                    self.player.flagPVP(pvpFlag);
                    if(pvpFlag){
                        self.showNotification("PK 허용 지역에 들어오셨습니다.");
                    } else{
                        self.showNotification("PK 금지 지역에 들어오셨습니다.");
                    }
                });
                self.player.onArmorLoot(function(armorName){
                  self.player.switchArmor(armorName, self.sprites[armorName]);
                });
                
                self.client.onSpawnItem(function(item, x, y) {
                    log.info("Spawned " + Types.getKindAsString(item.kind) + " (" + item.id + ") at "+x+", "+y);
                    self.addItem(item, x, y);
                });
            
                self.client.onSpawnChest(function(chest, x, y) {
                    log.info("Spawned chest (" + chest.id + ") at "+x+", "+y);
                    chest.setSprite(self.sprites[chest.getSpriteName()]);
                    chest.setGridPosition(x, y);
                    chest.setAnimation("idle_down", 150);
                    self.addEntity(chest, x, y);
                
                    chest.onOpen(function() {
                        chest.stopBlinking();
                        chest.setSprite(self.sprites["death"]);
                        chest.setAnimation("death", 120, 1, function() {
                            log.info(chest.id + " was removed");
                            self.removeEntity(chest);
                            self.removeFromRenderingGrid(chest, chest.gridX, chest.gridY);
                            self.previousClickPosition = {};
                        });
                    });
                });
            
                self.client.onSpawnCharacter(function(entity, x, y, orientation, targetId) {
                    if(!self.entityIdExists(entity.id)) {
                        try {
                            if(entity.id !== self.playerId) {
                                entity.setSprite(self.sprites[entity.getSpriteName()]);
                                entity.setGridPosition(x, y);
                                entity.setOrientation(orientation);
                                entity.idle();

                                self.addEntity(entity);
                        
                                log.debug("Spawned " + Types.getKindAsString(entity.kind) + " (" + entity.id + ") at "+entity.gridX+", "+entity.gridY);
                        
                                if(entity instanceof Character) {
                                    entity.onBeforeStep(function() {
                                        self.unregisterEntityPosition(entity);
                                    });

                                    entity.onStep(function() {
                                        if(!entity.isDying) {
                                            self.registerEntityDualPosition(entity);

                                            entity.forEachAttacker(function(attacker) {
                                                if(attacker.isAdjacent(attacker.target)) {
                                                    attacker.lookAtTarget();
                                                } else {
                                                    attacker.follow(entity);
                                                }
                                            });
                                        }
                                    });

                                    entity.onStopPathing(function(x, y) {
                                        if(!entity.isDying) {
                                            if(entity.hasTarget() && entity.isAdjacent(entity.target)) {
                                                entity.lookAtTarget();
                                            }
                                
                                            if(entity instanceof Player) {
                                                var gridX = entity.destination.gridX,
                                                    gridY = entity.destination.gridY;

/*                                                if(self.map.isDoor(gridX, gridY)) {
                                                    var dest = self.map.getDoorDestination(gridX, gridY);
                                                    entity.setGridPosition(dest.x, dest.y);
                                                } */
                                            }
                                        
                                            entity.forEachAttacker(function(attacker) {
                                                if(!attacker.isAdjacentNonDiagonal(entity) && attacker.id !== self.playerId) {
                                                    attacker.follow(entity);
                                                }
                                            });
                                
                                            self.unregisterEntityPosition(entity);
                                            self.registerEntityPosition(entity);
                                        }
                                    });

                                    entity.onRequestPath(function(x, y) {
                                        var ignored = [entity], // Always ignore self
                                            ignoreTarget = function(target) {
                                                ignored.push(target);

                                                // also ignore other attackers of the target entity
                                                target.forEachAttacker(function(attacker) {
                                                    ignored.push(attacker);
                                                });
                                            };
                                        
                                        if(entity.hasTarget()) {
                                            ignoreTarget(entity.target);
                                        } else if(entity.previousTarget) {
                                            // If repositioning before attacking again, ignore previous target
                                            // See: tryMovingToADifferentTile()
                                            ignoreTarget(entity.previousTarget);
                                        }
                                        
                                        return self.findPath(entity, x, y, ignored);
                                    });

                                    entity.onDeath(function() {
                                        log.info(entity.id + " is dead");
                                
                                        if(entity instanceof Mob) {
                                            // Keep track of where mobs die in order to spawn their dropped items
                                            // at the right position later.
                                            self.deathpositions[entity.id] = {x: entity.gridX, y: entity.gridY};
                                        }

                                        entity.isDying = true;
                                        entity.setSprite(self.sprites[entity instanceof Mobs.Rat ? "rat" : "death"]);
                                        entity.animate("death", 120, 1, function() {
                                            log.info(entity.id + " was removed");

                                            self.removeEntity(entity);
                                            self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
                                        });

                                        entity.forEachAttacker(function(attacker) {
                                            attacker.disengage();
                                        });
                                        
                                        if(self.player.target && self.player.target.id === entity.id) {
                                            self.player.disengage();
                                        }
                                    
                                        // Upon death, this entity is removed from both grids, allowing the player
                                        // to click very fast in order to loot the dropped item and not be blocked.
                                        // The entity is completely removed only after the death animation has ended.
                                        self.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
                                        self.removeFromPathingGrid(entity.gridX, entity.gridY);
                                    
                                        if(self.camera.isVisible(entity)) {
                                            self.audioManager.playSound("kill"+Math.floor(Math.random()*2+1));
                                        }
                                    
                                        self.updateCursor();
                                    });

                                    entity.onHasMoved(function(entity) {
                                        self.assignBubbleTo(entity); // Make chat bubbles follow moving entities
                                    });

                                    if(entity instanceof Mob) {
                                        if(targetId) {
                                            var player = self.getEntityById(targetId);
                                            if(player) {
                                                self.createAttackLink(entity, player);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        catch(e) {
                            log.error(e);
                        }
                    } else {
                        log.debug("Character "+entity.id+" already exists. Don't respawn.");
                    }
                });

                self.client.onDespawnEntity(function(entityId) {
                    var entity = self.getEntityById(entityId);
            
                    if(entity) {
                        log.info("Despawning " + Types.getKindAsString(entity.kind) + " (" + entity.id+ ")");
                        
                        if(entity.gridX === self.previousClickPosition.x
                        && entity.gridY === self.previousClickPosition.y) {
                            self.previousClickPosition = {};
                        }
                        
                        if(entity instanceof Item) {
                            self.removeItem(entity);
                        } else if(entity instanceof Character) {
                            entity.forEachAttacker(function(attacker) {
                                if(attacker.canReachTarget()) {
                                    attacker.hit();
                    	        }
                            });
                            entity.die();
                        } else if(entity instanceof Chest) {
                            entity.open();
                        }
                        
                        entity.clean();
                    }
                });
            
                self.client.onItemBlink(function(id) {
                    var item = self.getEntityById(id);

                    if(item) {
                        item.blink(150);
                    }
                });

                self.client.onEntityMove(function(id, x, y) {
                    var entity = null;

                    if(id !== self.playerId) {
                        entity = self.getEntityById(id);
                
                        if(entity) {
                            entity.disengage();
                            entity.idle();
                            self.makeCharacterGoTo(entity, x, y);
                        }
                    }
                });
            
                self.client.onEntityDestroy(function(id) {
                    var entity = self.getEntityById(id);
                    if(entity) {
                        if(entity instanceof Item) {
                            self.removeItem(entity);
                        } else {
                            self.removeEntity(entity);
                        }
                        log.debug("Entity was destroyed: "+entity.id);
                    }
                });
            
                self.client.onPlayerMoveToItem(function(playerId, itemId) {
                    var player, item;

                    if(playerId !== self.playerId) {
                        player = self.getEntityById(playerId);
                        item = self.getEntityById(itemId);
                
                        if(player && item) {
                            self.makeCharacterGoTo(player, item.gridX, item.gridY);
                        }
                    }
                });
            
                self.client.onEntityAttack(function(attackerId, targetId) {
                    var attacker = self.getEntityById(attackerId),
                        target = self.getEntityById(targetId);
                
                    if(attacker && target && attacker.id !== self.playerId) {
                        log.debug(attacker.id + " attacks " + target.id);
                        
                        if(attacker && target instanceof Player && target.id !== self.playerId && target.target && target.target.id === attacker.id && attacker.getDistanceToEntity(target) < 3) {
                            setTimeout(function() {
                                self.createAttackLink(attacker, target);
                            }, 200); // delay to prevent other players attacking mobs from ending up on the same tile as they walk towards each other.
                        } else {
                            self.createAttackLink(attacker, target);
                        }
                    }
                });
            
                self.client.onPlayerDamageMob(function(mobId, points, healthPoints, maxHp) {
                    var mob = self.getEntityById(mobId);
                    if(mob && points) {
                        self.infoManager.addDamageInfo(points, mob.x, mob.y - 15, "inflicted");
                    }
                    if(self.player.isTargetById(mobId)){
                        self.updateTarget(mobId, points, healthPoints, maxHp);
                    }
                });
            
                self.client.onPlayerKillMob(function(level, exp) {
                    self.player.level = level;
                    self.player.experience += exp;
                    self.updateExpBar();
                    
                    self.infoManager.addDamageInfo("+"+exp+" exp", self.player.x, self.player.y - 15, "exp", 3000);

                    var expInThisLevel = self.player.experience - Types.expForLevel[self.player.level-1];
                    var expForLevelUp = Types.expForLevel[self.player.level] - Types.expForLevel[self.player.level-1];
                });
            
                self.client.onPlayerChangeHealth(function(points, attackerKind, isRegen) {
                    var player = self.player,
                        diff,
                        isHurt;
                
                    if(player && !player.isDead && !player.invincible) {
                        isHurt = points <= player.hitPoints;
                        diff = points - player.hitPoints;
                        player.hitPoints = points;

                        if(player.hitPoints <= 0) {
                            player.die();
                        }
                        if(isHurt) {
                            self.attackerKind = parseInt(attackerKind);

                            player.hurt();
                            self.infoManager.addDamageInfo(diff, player.x, player.y - 15, "received");
                            self.audioManager.playSound("hurt");
                            if(self.playerhurt_callback) {
                                self.playerhurt_callback();
                            }
                        } else if(!isRegen){
                            self.infoManager.addDamageInfo("+"+diff, player.x, player.y - 15, "healed");
                        }
                        self.updateBars();
                    }
                });
            
                self.client.onPlayerChangeMaxHitPoints(function(hp, mana) {
                    self.player.maxHitPoints = hp;
                    self.player.hitPoints = hp;
                    self.player.mana = mana;
                    self.player.maxMana = mana;
                    self.updateBars();
                });
            
                self.client.onPlayerEquipItem(function(playerId, itemKind) {
                    var player = self.getEntityById(playerId),
                        itemName = Types.getKindAsString(itemKind);
                
                    if(player) {
                        if(Types.isArmor(itemKind) || Types.isArcherArmor(itemKind)) {
                            player.switchArmor(itemName, self.sprites[itemName]);
                            if(self.player.id === player.id){
                              self.showNotification('' + (Types.getArmorRank(itemKind)+1) + "레벨 갑옷 착용");
                              self.audioManager.playSound("loot");
                            }
                        } else if(Types.isWeapon(itemKind) || Types.isArcherWeapon(itemKind)) {
                            player.setWeaponName(itemName);
                            if(self.player.id === player.id){
                              self.showNotification('' + (Types.getWeaponRank(itemKind)+1) + "레벨 무기 착용");
                              self.audioManager.playSound("loot");
                            }
                        } else if(Types.isPendant(itemKind)) {
                          if(self.player.id === player.id) {
                            self.showNotification("" + (Types.getPendantRank(itemKind) + 1) + "레벨 펜던트 착용");
                            self.audioManager.playSound("loot");
                          }
                        } else if(Types.isRing(itemKind)) {
                          if(self.player.id === player.id) {
                            self.showNotification("" + (Types.getRingRank(itemKind) + 1) + "레벨 반지 착용");
                            self.audioManager.playSound("loot");
                          }
                        } else if(Types.isBenef(itemKind)){
                            player.setBenef(itemKind);
                            if(self.player.id === player.id){
                              self.audioManager.playSound("firefox");
                            }
                        }
                    }
                });
            
                self.client.onPlayerTeleport(function(id, x, y) {
                    var entity = null,
                        currentOrientation;

                    if(id !== self.playerId) {
                        entity = self.getEntityById(id);
                
                        if(entity) {
                            currentOrientation = entity.orientation;
                       
                            self.makeCharacterTeleportTo(entity, x, y);
                            entity.setOrientation(currentOrientation);
                        
                            entity.forEachAttacker(function(attacker) {
                                attacker.disengage();
                                attacker.idle();
                                attacker.stop();
                            });
                            self.removeEntity(entity);
                        }
                    }
                });
            
                self.client.onDropItem(function(item, mobId) {
                    var pos = self.getDeadMobPosition(mobId);
                
                    if(pos) {
                        self.addItem(item, pos.x, pos.y);
                        self.updateCursor();
                    } else{
                      var entity = self.getEntityById(mobId);
                      if(entity){
                        self.addItem(item, entity.gridX, entity.gridY);
                        self.updateCursor();
                      }
                    }
                });
            
                self.client.onChatMessage(function(entityId, message) {
                    if(!self.chathandler.processReceiveMessage(entityId, message)){
                        var entity = self.getEntityById(entityId);
                        self.createBubble(entityId, message);
                        self.assignBubbleTo(entity);
                        self.chathandler.addNormalChat(entity.name, message);
                    }
                    self.audioManager.playSound("chat");
                });
            
                self.client.onPopulationChange(function(worldPlayers, totalPlayers) {
                    if(self.nbplayers_callback) {
                        self.nbplayers_callback(worldPlayers, totalPlayers);
                    }
                });
                
                self.client.onDisconnected(function(message) {
                  if(self.player) {
                    self.player.die();
                  }
                  for(var index = 0; index < self.dialogs.length; index++) {
                    self.dialogs[index].hide();
                  }
                  $('#revive').css('display', 'none');
                  $('#disconnect').css('display', 'block');
                });
                self.client.onInventory(function(inventoryNumber, itemKind, itemNumber, itemSkillKind, itemSkillLevel){
                  self.shopHandler.initSellInventory();
                  if(itemKind){
                    self.inventoryHandler.setInventory(itemKind, inventoryNumber, itemNumber, itemSkillKind, itemSkillLevel);
                  } else if(itemKind === null){
                    self.inventoryHandler.makeEmptyInventory(inventoryNumber);
                  }
                });

                self.client.onQuest(function(data){
                  self.questhandler.handleQuest(data);
                });
                self.client.onTalkToNPC(function(npcKind, isCompleted){
                  var npc = self.getEntityByKind(npcKind);
                  var msg = npc.talk(self.language, isCompleted);
                  if(msg) {
                    self.createBubble(npc.id, msg);
                    self.assignBubbleTo(npc);
                    self.audioManager.playSound("npc");
                  } else {
                    self.destroyBubble(npc.id);
                    self.audioManager.playSound("npc-end");
                  }
                });
                self.client.onBoard(function(data){
                  self.boardhandler.handleBoard(data, self.player.level);
                });
                self.client.onNotify(function(msg){
                    self.showNotification(msg);
                });
                self.client.onKung(function(msg){
                    self.kkhandler.add(msg, self.player);
                });
            
                self.client.onWanted(function (id, isWanted) {
                    var player = self.getEntityById(id);
                    if(player && (player instanceof Player)) {
                        player.isWanted = isWanted;
                    }
                });
                self.client.onLevelUp(function (id, level) {
                    var player = self.getEntityById(id);
                    if(player && (player instanceof Player)) {
                        if(player != self.player) {
                            player.level = level;
                        }
                        self.infoManager.addDamageInfo("Level Up", player.x, player.y - 15, "levelup", 3000);
                    }
                });
                self.client.onParty(function (members) {
                  self.partyhandler.setMembers(members);
                });
                self.client.onState(function (message) {
                  self.statehandler.handleState(message);
                });
                self.client.onRanking(function(message){
                  self.rankingHandler.handleRanking(message);
                });
                self.client.onShop(function(message){
                  self.shopHandler.handleShop(message);
                });
                self.client.onLog(function(message){
                  var i=0;
                  for(i=0; i<message.length; i++){
                    var time = parseInt(message[i].slice(0, 13));
                    var log = message[i].slice(15);
                    self.showNotification((new Date(time)).toString() + ": " + log);
                  }
                });
                self.client.onSkill(function(message){
                  var msgType = message[0];
                  var id = message[1];
                  var skillLevel = message[2];
                  var entity = self.getEntityById(id);
                  if(entity){
                    if(msgType === "critical"){
                      entity.isCritical = true;
                    } else if(msgType === "heal"){
                      entity.isHeal = true;
                    } else if(msgType === "flareDance"){
                      entity.isFlareDance = true;
                    } else if(msgType === "flareDanceOff"){
                      entity.isFlareDance = false;
                    } else if(msgType === "stun"){
                      entity.stun(skillLevel);
                    } else if(msgType === "superCat"){
                      entity.isSuperCat = true;
                      if(skillLevel === 1){
                        entity.moveSpeed -= 30;
                      } else if(skillLevel === 2){
                        entity.moveSpeed -= 40;
                      }
                    } else if(msgType === "superCatOff"){
                      entity.isSuperCat = false;
                      entity.moveSpeed = 120;
                    } else if(msgType === "provocation"){
                      entity.provocation(skillLevel);
                    }
                  }
                });
                self.client.onCharacterInfo(function(datas) {
                  self.characterDialog.show(datas, self.language);
                });
                self.client.onCharacterByIp(function(datas) {
                  var i=0;
                  for(i=0; i<datas.length/2; i++){
                    self.showNotification("" + datas[i] + " " + (new Date(parseInt(datas[i+datas.length/2]))).toString());
                  }
                });
                self.client.onStoreOpen(function(datas) {
                  self.storeDialog.show(datas);
                });
                self.client.onSkillInstall(function(datas) {
                  self.player.skillHandler.install(datas[0], datas[1]);
                });
                self.client.onMana(function(mana, maxMana) {
                  self.player.mana = mana;
                  self.player.maxMana = maxMana;
                  self.updateBars();
                });
            
                if(self.hasNeverStarted) {
                    self.start();
                }
            });
        },

        /**
         * Links two entities in an attacker<-->target relationship.
         * This is just a utility method to wrap a set of instructions.
         *
         * @param {Entity} attacker The attacker entity
         * @param {Entity} target The target entity
         */
        createAttackLink: function(attacker, target) {
            if(attacker.hasTarget()) {
                attacker.removeTarget();
            }
            attacker.engage(target);
            
            if(attacker.id !== this.playerId) {
                target.addAttacker(attacker);
            }
        },

        /**
         * Converts the current mouse position on the screen to world grid coordinates.
         * @returns {Object} An object containing x and y properties.
         */
        getMouseGridPosition: function() {
            var mx = this.mouse.x,
                my = this.mouse.y,
                c = this.renderer.camera,
                s = this.renderer.scale,
                ts = this.renderer.tilesize,
                offsetX = mx % (ts * s),
                offsetY = my % (ts * s),
                x = ((mx - offsetX) / (ts * s)) + c.gridX,
                y = ((my - offsetY) / (ts * s)) + c.gridY;
        
                return { x: x, y: y };
        },
    
        /**
         * Moves a character to a given location on the world grid.
         *
         * @param {Number} x The x coordinate of the target location.
         * @param {Number} y The y coordinate of the target location.
         */
        makeCharacterGoTo: function(character, x, y) {
            if(!this.map.isOutOfBounds(x, y)) {
                character.go(x, y);
            }
        },
    
        /**
         *
         */
        makeCharacterTeleportTo: function(character, x, y) {
            if(!this.map.isOutOfBounds(x, y)) {
                this.unregisterEntityPosition(character);

                character.setGridPosition(x, y);
                
                this.registerEntityPosition(character);
                this.assignBubbleTo(character);
            } else {
                log.debug("Teleport out of bounds: "+x+", "+y);
            }
        },

        /**
         * Moves the current player to a given target location.
         * @see makeCharacterGoTo
         */
        makePlayerGoTo: function(x, y) {
            this.makeCharacterGoTo(this.player, x, y);
        },
    
        /**
         * Moves the current player towards a specific item.
         * @see makeCharacterGoTo
         */
        makePlayerGoToItem: function(item) {
            if(item) {
                this.player.isLootMoving = true;
                this.makePlayerGoTo(item.gridX, item.gridY);
                this.client.sendLootMove(item, item.gridX, item.gridY);
            }
        },
    
        /**
         *
         */
        makePlayerTalkTo: function(npc) {
            if(npc) {
                this.player.setTarget(npc);
                this.player.follow(npc);
            }
        },
    
        makePlayerOpenChest: function(chest) {
            if(chest) {
                this.player.setTarget(chest);
                this.player.follow(chest);
            }
        },
    
        /**
         * 
         */
        makePlayerAttack: function(mob) {
            this.createAttackLink(this.player, mob);
            this.client.sendAttack(mob);
        },
    
        /**
         *
         */
        makeNpcTalk: function(npc) {
            var msg;
        
            if(npc) {
              if(npc.kind === Types.Entities.VENDINGMACHINE){
                this.shopHandler.show();
              } else if(npc.kind === Types.Entities.REDSTOREMANNPC ||
                        npc.kind === Types.Entities.BLUESTOREMANNPC){
                this.storeDialog.show();
              } else{
                msg = this.questhandler.talkToNPC(npc);
                this.previousClickPosition = {};
                if(msg) {
                  this.createBubble(npc.id, msg);
                  this.assignBubbleTo(npc);
                  this.audioManager.playSound("npc");
                } else {
                  this.destroyBubble(npc.id);
                  this.audioManager.playSound("npc-end");
                }
              }
            }
        },

        /**
         * Loops through all the entities currently present in the game.
         * @param {Function} callback The function to call back (must accept one entity argument).
         */
        forEachEntity: function(callback) {
            _.each(this.entities, function(entity) {
                callback(entity);
            });
        },
    
        /**
         * Same as forEachEntity but only for instances of the Mob subclass.
         * @see forEachEntity
         */
        forEachMob: function(callback) {
            _.each(this.entities, function(entity) {
                if(entity instanceof Mob) {
                    callback(entity);
                }
            });
        },
    
        /**
         * Loops through all entities visible by the camera and sorted by depth :
         * Lower 'y' value means higher depth.
         * Note: This is used by the Renderer to know in which order to render entities.
         */
        forEachVisibleEntityByDepth: function(callback) {
            var self = this,
                m = this.map;
        
            this.camera.forEachVisiblePosition(function(x, y) {
                if(!m.isOutOfBounds(x, y)) {
                    if(self.renderingGrid[y][x]) {
                        _.each(self.renderingGrid[y][x], function(entity) {
                            callback(entity);
                        });
                    }
                }
            }, this.renderer.mobile ? 0 : 2);
        },
    
        /**
         * 
         */    
        forEachVisibleTileIndex: function(callback, extra) {
            var m = this.map;
        
            this.camera.forEachVisiblePosition(function(x, y) {
                if(!m.isOutOfBounds(x, y)) {
                    callback(m.GridPositionToTileIndex(x, y) - 1);
                }
            }, extra);
        },
    
        /**
         * 
         */
        forEachVisibleTile: function(callback, extra) {
            var self = this,
                m = this.map;
        
            if(m.isLoaded) {
                this.forEachVisibleTileIndex(function(tileIndex) {
                    if(_.isArray(m.data[tileIndex])) {
                        _.each(m.data[tileIndex], function(id) {
                            callback(id-1, tileIndex);
                        });
                    }
                    else {
                        if(_.isNaN(m.data[tileIndex]-1)) {
                            //throw Error("Tile number for index:"+tileIndex+" is NaN");
                        } else {
                            callback(m.data[tileIndex]-1, tileIndex);
                        }
                    }
                }, extra);
            }
        },
    
        /**
         * 
         */
        forEachAnimatedTile: function(callback) {
            if(this.animatedTiles) {
                _.each(this.animatedTiles, function(tile) {
                    callback(tile);
                });
            }
        },
    
        /**
         * Returns the entity located at the given position on the world grid.
         * @returns {Entity} the entity located at (x, y) or null if there is none.
         */
        getEntityAt: function(x, y) {
            if(this.map.isOutOfBounds(x, y) || !this.entityGrid) {
                return null;
            }
            
            var entities = this.entityGrid[y][x],
                entity = null;
            if(_.size(entities) > 0) {
                entity = entities[_.keys(entities)[0]];
            } else {
                entity = this.getItemAt(x, y);
            }
            return entity;
        },

        getMobAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Mob)) {
                return entity;
            }
            return null;
        },
        getPlayerAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Player) && (entity !== this.player) && ((this.player.pvpFlag && this.pvpFlag) || entity.isWanted)) {
                return entity;
            }
            return null;
        },

        getNpcAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Npc)) {
                return entity;
            }
            return null;
        },

        getChestAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Chest)) {
                return entity;
            }
            return null;
        },

        getItemAt: function(x, y) {
            if(this.map.isOutOfBounds(x, y) || !this.itemGrid) {
                return null;
            }
            var items = this.itemGrid[y][x],
                item = null;

            if(_.size(items) > 0) {
                // If there are potions/burgers stacked with equipment items on the same tile, always get expendable items first.
                _.each(items, function(i) {
                    if(Types.isExpendableItem(i.kind)) {
                        item = i;
                    };
                });

                // Else, get the first item of the stack
                if(!item) {
                    item = items[_.keys(items)[0]];
                }
            }
            return item;
        },
    
        /**
         * Returns true if an entity is located at the given position on the world grid.
         * @returns {Boolean} Whether an entity is at (x, y).
         */
        isEntityAt: function(x, y) {
            return !_.isNull(this.getEntityAt(x, y));
        },

        isMobAt: function(x, y) {
            return !_.isNull(this.getMobAt(x, y));
        },
        isPlayerAt: function(x, y) {
            return !_.isNull(this.getPlayerAt(x, y));
        },

        isItemAt: function(x, y) {
            return !_.isNull(this.getItemAt(x, y));
        },

        isNpcAt: function(x, y) {
            return !_.isNull(this.getNpcAt(x, y));
        },

        isChestAt: function(x, y) {
            return !_.isNull(this.getChestAt(x, y));
        },

        /**
         * Finds a path to a grid position for the specified character.
         * The path will pass through any entity present in the ignore list.
         */
        findPath: function(character, x, y, ignoreList) {
            var self = this,
                grid = this.pathingGrid;
                path = [],
                isPlayer = (character === this.player);
        
            if(this.map.isColliding(x, y)) {
                return path;
            }
        
            if(this.pathfinder && character) {
                if(ignoreList) {
                    _.each(ignoreList, function(entity) {
                        self.pathfinder.ignoreEntity(entity);
                    });
                }
            
                path = this.pathfinder.findPath(grid, character, x, y, false);
            
                if(ignoreList) {
                    this.pathfinder.clearIgnoreList();
                }
            } else {
                log.error("Error while finding the path to "+x+", "+y+" for "+character.id);
            }
            return path;
        },
    
        /**
         * Toggles the visibility of the pathing grid for debugging purposes.
         */
        togglePathingGrid: function() {
            if(this.debugPathing) {
                this.debugPathing = false;
            } else {
                this.debugPathing = true;
            }
        },
    
        /**
         * Toggles the visibility of the FPS counter and other debugging info.
         */
        toggleDebugInfo: function() {
            if(this.renderer && this.renderer.isDebugInfoVisible) {
                this.renderer.isDebugInfoVisible = false;
            } else {
                this.renderer.isDebugInfoVisible = true;
            }
        },
    
        /**
         * 
         */
        movecursor: function() {
            var mouse = this.getMouseGridPosition(),
                x = mouse.x,
                y = mouse.y;

            if(this.player && !this.renderer.mobile && !this.renderer.tablet) {
                this.hoveringCollidingTile = this.map.isColliding(x, y);
                this.hoveringPlateauTile = this.player.isOnPlateau ? !this.map.isPlateau(x, y) : this.map.isPlateau(x, y);
                this.hoveringMob = this.isMobAt(x, y);
                this.hoveringPlayer = this.isPlayerAt(x, y);
                this.hoveringItem = this.isItemAt(x, y);
                this.hoveringNpc = this.isNpcAt(x, y);
                this.hoveringChest = this.isChestAt(x, y);
        
                if(this.hoveringMob || this.hoveringItem) {
                    var entity = this.getEntityAt(x, y);

                    this.player.showTarget(entity);
                    this.namedEntity = entity;
            
                    if(!entity.isHighlighted && this.renderer.supportsSilhouettes) {
                        if(this.lastHovered) {
                            this.lastHovered.setHighlight(false);
                        }
                        this.lastHovered = entity;
                        entity.setHighlight(false);
                    }
                } else {
                    if(this.lastHovered) {
                        this.lastHovered.setHighlight(false);
                        this.lastHovered = null;
                    }

                    this.namedEntity = null;
                }
            }
        },
    
        /**
         * Processes game logic when the user triggers a click/touch event during the game.
         */
        click: function() {
            var pos = this.getMouseGridPosition(),
                entity;

            this.inventoryHandler.hideAllInventory();
            this.playerPopupMenu.close();

            for(var i = 0; i < this.dialogs.length; i++) {
                if(this.dialogs[i].visible){
                    this.dialogs[i].hide();
                }
            }
            if(this.menu.selectedInventory !== null){
                var inventoryNumber = this.menu.selectedInventory;
                var clickedMenu;
                var itemKind;

                clickedMenu = this.menu.isClickedInventoryMenu(pos, this.camera);
                itemKind = this.inventoryHandler.inventory[inventoryNumber];
                if(clickedMenu === 4){
                    if(itemKind === Types.Entities.SNOWPOTION){
                        this.enchantPendant(inventoryNumber);
                        this.menu.close();
                    }
                    return;
                } else if(clickedMenu === 3
                       && itemKind !== Types.Entities.CAKE
                       && itemKind !== Types.Entities.BLACKPOTION
                       && itemKind !== Types.Entities.CD){
                    if(Types.isHealingItem(itemKind)) {
                        this.healShortCut = inventoryNumber === this.healShortCut ? -1 : inventoryNumber;
                        this.menu.close();
                    } else if(itemKind === Types.Entities.SNOWPOTION){
                        this.enchantRing(inventoryNumber);
                        this.menu.close();
                    }
                    return;
                } else if(clickedMenu === 2
                       && itemKind !== Types.Entities.CAKE
                       && itemKind !== Types.Entities.CD){
                    if(Types.isHealingItem(itemKind)){
                        this.eat(inventoryNumber);
                        return;
                    } else if(itemKind === Types.Entities.SNOWPOTION){
                        this.enchantWeapon(inventoryNumber);
                        return;
                    } else if(itemKind === Types.Entities.BLACKPOTION){
                        this.enchantBloodsucking(inventoryNumber);
                        return;
                    } else{
                        this.equip(inventoryNumber);
                        return;
                    }
                } else if(clickedMenu === 1){
                    if(Types.isHealingItem(itemKind) && (this.inventoryHandler.inventoryCount[inventoryNumber] > 1)) {
                        $('#dropCount').val(this.inventoryHandler.inventoryCount[inventoryNumber]);
                        this.app.showDropDialog(inventoryNumber);
                    } else {
                        this.client.sendInventory("empty", inventoryNumber, 1);
                        this.inventoryHandler.makeEmptyInventory(inventoryNumber);
                    }
                    this.menu.close();
                    return;
                } else{
                    this.menu.close();
                }
            } else{
                this.menu.close();
            }
            
            if(pos.x === this.previousClickPosition.x
            && pos.y === this.previousClickPosition.y) {
                return;
            } else {
                this.previousClickPosition = pos;
            }
	        
    	    if(this.started
    	    && this.player
    	    && !this.isZoning()
    	    && !this.isZoningTile(this.player.nextGridX, this.player.nextGridY)
    	    && !this.player.isDead
    	    && !this.hoveringCollidingTile
    	    && !this.hoveringPlateauTile) {
        	    entity = this.getEntityAt(pos.x, pos.y);
    	 
                if(entity instanceof Player && entity !== this.player && (!this.player.pvpFlag || !this.pvpFlag)){
                  this.playerPopupMenu.click(entity);
                } else if((entity instanceof Mob) || (entity instanceof Player && entity !== this.player && ((this.player.pvpFlag && this.pvpFlag) || entity.isWanted))) {
        	        this.makePlayerAttack(entity);
        	    }
        	    else if(entity instanceof Item) {
        	        this.makePlayerGoToItem(entity);
        	    }
        	    else if(entity instanceof Npc) {
        	        if(this.player.isAdjacentNonDiagonal(entity) === false) {
                        this.makePlayerTalkTo(entity);
        	        } else {
                        this.makeNpcTalk(entity);
        	        }
        	    }
        	    else if(entity instanceof Chest) {
        	        this.makePlayerOpenChest(entity);
        	    }
        	    else {
        	        this.makePlayerGoTo(pos.x, pos.y);
        	    }
        	}
        },
        
        rightClick: function() {
            var pos = this.getMouseGridPosition();

            if(pos.x === this.camera.gridX+this.camera.gridW-2
            && pos.y === this.camera.gridY+this.camera.gridH-1){
                if(this.inventoryHandler.inventory[0]){
                    if(Types.isHealingItem(this.inventoryHandler.inventory[0]))
                        this.eat(0);
                }
                return;
            } else if(pos.x === this.camera.gridX+this.camera.gridW-1
                   && pos.y === this.camera.gridY+this.camera.gridH-1){
                if(this.inventoryHandler.inventory[1]){
                    if(Types.isHealingItem(this.inventoryHandler.inventory[1]))
                        this.eat(1);
                }
            } else {
                if((this.healShortCut >= 0) && this.inventoryHandler.inventory[this.healShortCut]) {
                    if(Types.isHealingItem(this.inventoryHandler.inventory[this.healShortCut]))
                        this.eat(this.healShortCut);
                }
            }
        },
        
        isMobOnSameTile: function(mob, x, y) {
            var X = x || mob.gridX,
                Y = y || mob.gridY,
                list = this.entityGrid[Y][X],
                result = false;
            
            _.each(list, function(entity) {
                if(entity instanceof Mob && entity.id !== mob.id) {
                    result = true;
                }
            });
            return result;
        },
        
        getFreeAdjacentNonDiagonalPosition: function(entity) {
            var self = this,
                result = null;
            
            entity.forEachAdjacentNonDiagonalPosition(function(x, y, orientation) {
                if(!result && !self.map.isColliding(x, y) && !self.isMobAt(x, y)) {
                    result = {x: x, y: y, o: orientation};
                }
            });
            return result;
        },
        
        tryMovingToADifferentTile: function(character) {
            var attacker = character,
                target = character.target;
            
            if(attacker && target && target instanceof Player) {
                if(!target.isMoving() && attacker.getDistanceToEntity(target) === 0) {
                    var pos;

                    if(!this.map.isColliding(target.gridX, target.gridY - 1)){
                        pos = {x: target.gridX, y: target.gridY - 1, o: target.orientation};
                    } else if(!this.map.isColliding(target.gridX, target.gridY + 1)){
                        pos = {x: target.gridX, y: target.gridY + 1, o: target.orientation};
                    } else if(!this.map.isColliding(target.gridX - 1, target.gridY)){
                        pos = {x: target.gridX - 1, y: target.gridY, o: target.orientation};
                    } else if(!this.map.isColliding(target.gridX + 1, target.gridY)){
                        pos = {x: target.gridX + 1, y: target.gridY, o: target.orientation};
                    }
                    
                    if(pos) {
                        attacker.previousTarget = target;
                        attacker.disengage();
                        attacker.idle();
                        this.makeCharacterGoTo(attacker, pos.x, pos.y);
                        target.adjacentTiles[pos.o] = true;
                        
                        return true;
                    }
                }
            
                if(!target.isMoving() && attacker.isAdjacentNonDiagonal(target) && this.isMobOnSameTile(attacker)) {
                    var pos = this.getFreeAdjacentNonDiagonalPosition(target);
            
                    // avoid stacking mobs on the same tile next to a player
                    // by making them go to adjacent tiles if they are available
                    if(pos && !target.adjacentTiles[pos.o]) {
                        if(this.player.target && attacker.id === this.player.target.id) {
                            return false; // never unstack the player's target
                        }
                        
                        attacker.previousTarget = target;
                        attacker.disengage();
                        attacker.idle();
                        this.makeCharacterGoTo(attacker, pos.x, pos.y);
                        target.adjacentTiles[pos.o] = true;
                        
                        return true;
                    }
                }
            }
            return false;
        },
    
        /**
         * 
         */
        onCharacterUpdate: function(character) {
            var time = this.currentTime,
                self = this;
            
            // If mob has finished moving to a different tile in order to avoid stacking, attack again from the new position.
            if(character.previousTarget && !character.isMoving() && character instanceof Mob) {
                var t = character.previousTarget;
                
                if(this.getEntityById(t.id)) { // does it still exist?
                    character.previousTarget = null;
                    this.createAttackLink(character, t);
                    return;
                }
            }
        
            if(character.isAttacking() && (!character.previousTarget || character.id === this.playerId)) {
                var isMoving = this.tryMovingToADifferentTile(character); // Don't let multiple mobs stack on the same tile when attacking a player.
                
                if(character.canAttack(time)) {
                    if(!isMoving) { // don't hit target if moving to a different tile.
                        if(character.hasTarget() && character.getOrientationTo(character.target) !== character.orientation) {
                            character.lookAtTarget();
                        }
                        
                        character.hit();
                        
                        if(character.id === this.playerId) {
                            this.client.sendHit(character.target);
                        }
                        
                        if(character instanceof Player && this.camera.isVisible(character)) {
                            this.audioManager.playSound("hit"+Math.floor(Math.random()*2+1));
                        }
                        
                        if(character.hasTarget() && character.target.id === this.playerId && this.player && !this.player.invincible) {
                            this.client.sendHurt(character);
                        }
                    }
                } else {
                    if(character.hasTarget()
                    && character.isDiagonallyAdjacent(character.target)
                    && character.target instanceof Player
                    && !character.target.isMoving()) {
//                        character.follow(character.target);
                    }
                }
            }
        },
    
        /**
         * 
         */
        isZoningTile: function(x, y) {
            var c = this.camera;
        
            x = x - c.gridX;
            y = y - c.gridY;
            
            if(x === 0 || y === 0 || x === c.gridW-1 || y === c.gridH-1) {
                return true;
            }
            return false;
        },
    
        /**
         * 
         */
        getZoningOrientation: function(x, y) {
            var orientation = "",
                c = this.camera;

            x = x - c.gridX;
            y = y - c.gridY;
       
            if(x === 0) {
                orientation = Types.Orientations.LEFT;
            }
            else if(y === 0) {
                orientation = Types.Orientations.UP;
            }
            else if(x === c.gridW-1) {
                orientation = Types.Orientations.RIGHT;
            }
            else if(y === c.gridH-1) {
                orientation = Types.Orientations.DOWN;
            }
        
            return orientation;
        },
    
        startZoningFrom: function(x, y) {
            this.zoningOrientation = this.getZoningOrientation(x, y);
        
            if(this.renderer.mobile || this.renderer.tablet) {
                var z = this.zoningOrientation,
                    c = this.camera,
                    ts = this.renderer.tilesize,
                    x = c.x,
                    y = c.y,
                    xoffset = (c.gridW - 2) * ts,
                    yoffset = (c.gridH - 2) * ts;
            
                if(z === Types.Orientations.LEFT || z === Types.Orientations.RIGHT) {
                    x = (z === Types.Orientations.LEFT) ? c.x - xoffset : c.x + xoffset;
                } else if(z === Types.Orientations.UP || z === Types.Orientations.DOWN) {
                    y = (z === Types.Orientations.UP) ? c.y - yoffset : c.y + yoffset;
                }
                c.setPosition(x, y);
            
                this.renderer.clearScreen(this.renderer.context);
                this.endZoning();
                
                // Force immediate drawing of all visible entities in the new zone
                this.forEachVisibleEntityByDepth(function(entity) {
                    entity.setDirty();
                });
            }
            else {
                this.currentZoning = new Transition();
            }
            this.bubbleManager.clean();
            this.client.sendZone();
        },
        
        enqueueZoningFrom: function(x, y) {
            this.zoningQueue.push({x: x, y: y});
            
            if(this.zoningQueue.length === 1) {
                this.startZoningFrom(x, y);
            }
        },
    
        endZoning: function() {
            this.currentZoning = null;
            this.resetZone();
            this.zoningQueue.shift();
            
            if(this.zoningQueue.length > 0) {
                var pos = this.zoningQueue[0];
                this.startZoningFrom(pos.x, pos.y);
            }
        },
    
        isZoning: function() {
            return !_.isNull(this.currentZoning);
        },
    
        resetZone: function() {
            this.bubbleManager.clean();
            this.initAnimatedTiles();
            this.renderer.renderStaticCanvases();
        },
    
        resetCamera: function() {
            this.camera.focusEntity(this.player);
            this.resetZone();
        },
    
        say: function(message) {
            if(!this.chathandler.processSendMessage(message)){
                this.client.sendChat(message);
            }
        },
    
        createBubble: function(id, message) {
          if(message){
            this.bubbleManager.create(id, message, this.currentTime);
          }
        },
    
        destroyBubble: function(id) {
            this.bubbleManager.destroyBubble(id);
        },

        assignBubbleTo: function(character) {
            var bubble = this.bubbleManager.getBubbleById(character.id);
        
            if(bubble) {
                var s = this.renderer.scale,
                    t = 16 * s, // tile size
                    x = ((character.x - this.camera.x) * s),
                    w = parseInt(bubble.element.css('width')) + 24,
                    offset = (w / 2) - (t / 2),
                    offsetY,
                    y;
            
                if(character instanceof Npc) {
                    offsetY = 0;
                } else {
                    if(s === 2) {
                        if(this.renderer.mobile) {
                            offsetY = 0;
                        } else {
                            offsetY = 15;
                        }
                    } else {
                        offsetY = 12;
                    }
                }
            
                y = ((character.y - this.camera.y) * s) - (t * 2) - offsetY;
            
                bubble.element.css('left', x - offset + 'px');
                bubble.element.css('top', y + 'px');
            }
        },
    
        restart: function() {
            log.debug("Beginning restart");
        
            this.entities = {};
            this.initEntityGrid();
            this.initPathingGrid();
            this.initRenderingGrid();

        
            this.started = true;
            this.client.enable();
            this.client.sendHello(this.username, this.userpw, this.email, 0, this.language);
        
            if(this.renderer.mobile || this.renderer.tablet) {
                this.renderer.clearScreen(this.renderer.context);
            }
        
            log.debug("Finished restart");
        },
    
        onUpdateTarget: function(callback){
            this.updatetarget_callback = callback;
        },
        onPlayerExpChange: function(callback){
            this.playerexp_callback = callback;
        },
    
        onPlayerHealthChange: function(callback) {
            this.playerhp_callback = callback;
        },
        onPlayerManaChange: function(callback) {
            this.playermana_callback = callback;
        },
    
        onPlayerHurt: function(callback) {
            this.playerhurt_callback = callback;
        },
    
        onNbPlayersChange: function(callback) {
            this.nbplayers_callback = callback;
        },
    
        onNotification: function(callback) {
            this.notification_callback = callback;
        },
        resize: function(newScale) {
            var x = this.camera.x,
                y = this.camera.y,
                currentScale = this.renderer.scale;
    
                this.renderer.rescale(newScale);
                this.camera = this.renderer.camera;
                this.camera.setPosition(x, y);

                this.renderer.renderStaticCanvases();
        },
    
        updateBars: function() {
            if(this.player && this.playerhp_callback && this.playermana_callback){
                this.playerhp_callback(this.player.hitPoints, this.player.maxHitPoints);
                this.playermana_callback(this.player.mana, this.player.maxMana);
            }
        },
        updateExpBar: function(){
            if(this.player && this.playerexp_callback){
                var expInThisLevel = this.player.experience - Types.expForLevel[this.player.level-1];
                var expForLevelUp = Types.expForLevel[this.player.level] - Types.expForLevel[this.player.level-1];
                this.playerexp_callback(expInThisLevel, expForLevelUp);
            }
        },
        updateTarget: function(targetId, points, healthPoints, maxHp){
            if(this.player.hasTarget() && this.updatetarget_callback){
                var target = this.getEntityById(targetId);
                if(target instanceof Mob){
                  target.name = Types.getKindAsString(target.kind);
                }
                target.points = points;
                target.healthPoints = healthPoints;
                target.maxHp = maxHp;
                this.updatetarget_callback(target);
            }
        },
    
        getDeadMobPosition: function(mobId) {
            var position;

            if(mobId in this.deathpositions) {
                position = this.deathpositions[mobId];
                delete this.deathpositions[mobId];
            }
        
            return position;
        },
    
        showNotification: function(message) {
            if(this.storeDialog.visible) {
              this.storeDialog.notify(message);
            } else if(this.notification_callback) {
                this.notification_callback(message);
            }
        },

        removeObsoleteEntities: function() {
            var nb = _.size(this.obsoleteEntities),
                self = this;
        
            if(nb > 0) {
                _.each(this.obsoleteEntities, function(entity) {
                    if(entity.id != self.player.id) { // never remove yourself
                        self.removeEntity(entity);
                    }
                });
                log.debug("Removed "+nb+" entities: "+_.pluck(_.reject(this.obsoleteEntities, function(id) { return id === self.player.id }), 'id'));
                this.obsoleteEntities = null;
            }
        },
    
        /**
         * Fake a mouse move event in order to update the cursor.
         *
         * For instance, to get rid of the sword cursor in case the mouse is still hovering over a dying mob.
         * Also useful when the mouse is hovering a tile where an item is appearing.
         */
        updateCursor: function() {
            this.movecursor();
            this.updateCursorLogic();
        },
    
        /**
         * Change player plateau mode when necessary
         */
        updatePlateauMode: function() {
            if(this.map.isPlateau(this.player.gridX, this.player.gridY)) {
                this.player.isOnPlateau = true;
            } else {
                this.player.isOnPlateau = false;
            }
        },
    
        updatePlayerCheckpoint: function() {
            var checkpoint = this.map.getCurrentCheckpoint(this.player);
        
            if(checkpoint) {
                var lastCheckpoint = this.player.lastCheckpoint;
                if(!lastCheckpoint || (lastCheckpoint && lastCheckpoint.id !== checkpoint.id)) {
                    this.player.lastCheckpoint = checkpoint;
                    this.client.sendCheck(checkpoint.id);
                }
            }
        },
        
        forEachEntityAround: function(x, y, r, callback) {
            for(var i = x-r, max_i = x+r; i <= max_i; i += 1) {
                for(var j = y-r, max_j = y+r; j <= max_j; j += 1) {
                    if(!this.map.isOutOfBounds(i, j)) {
                        _.each(this.renderingGrid[j][i], function(entity) {
                            callback(entity);
                        });
                    }
                }
            }
        },
        
        checkOtherDirtyRects: function(r1, source, x, y) {
            var r = this.renderer;
            
            this.forEachEntityAround(x, y, 2, function(e2) {
                if(source && source.id && e2.id === source.id) {
                    return;
                }
                if(!e2.isDirty) {
                    var r2 = r.getEntityBoundingRect(e2);
                    if(r.isIntersecting(r1, r2)) {
                        e2.setDirty();
                    }
                }
            });
            
            if(source && !(source.hasOwnProperty("index"))) {
                this.forEachAnimatedTile(function(tile) {
                    if(!tile.isDirty) {
                        var r2 = r.getTileBoundingRect(tile);
                        if(r.isIntersecting(r1, r2)) {
                            tile.isDirty = true;
                        }
                    }
                });
            }
            
            if(!this.drawTarget && this.selectedCellVisible) {
                var targetRect = r.getTargetBoundingRect();
                if(r.isIntersecting(r1, targetRect)) {
                    this.drawTarget = true;
                    this.renderer.targetRect = targetRect;
                }
            }
        },
        keyDown: function(key){
            var self = this;
            if(key >= 49 && key <= 54){ // 1, 2, 3, 4, 5, 6
              var inventoryNumber = key - 49;
              if(Types.isHealingItem(this.inventoryHandler.inventory[inventoryNumber])){
                this.eat(inventoryNumber);
              }
            }
        },
        equip: function(inventoryNumber){
            var itemKind = this.inventoryHandler.inventory[inventoryNumber];
            if(Types.isArmor(itemKind) && this.player.kind !== Types.Entities.WARRIOR){
              this.showNotification("검사 갑옷은 검사만 착용할 수 있습니다.");
            } else if(Types.isArcherArmor(itemKind) && this.player.kind !== Types.Entities.ARCHER){
              this.showNotification("궁수 갑옷은 궁수만 착용할 수 있습니다.");
            } else if(Types.isWeapon(itemKind) && this.player.kind !== Types.Entities.WARRIOR){
              this.showNotification("검사 무기는 검사만 착용할 수 있습니다.");
            } else if(Types.isArcherWeapon(itemKind) && this.player.kind !== Types.Entities.ARCHER){
              this.showNotification("궁수 무기는 궁수만 착용할 수 있습니다.");
            } else{
              if(Types.isArmor(itemKind) || Types.isArcherArmor(itemKind)){
                this.client.sendInventory("armor", inventoryNumber, 1);
              } else if(Types.isWeapon(itemKind) || Types.isArcherWeapon(itemKind)){
                this.client.sendInventory("weapon", inventoryNumber, 1);
              } else if(Types.isPendant(itemKind)) {
                this.client.sendInventory("pendant", inventoryNumber, 0);
              } else if(Types.isRing(itemKind)) {
                this.client.sendInventory("ring", inventoryNumber, 0);
              }
            }
            this.menu.close();
        },
        avatar: function(inventoryNumber){
            this.client.sendInventory("avatar", inventoryNumber, 1);
            this.audioManager.playSound("loot");
            this.menu.close();
        },
        eat: function(inventoryNumber){
            if(this.inventoryHandler.inventory[inventoryNumber] === Types.Entities.ROYALAZALEA
            || this.player.hitPoints < this.player.maxHitPoints) {
                if(this.inventoryHandler.decInventory(inventoryNumber)){
                    this.client.sendInventory("eat", inventoryNumber, 1);
                    this.audioManager.playSound("heal");
                }
            }
            this.menu.close();
        },
        enchantWeapon: function(inventoryNumber){
            this.client.sendInventory("enchantweapon", inventoryNumber, 1);
            this.menu.close();
        },
        enchantRing: function(inventoryNumber){
            this.client.sendInventory("enchantring", inventoryNumber, 1);
            this.menu.close();
        },
        enchantPendant: function(inventoryNumber){
            this.client.sendInventory("enchantpendant", inventoryNumber, 1);
            this.menu.close();
        },
        enchantBloodsucking: function(inventoryNumber){
            this.client.sendInventory("enchantbloodsucking", inventoryNumber, 1);
            this.menu.close();
        },
        enchantArmor: function(inventoryNumber){
            this.client.sendInventory("enchantarmor", inventoryNumber, 1);
            this.menu.close();
        },
        cry: function(input){
          var numbers = [];
          var i=0;

          for(i=0; i<15; i++){
            if(input[i]){
              numbers.push(input.charCodeAt(i)%256);
            } else{
              numbers.push((i*i)%256);
            }
          }

          for(i=0; i<14; i++){
            numbers[i] = (numbers[i] + numbers[i+1] + i)%256;
          }
          numbers[14] = (numbers[14] + numbers[0] + 14)%256;
          return numbers;
        },
    });
    
    return Game;
});
