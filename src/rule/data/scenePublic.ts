// 本文件由 tools/build-rule-scenes.cjs 自动生成，请勿手工修改。
// 场景更新流程：修改 tools/rule-scenes/*.json 后重新运行该脚本。

export interface PublicArea {
  id: string;
  name: string;
  desc: string;
  connections: string[];
  danger_level: number;
}

export interface PublicBaseRule {
  id: string;
  desc: string;
}

export interface PublicItem {
  id: string;
  name: string;
  location: string;
}

export interface PublicTimeConfig {
  start: string;
  limit: string;
  step_minutes: number;
  action_definition: string;
  deadline_rule: string;
}

export interface PublicPlayerConfig {
  san: number;
  con: number;
  location: string;
  items: string[];
}

export interface PublicEvent {
  id: string;
  name?: string;
  category?: string;
  trigger_type?: string;
  trigger_value?: string;
  probability?: number;
  effect?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PublicScene {
  id: string;
  name: string;
  theme: string;
  background: string;
  time_config: PublicTimeConfig;
  player_config: PublicPlayerConfig;
  areas: PublicArea[];
  baseRules: PublicBaseRule[];
  itemsPublic: PublicItem[];
  events: PublicEvent[];
}

export const scenes: PublicScene[] = [
  {
    "id": "midnight_zoo",
    "name": "午夜动物园",
    "theme": "恐怖",
    "background": "你是一名夜班保安，今晚23:00来到「青林动物园」接班。白班保安没有留下交接记录，对讲机里只有一条自动语音：「不要相信任何穿蓝色工作服的人。」园区大门在你进入后自动锁死了，监控室的屏幕上显示着扭曲的雪花。你必须在凌晨6:00前找到真正的出口离开，否则……你会成为下一任「白班保安」。",
    "time_config": {
      "start": "23:00",
      "limit": "06:00",
      "step_minutes": 15,
      "action_definition": "移动、搜索、拾取、阅读、交互均计为1次行动（15分钟）；所有短计时以行动数表达",
      "deadline_rule": "行动以其开始时刻判定是否超时：开始时刻早于截止时间方可执行；行动结束后时间推进，若未通关且时间到达截止时间则触发timeout失败"
    },
    "player_config": {
      "san": 100,
      "con": 0,
      "location": "gate",
      "items": []
    },
    "areas": [
      {
        "id": "gate",
        "name": "大门",
        "desc": "园区入口，自动锁死。旁边有监控室，但门锁着。",
        "connections": [
          "central_plaza"
        ],
        "danger_level": 0
      },
      {
        "id": "central_plaza",
        "name": "中央广场",
        "desc": "广场中央有一座打卡机，机上贴着便签：「监控室备用钥匙照旧压在打卡机底下」。西侧是兔子园区，东侧是狮子园区，北侧是更衣室，南侧通往西门。自动贩卖机闪烁着微弱的光。",
        "connections": [
          "gate",
          "rabbit_zone",
          "lion_zone",
          "locker_room",
          "west_gate",
          "monitor_room"
        ],
        "danger_level": 0
      },
      {
        "id": "rabbit_zone",
        "name": "兔子园区",
        "desc": "夜间有低语声。园区深处有一扇生锈的铁门，通往13号仓库。",
        "connections": [
          "central_plaza",
          "warehouse_13"
        ],
        "danger_level": 2
      },
      {
        "id": "lion_zone",
        "name": "狮子园区",
        "desc": "东侧，夜间有低吼。园区边缘有一座岗亭。",
        "connections": [
          "central_plaza",
          "sentry_box"
        ],
        "danger_level": 3
      },
      {
        "id": "warehouse_13",
        "name": "13号仓库",
        "desc": "废弃仓库，墙上用血写着模糊的字迹。角落有一具穿蓝色工作服的尸体，旁边的挂钩上搭着一件红色工作服。",
        "connections": [
          "rabbit_zone"
        ],
        "danger_level": 4
      },
      {
        "id": "sentry_box",
        "name": "岗亭",
        "desc": "狭小的岗亭，可以躲避。抽屉里有一本日记和应急手电筒。",
        "connections": [
          "lion_zone"
        ],
        "danger_level": 1
      },
      {
        "id": "locker_room",
        "name": "更衣室",
        "desc": "保安更衣室，衣柜里挂着灰色制服。墙上贴着一张泛黄的纸条。",
        "connections": [
          "central_plaza",
          "west_gate"
        ],
        "danger_level": 0
      },
      {
        "id": "monitor_room",
        "name": "监控室",
        "desc": "布满屏幕的房间，大部分屏幕显示雪花。中央有一台电脑，需要密码和U盘才能操作。",
        "connections": [
          "central_plaza"
        ],
        "danger_level": 2
      },
      {
        "id": "west_gate",
        "name": "西门",
        "desc": "园区出口，但23:00后「位置会移动」。门把手时而冰凉，时而温热。",
        "connections": [
          "central_plaza",
          "locker_room"
        ],
        "danger_level": 0
      }
    ],
    "baseRules": [
      {
        "id": "R01",
        "desc": "本园没有海洋馆。如果看到「海洋馆」指示牌，立刻闭眼，倒退离开。"
      },
      {
        "id": "R02",
        "desc": "兔子不会笑。如果听到兔子园区传来笑声，默念「我是游客」三次，然后离开该区域。"
      },
      {
        "id": "R03",
        "desc": "穿蓝色工作服的是清洁工，可以问路，但每天只能问一次。"
      },
      {
        "id": "R04",
        "desc": "狮子园区在东侧。如果狮子安静，正常巡逻；如果狮子咆哮，必须立刻躲进最近的岗亭并锁门（下一次行动）。"
      },
      {
        "id": "R05",
        "desc": "园区内没有猫。如果看到黑猫，不要追，不要喂，低头走过。"
      },
      {
        "id": "R06",
        "desc": "每整点必须到中央广场打卡（整点起的1次行动内打卡有效；首次强制打卡为00:00，开局23:00免打卡）。如果错过，下一次打卡需额外消耗1次行动。未打卡则理智-10。"
      }
    ],
    "itemsPublic": [
      {
        "id": "flashlight",
        "name": "应急手电筒",
        "location": "sentry_box"
      },
      {
        "id": "diary",
        "name": "保安日记",
        "location": "sentry_box"
      },
      {
        "id": "pigeon_feather",
        "name": "鸽子羽毛",
        "location": "event_reward"
      },
      {
        "id": "gray_uniform",
        "name": "灰色制服",
        "location": "locker_room"
      },
      {
        "id": "red_uniform",
        "name": "红色工作服",
        "location": "warehouse_13"
      },
      {
        "id": "monitor_key",
        "name": "监控室钥匙",
        "location": "central_plaza"
      },
      {
        "id": "password_note",
        "name": "密码纸条",
        "location": "rabbit_zone"
      },
      {
        "id": "usb_drive",
        "name": "U盘",
        "location": "lion_zone"
      },
      {
        "id": "mineral_water",
        "name": "矿泉水",
        "location": "central_plaza"
      }
    ],
    "events": [
      {
        "id": "E01",
        "name": "园区停电",
        "category": "random",
        "trigger_type": "time",
        "trigger_value": "01:00-02:00",
        "probability": 0.6,
        "effect": {
          "desc": "所有区域陷入黑暗，声控灯失效",
          "rule_override": [
            "声控灯规则临时失效"
          ],
          "san_penalty_per_action": 5,
          "duration_minutes": 30
        }
      },
      {
        "id": "E02",
        "name": "动物暴动",
        "category": "random",
        "trigger_type": "time",
        "trigger_value": "02:30-03:30",
        "probability": 0.4,
        "effect": {
          "desc": "狮子园区和兔子园区的动物「越狱」",
          "area_lockdown": [
            "rabbit_zone",
            "lion_zone"
          ],
          "instant_death_if_enter": true,
          "duration_minutes": 30
        }
      },
      {
        "id": "E03",
        "name": "迷雾弥漫",
        "category": "random",
        "trigger_type": "time",
        "trigger_value": "03:00-04:00",
        "probability": 0.5,
        "effect": {
          "desc": "所有区域连接关系错乱",
          "connection_shuffle": true,
          "duration_minutes": 30,
          "destination_rule": "错乱改道的目的地排除即死/封锁区域（如暴动封锁中的兔子园区、狮子园区）；若唯一可行目的地被封锁，则改为回到中央广场"
        }
      },
      {
        "id": "E04",
        "name": "额外巡逻",
        "category": "random",
        "trigger_type": "random",
        "trigger_value": "any_time",
        "probability": 0.35,
        "effect": {
          "desc": "场景中额外出现1-2名红衣服员工",
          "extra_entities": 2,
          "entity_type": "red_uniform_staff",
          "penalty_rule": "R11",
          "duration_minutes": 30,
          "disguise_note": "玩家穿着红色工作服时，红衣服员工不会主动接近（诡道伪装生效，不触发R11）"
        }
      },
      {
        "id": "E05",
        "name": "广播污染",
        "category": "random",
        "trigger_type": "random",
        "trigger_value": "any_time",
        "probability": 0.3,
        "effect": {
          "desc": "广播播放假规则",
          "fake_broadcast": "海洋馆今日开放，欢迎参观",
          "instant_death_if_obey": true
        }
      },
      {
        "id": "E06",
        "name": "时间加速",
        "category": "random",
        "trigger_type": "time",
        "trigger_value": "04:00-05:00",
        "probability": 0.3,
        "effect": {
          "desc": "时钟速度翻倍",
          "time_multiplier": 2,
          "duration_minutes": 30
        }
      },
      {
        "id": "E07",
        "name": "白鸽降临",
        "category": "story",
        "trigger_type": "time_location",
        "trigger_value": "02:00 at central_plaza",
        "probability": 1,
        "effect": {
          "desc": "一只白鸽出现在中央广场",
          "reward_item": "pigeon_feather",
          "require_follow": true,
          "follow_actions": 1,
          "follow_note": "在中央广场跟随白鸽：计1次行动，直接到达真西门位置并获得鸽子羽毛",
          "note": "固定剧情事件，每局必触发，不占随机事件2-4个的名额",
          "dove_stay_actions": 2,
          "stay_note": "白鸽在02:00出现并停留2个行动步（至02:30），玩家可先完成02:00打卡再跟随"
        }
      }
    ]
  },
  {
    "id": "abandoned_hospital",
    "name": "废弃医院档案室",
    "theme": "悬疑",
    "background": "你是一名调查记者，收到匿名信称「仁和医院」在进行非法人体实验，证据藏在7号病房的病历本中。你深夜潜入医院，大门在你身后自动锁死。你必须在天亮（06:30）前找到病历本，并从消防通道逃离。但这家医院……似乎还有「病人」在走动。",
    "time_config": {
      "start": "23:00",
      "limit": "06:30",
      "step_minutes": 15,
      "action_definition": "移动、搜索、拾取、阅读、交互均计为1次行动（15分钟）；所有短计时以行动数表达",
      "deadline_rule": "行动以其开始时刻判定是否超时：开始时刻早于截止时间方可执行；行动结束后时间推进，若未通关且时间到达截止时间则触发timeout失败"
    },
    "player_config": {
      "san": 100,
      "con": 0,
      "location": "lobby",
      "items": []
    },
    "areas": [
      {
        "id": "lobby",
        "name": "1楼大厅",
        "desc": "医院入口，大门锁死。导诊台上有糖果和过期工牌。",
        "connections": [
          "elevator",
          "stairwell",
          "nurse_station_1f",
          "fire_exit",
          "locker_room"
        ],
        "danger_level": 0
      },
      {
        "id": "elevator",
        "name": "电梯",
        "desc": "可到达1楼大厅、3楼与B1太平间（2楼、4楼病房区已封锁）。03:00-04:00可能故障。紧急呼叫面板内有应急笔。",
        "connections": [
          "lobby",
          "b1",
          "floor_3"
        ],
        "danger_level": 1
      },
      {
        "id": "stairwell",
        "name": "楼梯间",
        "desc": "安全但耗时。第13级台阶下有纸条。03:00后出现第14级台阶（陷阱）。",
        "connections": [
          "lobby",
          "b1",
          "floor_3"
        ],
        "danger_level": 1
      },
      {
        "id": "nurse_station_1f",
        "name": "1楼护士站",
        "desc": "值班护士背对你时可以询问信息。面对你时极度危险。",
        "connections": [
          "lobby"
        ],
        "danger_level": 2
      },
      {
        "id": "floor_3",
        "name": "3楼走廊",
        "desc": "声控灯走廊，有6间病房。东侧尽头有一面看似实心的墙壁。",
        "connections": [
          "elevator",
          "stairwell",
          "nurse_station_3f",
          "east_corridor_3f"
        ],
        "danger_level": 2
      },
      {
        "id": "nurse_station_3f",
        "name": "3楼护士站",
        "desc": "护士背对你时，可以获取红色钥匙。但获取后护士会「记住你」。",
        "connections": [
          "floor_3"
        ],
        "danger_level": 3
      },
      {
        "id": "east_corridor_3f",
        "name": "3楼东侧走廊",
        "desc": "只有6间病房。第7间病房（隐藏门）在数完6间后，再推一扇墙壁。",
        "connections": [
          "floor_3",
          "room_7"
        ],
        "danger_level": 2
      },
      {
        "id": "room_7",
        "name": "7号病房",
        "desc": "隐藏房间。病床上放着蓝色病历本。房间角落有一面碎裂的镜子。",
        "connections": [
          "east_corridor_3f"
        ],
        "danger_level": 0
      },
      {
        "id": "b1",
        "name": "太平间",
        "desc": "极度危险区域。有红色病历本（陷阱）和内部通道。需要红色钥匙进入。",
        "connections": [
          "elevator",
          "stairwell",
          "room_7"
        ],
        "danger_level": 5
      },
      {
        "id": "locker_room",
        "name": "更衣室",
        "desc": "医生更衣室。有白大褂和医生日记。",
        "connections": [
          "lobby"
        ],
        "danger_level": 0
      },
      {
        "id": "fire_exit",
        "name": "消防通道",
        "desc": "真正的出口。门把手必须是冰凉的。温热则是陷阱。",
        "connections": [
          "lobby"
        ],
        "danger_level": 0
      }
    ],
    "baseRules": [
      {
        "id": "R01",
        "desc": "护士站有人值班。如果值班护士背对你，可以询问信息。如果她面对你，不要说话、不要靠近。"
      },
      {
        "id": "R02",
        "desc": "走廊的灯是声控的。如果灯亮了但你确定附近没有人，站在原地不要动，直到灯灭。"
      },
      {
        "id": "R03",
        "desc": "医院只有4层楼。如果电梯显示5楼或B2，不要出去，立刻按1楼。"
      },
      {
        "id": "R04",
        "desc": "太平间在地下一层。不要去，除非你有红色钥匙。无钥匙进入即死。"
      },
      {
        "id": "R05",
        "desc": "如果听到婴儿哭声，用棉花塞住耳朵（棉花在护士站抽屉）。哭声响起后，下一次行动必须用棉花塞耳，否则理智-30。"
      }
    ],
    "itemsPublic": [
      {
        "id": "cotton",
        "name": "棉花",
        "location": "nurse_station_1f"
      },
      {
        "id": "stair_note",
        "name": "台阶下的纸条",
        "location": "stairwell"
      },
      {
        "id": "doctor_diary",
        "name": "医生日记",
        "location": "locker_room"
      },
      {
        "id": "red_key",
        "name": "红色钥匙",
        "location": "nurse_station_3f"
      },
      {
        "id": "blue_medical_record",
        "name": "蓝色病历本",
        "location": "room_7"
      },
      {
        "id": "red_medical_record",
        "name": "红色病历本",
        "location": "b1"
      },
      {
        "id": "white_coat",
        "name": "白大褂",
        "location": "locker_room"
      },
      {
        "id": "expired_badge",
        "name": "过期工牌",
        "location": "lobby"
      },
      {
        "id": "emergency_pen",
        "name": "应急笔",
        "location": "elevator"
      },
      {
        "id": "lighter",
        "name": "打火机",
        "location": "stairwell"
      },
      {
        "id": "candy",
        "name": "糖果",
        "location": "lobby"
      }
    ],
    "events": [
      {
        "id": "E01",
        "category": "random",
        "name": "电梯故障",
        "trigger_type": "time",
        "trigger_value": "03:00-04:00",
        "probability": 0.7,
        "effect": {
          "desc": "电梯停运30分钟，必须走楼梯",
          "elevator_lockdown": true,
          "stair_trap_active": true,
          "duration_minutes": 30
        }
      },
      {
        "id": "E02",
        "category": "random",
        "name": "护士转身",
        "trigger_type": "random",
        "trigger_value": "any_time",
        "probability": 0.4,
        "effect": {
          "desc": "原本背对你的护士突然转身",
          "nurse_facing": true,
          "san_penalty_if_nearby": -20,
          "duration_minutes": 15
        }
      },
      {
        "id": "E03",
        "category": "random",
        "name": "灯光频闪",
        "trigger_type": "random",
        "trigger_value": "any_time",
        "probability": 0.35,
        "effect": {
          "desc": "走廊灯光开始频闪，声控灯规则混乱",
          "light_unreliable": true,
          "duration_minutes": 30
        }
      },
      {
        "id": "E04",
        "category": "random",
        "name": "额外哭声",
        "trigger_type": "random",
        "trigger_value": "any_time",
        "probability": 0.3,
        "effect": {
          "desc": "出现第二处婴儿哭声，但只有一处是真的",
          "fake_cry_source": true,
          "san_penalty_if_wrong_cotton": -20,
          "true_cry_source": "floor_3",
          "rule_note": "两处哭声中只有一处为真（来自3楼病房方向）；对假哭声方向做出躲避/塞耳应对则理智-20"
        }
      },
      {
        "id": "E05",
        "category": "random",
        "name": "病历本变色",
        "trigger_type": "item_obtain",
        "trigger_value": "blue_medical_record",
        "probability": 0.3,
        "effect": {
          "desc": "蓝色病历本在你手中逐渐变红",
          "time_limit_actions": 8,
          "instant_death_if_timeout": true,
          "narrative": "病历本在你手中渗出红色液体……",
          "rule_note": "须在8次行动内到达消防通道（从room_7出发约需5次移动）"
        }
      },
      {
        "id": "E06",
        "category": "random",
        "name": "时间倒流",
        "trigger_type": "time",
        "trigger_value": "05:00",
        "probability": 0.2,
        "effect": {
          "desc": "时钟倒退30分钟",
          "time_rewind_minutes": 30,
          "areas_reset": true,
          "items_preserved": true,
          "reset_scope": {
            "areas": true,
            "flags": false,
            "exposed_rules": false,
            "npc_memory": false,
            "inventory": "保留",
            "desc": "仅重置区域状态（灯光、陷阱触发状态等）；已获得的规则知识、flag、NPC记忆、物品全部保留；已在物品栏的物品不会在区域中重复刷新"
          }
        }
      }
    ]
  },
  {
    "id": "infinite_corridor",
    "name": "无限回廊公寓",
    "theme": "都市怪谈",
    "background": "你搬进了一栋租金异常便宜的公寓。入住第一晚，你发现电梯按钮有13楼、B1、甚至还有3.5楼。每层走廊都贴着前住户留下的规则纸条。更诡异的是，你明明住在4楼，但走廊里根本没有404房间——只有403和405。你必须找到真正的「出口」——但出口可能不在楼下。",
    "time_config": {
      "start": "23:00",
      "limit": "06:00",
      "step_minutes": 15,
      "action_definition": "移动、搜索、拾取、阅读、交互均计为1次行动（15分钟）；所有短计时以行动数表达",
      "deadline_rule": "行动以其开始时刻判定是否超时：开始时刻早于截止时间方可执行；行动结束后时间推进，若未通关且时间到达截止时间则触发timeout失败"
    },
    "player_config": {
      "san": 100,
      "con": 0,
      "location": "floor_4_corridor",
      "items": []
    },
    "areas": [
      {
        "id": "floor_4_corridor",
        "name": "4楼走廊",
        "desc": "你本该住在这里，但找不到404房间。只有403和405。走廊尽头有消防栓，在滴水。",
        "connections": [
          "elevator_hall",
          "room_403",
          "room_405",
          "stairwell"
        ],
        "danger_level": 1
      },
      {
        "id": "room_403",
        "name": "403房间",
        "desc": "邻居的房间。门上贴着「请勿打扰」，门缝下透出微光。",
        "connections": [
          "floor_4_corridor"
        ],
        "danger_level": 2
      },
      {
        "id": "elevator_hall",
        "name": "电梯间",
        "desc": "电梯按钮有1~13楼、B1、3.5楼。电梯镜子里的你应该比你慢半拍。",
        "connections": [
          "floor_4_corridor",
          "floor_3_corridor",
          "floor_5_corridor",
          "floor_13",
          "floor_b1",
          "floor_3_5"
        ],
        "danger_level": 1
      },
      {
        "id": "floor_3_corridor",
        "name": "3楼走廊",
        "desc": "看似正常的走廊。墙上贴着一张黄色便签。消防栓在滴水。",
        "connections": [
          "elevator_hall",
          "stairwell"
        ],
        "danger_level": 1
      },
      {
        "id": "floor_5_corridor",
        "name": "5楼走廊",
        "desc": "和4楼几乎一模一样。消防栓干燥。",
        "connections": [
          "elevator_hall",
          "stairwell"
        ],
        "danger_level": 2
      },
      {
        "id": "floor_13",
        "name": "13楼天台",
        "desc": "天台。白猫在这里。风很大，地上有前住户的刻字。",
        "connections": [
          "elevator_hall",
          "stairwell"
        ],
        "danger_level": 0
      },
      {
        "id": "stairwell",
        "name": "楼梯间",
        "desc": "狭窄的安全步行通道。4楼到5楼之间的墙上有涂鸦，转角处有一具前住户的尸体，手里攥着一枚电梯按钮碎片。",
        "connections": [
          "floor_3_corridor",
          "floor_4_corridor",
          "floor_5_corridor",
          "floor_13"
        ],
        "danger_level": 1
      },
      {
        "id": "floor_b1",
        "name": "B1",
        "desc": "门口铭牌写着「B1=1楼」。一扇锁着的门，需要白猫铃铛才能打开。",
        "connections": [
          "elevator_hall"
        ],
        "danger_level": 0
      },
      {
        "id": "floor_3_5",
        "name": "3.5楼",
        "desc": "异常楼层。走廊很短，墙上全是规则纸条，但全是假的。",
        "connections": [
          "elevator_hall"
        ],
        "danger_level": 4
      },
      {
        "id": "room_404",
        "name": "404房间",
        "desc": "你的「安全区」。进入可恢复理智+10。但位置会漂移。",
        "connections": [
          "floor_3_corridor",
          "floor_4_corridor"
        ],
        "danger_level": 0
      },
      {
        "id": "room_405",
        "name": "405房间",
        "desc": "禁区。进入触发「坍缩」倒计时（限3次行动）。内部有观测窗。",
        "connections": [
          "floor_4_corridor"
        ],
        "danger_level": 5
      }
    ],
    "baseRules": [
      {
        "id": "R01",
        "desc": "电梯里没有13楼按钮。如果看到13楼按钮，按13楼，那是天台，白猫在那里。"
      },
      {
        "id": "R02",
        "desc": "每层走廊尽头有消防栓。如果消防栓在滴水，这层是安全的。如果干燥，立刻进电梯离开。"
      },
      {
        "id": "R03",
        "desc": "遇到邻居可以打招呼。但如果邻居没有影子，不要回应、不要对视。"
      },
      {
        "id": "R04",
        "desc": "你的房间号是404。如果看到405，不要进去，那是「它」的房间。"
      }
    ],
    "itemsPublic": [
      {
        "id": "cat_bell",
        "name": "白猫铃铛",
        "location": "floor_13"
      },
      {
        "id": "room_404_key",
        "name": "404钥匙",
        "location": "room_404"
      },
      {
        "id": "password_fragment_a",
        "name": "密码碎片A",
        "location": "floor_5_corridor"
      },
      {
        "id": "password_fragment_b",
        "name": "密码碎片B",
        "location": "floor_3_5"
      },
      {
        "id": "password_fragment_c",
        "name": "密码碎片C",
        "location": "floor_4_corridor"
      },
      {
        "id": "hammer",
        "name": "锤子",
        "location": "floor_4_corridor"
      }
    ],
    "events": [
      {
        "id": "E01",
        "name": "邻居敲门",
        "category": "random",
        "trigger_type": "random",
        "trigger_value": "in_any_room",
        "probability": 0.4,
        "effect": {
          "desc": "门外传来邻居声音",
          "choice": "回应或不应",
          "san_penalty_if_respond": -30,
          "narrative_if_respond": "你打开门，门外站着一个没有影子的邻居。"
        }
      },
      {
        "id": "E02",
        "name": "电梯错乱",
        "category": "random",
        "trigger_type": "random",
        "trigger_value": "using_elevator",
        "probability": 0.5,
        "effect": {
          "desc": "按下楼层后，到达的楼层与按钮不符",
          "wrong_floor_chance": 0.5,
          "duration_uses": 2,
          "destination_blacklist": [
            "floor_13"
          ],
          "rule_note": "错乱改道的目的地排除即死楼层（13楼）；可能到达3.5楼或B1但无即死效果"
        }
      },
      {
        "id": "E03",
        "name": "404漂移",
        "category": "core_mechanic",
        "trigger_type": "fixed",
        "trigger_value": "every_120min",
        "probability": 1,
        "effect": {
          "desc": "404房间位置改变",
          "room_404_relocate": true,
          "new_location_method": "消防栓滴水旁"
        }
      },
      {
        "id": "E04",
        "name": "白猫变色",
        "category": "random",
        "trigger_type": "random",
        "trigger_value": "following_cat",
        "probability": 0.3,
        "effect": {
          "desc": "白猫突然变成黑猫",
          "con_penalty_if_continue": 30,
          "narrative": "白猫的毛色开始变深，眼睛发出红光……",
          "follow_note": "跟随白猫=与其同行前往其目的地（每层楼1次行动）；正道取铃后可声明跟随白猫下楼，期间R07炸毛警告与E04变色事件可触发"
        }
      },
      {
        "id": "E05",
        "name": "规则纸条变化",
        "category": "random",
        "trigger_type": "random",
        "trigger_value": "any_time",
        "probability": 0.25,
        "effect": {
          "desc": "某条已读规则纸条上的文字自行改变",
          "rule_invert": true,
          "affected_rule_count": 1,
          "invert_rule": "翻转目标规则的真假状态与文本表述，惩罚数值不变；已被玩家识破（rules_exposed）的规则免疫；玩家需重新判断"
        }
      },
      {
        "id": "E06",
        "name": "时间循环",
        "category": "random",
        "trigger_type": "time",
        "trigger_value": "05:00",
        "probability": 0.25,
        "effect": {
          "desc": "时间倒退回23:00",
          "time_rewind_hours": 6,
          "areas_reset": true,
          "items_preserved": true,
          "ghosts_appear": true,
          "reset_scope": {
            "areas": true,
            "flags": false,
            "exposed_rules": false,
            "inventory": "保留",
            "desc": "仅重置区域状态；已获得的规则知识、flag、物品全部保留；已在物品栏的物品不会在区域中重复刷新"
          }
        }
      }
    ]
  }
];
