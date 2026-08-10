// 本文件由 tools/build-rule-scenes.cjs 自动生成，请勿手工修改。
// 场景更新流程：修改 tools/rule-scenes/*.json 后重新运行该脚本。
// 包含 hidden_truth / is_fake / win_conditions 等底牌，仅供 Serverless Function 使用，绝不可被前端引用。

const scenes = {
  midnight_zoo: {
    "id": "midnight_zoo",
    "name": "午夜动物园",
    "theme": "恐怖",
    "background": "你是一名夜班保安，今晚23:00来到「青林动物园」接班。白班保安没有留下交接记录，对讲机里只有一条自动语音：「不要相信任何穿蓝色工作服的人。」园区大门在你进入后自动锁死了，监控室的屏幕上显示着扭曲的雪花。你必须在凌晨6:00前找到真正的出口离开，否则……你会成为下一任「白班保安」。",
    "hidden_truth": "这座动物园是一个「认知污染实验场」。所有动物都是未能逃离的人类转化的。白班保安=上一批被同化的夜班保安。你带走的鸽子羽毛，是实验体脱离场域的「标记」——但你真的逃出去了吗？",
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
        "items": [],
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
        "items": [
          "monitor_key",
          "mineral_water"
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
        "items": [
          "password_note"
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
        "items": [
          "usb_drive"
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
        "items": [
          "red_uniform"
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
        "items": [
          "flashlight",
          "diary"
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
        "items": [
          "gray_uniform"
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
        "items": [],
        "danger_level": 2,
        "requirement": "monitor_key",
        "computer": {
          "requires_items": [
            "password_note",
            "usb_drive"
          ],
          "result_flag": "used_monitor_computer",
          "desc": "插入U盘并输入纸条上的密码，定位西门的当前坐标"
        }
      },
      {
        "id": "west_gate",
        "name": "西门",
        "desc": "园区出口，但23:00后「位置会移动」。门把手时而冰凉，时而温热。",
        "connections": [
          "central_plaza",
          "locker_room"
        ],
        "items": [],
        "danger_level": 0,
        "special_movement": {
          "moves_after": "23:00",
          "returns_every_minutes": 120,
          "return_window_actions": 1,
          "window_alignment": "每2小时整点（01:00、03:00、05:00）起的1次行动内，西门回到原位",
          "true_gate_feature": "门把手冰凉",
          "desc": "23:00后位置移动，每2小时回到原位一次（整点起的1次行动内）；温热把手是伪装陷阱",
          "fake_gate_penalty": {
            "con_change": 25,
            "desc": "在温热把手的假西门尝试开门：门后是一段走不完的无尽回廊，等你回过神来，已经站在了中央广场——污染+25（含使用红色工作服开门的情况）",
            "move_to": "central_plaza"
          }
        }
      }
    ],
    "rules": [
      {
        "id": "R01",
        "type": "instant_death",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "进入海洋馆或看到海洋馆指示牌未闭眼倒退",
        "desc": "本园没有海洋馆。如果看到「海洋馆」指示牌，立刻闭眼，倒退离开。",
        "san_change": 0,
        "con_change": 0,
        "hint": "海洋馆不存在，任何相关事物都是陷阱。"
      },
      {
        "id": "R02",
        "type": "san_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "在兔子园区听到笑声且未默念「我是游客」三次",
        "trigger_chance": 0.5,
        "trigger_when": "每次进入兔子园区时判定",
        "desc": "兔子不会笑。如果听到兔子园区传来笑声，默念「我是游客」三次，然后离开该区域。",
        "san_change": -20,
        "con_change": 0,
        "hint": "兔子的笑声是认知污染的一种形式。"
      },
      {
        "id": "R03",
        "type": "con_penalty",
        "source": "基础手册",
        "is_fake": true,
        "trigger": "向穿蓝色工作服的人问路",
        "desc": "穿蓝色工作服的是清洁工，可以问路，但每天只能问一次。",
        "san_change": 0,
        "con_change": 0,
        "fake_effect": {
          "desc": "被标记为猎物，后续每次行动污染+5",
          "con_penalty_per_action": 5
        },
        "expose_clue": "13号仓库尸体手上的纸条：「不要相信问路的人」；便利贴字迹与打印体不同",
        "hint": "蓝色工作服实为诱饵实体。"
      },
      {
        "id": "R04",
        "type": "con_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "狮子咆哮时，下一次行动未躲进岗亭并锁门",
        "trigger_chance": 0.4,
        "trigger_when": "在狮子园区时，每次行动判定",
        "desc": "狮子园区在东侧。如果狮子安静，正常巡逻；如果狮子咆哮，必须立刻躲进最近的岗亭并锁门（下一次行动）。",
        "san_change": 0,
        "con_change": 30,
        "hint": "狮子的咆哮意味着「它」在猎食。"
      },
      {
        "id": "R05",
        "type": "con_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "追逐或喂食黑猫",
        "desc": "园区内没有猫。如果看到黑猫，不要追，不要喂，低头走过。",
        "san_change": 0,
        "con_change": 20,
        "hint": "黑猫是未完全转化的实验体。"
      },
      {
        "id": "R06",
        "type": "san_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "错过整点打卡",
        "desc": "每整点必须到中央广场打卡（整点起的1次行动内打卡有效；首次强制打卡为00:00，开局23:00免打卡）。如果错过，下一次打卡需额外消耗1次行动。未打卡则理智-10。",
        "checkin_window_actions": 1,
        "first_checkin": "00:00",
        "san_change": -10,
        "con_change": 0,
        "hint": "打卡是确认你仍然是「你」的仪式。",
        "extra_effect": {
          "missed_checkin_extra_stay_actions": 1,
          "desc": "错过打卡后，下一次打卡需额外消耗1次行动"
        }
      },
      {
        "id": "R07",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "13号仓库（墙面血字）",
        "desc": "白鸽在02:00出现在中央广场。跟随它，它会带你找到「真正的西门」。",
        "san_change": 0,
        "con_change": 0,
        "hint": "白鸽是上一个成功逃离者留下的「标记」。",
        "acquire_area": "warehouse_13"
      },
      {
        "id": "R08",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "监控室（录音机）",
        "desc": "西门在23:00后会「移动」，但每2小时（01:00、03:00、05:00）会回到原位一次，整点起的1次行动内有效。原位的特征是：门把手是冰凉的。",
        "san_change": 0,
        "con_change": 0,
        "hint": "温热的门把手是「它」伪装的陷阱。",
        "acquire_area": "monitor_room"
      },
      {
        "id": "R09",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "在更衣室阅读衣柜纸条",
        "desc": "红色工作服可以打开西门，但穿上后每行动一次污染+8。穿上后最多保留 2 次行动（约 30 分钟），超时未脱则同化。",
        "san_change": 0,
        "con_change": 0,
        "hint": "红色工作服是饲养员的制服，穿着它意味着加入它们。",
        "acquire_area": "locker_room"
      },
      {
        "id": "R10",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "在岗亭阅读日记",
        "desc": "如果园区停电，所有声控规则失效。此时唯一安全的光源是「应急手电筒」。黑暗中每行动一次理智-5。",
        "san_change": 0,
        "con_change": 0,
        "hint": "停电时，光是你唯一的保护。"
      },
      {
        "id": "R11",
        "type": "con_penalty",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "红衣服巡逻员工主动朝你走来时未立即避开",
        "acquire_location": "monitor_room",
        "acquire_desc": "在监控室屏幕中可以看到红衣服员工拖走「睡着的人」",
        "desc": "巡逻的红衣服员工不会检查证件，也不要求你帮忙。但如果他们主动朝你走来，立刻避开——他们在「补充库存」。",
        "san_change": 0,
        "con_change": 15,
        "hint": "红衣服员工是被完全同化的保安。",
        "acquire_area": "monitor_room"
      }
    ],
    "items": [
      {
        "id": "flashlight",
        "name": "应急手电筒",
        "location": "sentry_box",
        "effect": "照亮黑暗区域，避免停电时额外理智损失",
        "negative": "电池只够3次行动",
        "is_consumable": true,
        "charges": 3
      },
      {
        "id": "diary",
        "name": "保安日记",
        "location": "sentry_box",
        "effect": "记载了停电时的应对方法",
        "carrier_rule": "R10",
        "negative": "无",
        "is_consumable": false
      },
      {
        "id": "pigeon_feather",
        "name": "鸽子羽毛",
        "location": "event_reward",
        "effect": "通关必需（正道）。白鸽留下的标记，可以稳定西门的位置",
        "negative": "无",
        "is_consumable": false
      },
      {
        "id": "gray_uniform",
        "name": "灰色制服",
        "location": "locker_room",
        "effect": "替换变色后的制服，污染-30",
        "effect_structured": {
          "con_reduce": 30,
          "max_per_game": 1,
          "note": "每局限用一次"
        },
        "negative": "无",
        "is_consumable": false,
        "trigger_note": "污染达到50时身上的保安制服会「变色」（叙事信号），此时替换灰色制服效果最佳"
      },
      {
        "id": "red_uniform",
        "name": "红色工作服",
        "location": "warehouse_13",
        "effect": "可打开西门（诡道通关）",
        "negative": "每行动污染+8，最多保留2次行动（约30分钟），超时即同化",
        "is_consumable": false,
        "carry_rule": "未穿着时可随身携带，不产生污染；穿上/脱下各计1次行动；仅穿着状态计污染与时长；到西门前再穿上即可（仓库到西门需3次移动，穿着走不到）。配合回归窗口开门时：在窗口前一次行动穿上（如02:45），窗口所在步（如03:00）开门，累计穿着恰为2次行动",
        "wear_effect": {
          "con_penalty_per_action": 8,
          "duration_limit_actions": 2,
          "timeout_result": "lose_assimilation",
          "desc": "穿上后每行动一次污染+8，最多保留2次行动（约30分钟），超时未脱下即被同化"
        }
      },
      {
        "id": "monitor_key",
        "name": "监控室钥匙",
        "location": "central_plaza",
        "effect": "进入监控室",
        "negative": "无",
        "is_consumable": false,
        "hidden": true,
        "hidden_location": "打卡机下方"
      },
      {
        "id": "password_note",
        "name": "密码纸条",
        "location": "rabbit_zone",
        "effect": "监控室电脑的密码",
        "negative": "获取过程需面对兔子低语，理智-10",
        "is_consumable": false
      },
      {
        "id": "usb_drive",
        "name": "U盘",
        "location": "lion_zone",
        "effect": "监控室电脑需要U盘才能定位西门",
        "negative": "拾取时若狮子咆哮则污染+30",
        "is_consumable": false
      },
      {
        "id": "mineral_water",
        "name": "矿泉水",
        "location": "central_plaza",
        "effect": "恢复5点理智",
        "negative": "贩卖机其他饮料触碰即污染+15",
        "is_consumable": true,
        "acquire_note": "从中央广场贩卖机获取；只选矿泉水，其他饮料触碰即污染+15",
        "usage_limit": {
          "max_per_game": 2,
          "note": "贩卖机内仅有2瓶矿泉水，不可补货"
        }
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
    ],
    "win_check_note": "多条路径同时满足时，按 win_conditions 数组顺序取第一个满足的路径",
    "rule_acquire_note": "散落规则获取：绑定carrier_rule物品的需执行「阅读」（计1次行动）；仅标注trigger地点的规则，进入对应区域即自动习得（不计行动）",
    "win_conditions": [
      {
        "path": "正道",
        "name": "白鸽引路",
        "conditions": {
          "time_before": "06:00",
          "location": "west_gate",
          "items_required": [
            "pigeon_feather"
          ],
          "san_min": 1,
          "con_max": 99
        }
      },
      {
        "path": "险道",
        "name": "监控室密码",
        "conditions": {
          "time_before": "06:00",
          "location": "west_gate",
          "items_required": [
            "password_note",
            "usb_drive"
          ],
          "flags_required": [
            "used_monitor_computer"
          ],
          "san_min": 1,
          "con_max": 99
        }
      },
      {
        "path": "诡道",
        "name": "伪装员工",
        "conditions": {
          "time_before": "06:00",
          "location": "west_gate",
          "items_required": [
            "red_uniform"
          ],
          "flags_required": [
            "wore_red_uniform_within_limit"
          ],
          "san_min": 1,
          "con_max": 99
        }
      }
    ],
    "lose_conditions": [
      {
        "type": "san_zero",
        "desc": "精神崩溃",
        "narrative": "你坐在长椅上，对着兔子园区傻笑。你成为了园区的一部分。"
      },
      {
        "type": "con_full",
        "desc": "被同化",
        "narrative": "你感到皮肤开始长出毛发，视野变得模糊。你成为了下一任「白班保安」。"
      },
      {
        "type": "timeout",
        "time": "06:00",
        "desc": "时间耗尽",
        "narrative": "天亮了，但你已经不是你了。"
      },
      {
        "type": "instant_death",
        "rule_id": "R01",
        "desc": "进入海洋馆",
        "narrative": "你推开了海洋馆的门。里面没有水，没有鱼，只有无数双眼睛在黑暗中注视着你。"
      },
      {
        "type": "duration_exceeded",
        "item_id": "red_uniform",
        "desc": "红色工作服超时",
        "narrative": "你感到工作服与皮肤融为一体，再也无法脱下。"
      },
      {
        "type": "instant_death",
        "event_id": "E02",
        "desc": "暴动期间进入兔子园区或狮子园区",
        "narrative": "黑暗中无数双眼睛同时转向你。你成了暴动动物们的「新玩具」。"
      },
      {
        "type": "instant_death",
        "event_id": "E05",
        "desc": "相信广播前往「海洋馆」",
        "narrative": "你跟着广播的指引找到了「海洋馆」的入口。门后没有水，只有一张写着你名字的门票。"
      }
    ],
    "lose_condition_note": "所有 type=instant_death 或 countdown_death 的规则与事件效果均默认触发失败结算；lose_conditions 列表为各死因提供定制文案，未列出的由引擎使用通用文案。"
  },
  abandoned_hospital: {
    "id": "abandoned_hospital",
    "name": "废弃医院档案室",
    "theme": "悬疑",
    "background": "你是一名调查记者，收到匿名信称「仁和医院」在进行非法人体实验，证据藏在7号病房的病历本中。你深夜潜入医院，大门在你身后自动锁死。你必须在天亮（06:30）前找到病历本，并从消防通道逃离。但这家医院……似乎还有「病人」在走动。",
    "hidden_truth": "匿名信是「它」写的，目的是引诱活人进入医院补充「病历」。7号病房不是病房，是「转化室」。那些「病历本」其实是被困灵魂的档案。你带走的蓝色病历本，是最后一个空位——现在，它上面写上了你的名字。",
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
        "items": [
          "candy",
          "expired_badge"
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
        "items": [
          "emergency_pen"
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
        "items": [
          "stair_note",
          "lighter"
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
        "items": [
          "cotton"
        ],
        "danger_level": 2,
        "npc": {
          "type": "nurse",
          "default_pose": "背对",
          "facing_rule": "R01",
          "facing_trigger": "E02事件触发时、red_key的aftermath生效后、或诡道工牌验证失败后"
        }
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
        "items": [],
        "danger_level": 2
      },
      {
        "id": "nurse_station_3f",
        "name": "3楼护士站",
        "desc": "护士背对你时，可以获取红色钥匙。但获取后护士会「记住你」。",
        "connections": [
          "floor_3"
        ],
        "items": [
          "red_key"
        ],
        "danger_level": 3,
        "npc": {
          "type": "nurse",
          "default_pose": "背对",
          "facing_rule": "R01",
          "facing_trigger": "E02事件触发时、red_key的aftermath生效后、或诡道工牌验证失败后"
        }
      },
      {
        "id": "east_corridor_3f",
        "name": "3楼东侧走廊",
        "desc": "只有6间病房。第7间病房（隐藏门）在数完6间后，再推一扇墙壁。",
        "connections": [
          "floor_3",
          "room_7"
        ],
        "items": [],
        "danger_level": 2
      },
      {
        "id": "room_7",
        "name": "7号病房",
        "desc": "隐藏房间。病床上放着蓝色病历本。房间角落有一面碎裂的镜子。",
        "connections": [
          "east_corridor_3f"
        ],
        "items": [
          "blue_medical_record"
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
        "items": [
          "red_medical_record"
        ],
        "danger_level": 5,
        "requirement": "red_key"
      },
      {
        "id": "locker_room",
        "name": "更衣室",
        "desc": "医生更衣室。有白大褂和医生日记。",
        "connections": [
          "lobby"
        ],
        "items": [
          "white_coat",
          "doctor_diary"
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
        "items": [],
        "danger_level": 0
      }
    ],
    "rules": [
      {
        "id": "R01",
        "type": "san_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "护士面对你时靠近或说话",
        "desc": "护士站有人值班。如果值班护士背对你，可以询问信息。如果她面对你，不要说话、不要靠近。",
        "san_change": -20,
        "con_change": 0,
        "hint": "护士的「面对」意味着她已注意到你。"
      },
      {
        "id": "R02",
        "type": "con_penalty",
        "source": "基础手册",
        "is_fake": true,
        "trigger": "灯亮无人时站在原地不动直到灯灭",
        "desc": "走廊的灯是声控的。如果灯亮了但你确定附近没有人，站在原地不要动，直到灯灭。",
        "san_change": 0,
        "con_change": 0,
        "fake_effect": {
          "desc": "在亮灯无人的区域每停留一次行动，污染+5，直到离开",
          "con_penalty_per_action": 5
        },
        "expose_clue": "楼梯间尸体保持站立不动姿势；尸体旁墙面刻字（散落规则R11）写明正确做法「灯亮无人，立刻离开」；且假规则写在泛黄便利贴上，与塑封打印的员工守则纸质不同",
        "hint": "原地不动是前受害者的死亡姿势。"
      },
      {
        "id": "R03",
        "type": "instant_death",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "电梯显示5楼或B2并出去",
        "desc": "医院只有4层楼。如果电梯显示5楼或B2，不要出去，立刻按1楼。",
        "san_change": 0,
        "con_change": 0,
        "hint": "不存在的楼层是「它」的领地。"
      },
      {
        "id": "R04",
        "type": "instant_death",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "无红色钥匙进入太平间",
        "desc": "太平间在地下一层。不要去，除非你有红色钥匙。无钥匙进入即死。",
        "san_change": 0,
        "con_change": 0,
        "hint": "太平间是「转化」的起点。"
      },
      {
        "id": "R05",
        "type": "san_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "听到婴儿哭声后，下一次行动未用棉花塞耳",
        "trigger_chance": 0.4,
        "trigger_when": "在3楼病房区（floor_3、east_corridor_3f）时，每次行动判定",
        "cry_source": "floor_3",
        "desc": "如果听到婴儿哭声，用棉花塞住耳朵（棉花在护士站抽屉）。哭声响起后，下一次行动必须用棉花塞耳，否则理智-30。",
        "san_change": -30,
        "con_change": 0,
        "hint": "哭声是未出生实验体的呼唤。"
      },
      {
        "id": "R06",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "3楼走廊血字",
        "desc": "7号病房在3楼东侧。但3楼东侧只有6间病房。找到第7间的方法是：数到第6间后，再推一扇门（墙壁）。",
        "san_change": 0,
        "con_change": 0,
        "hint": "空间在这里折叠了。",
        "acquire_area": "floor_3"
      },
      {
        "id": "R07",
        "type": "instant_death",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "阅读红色病历本",
        "desc": "红色病历本是陷阱。如果拿到红色病历本，立刻放回原处，不要阅读。阅读即死。",
        "san_change": 0,
        "con_change": 0,
        "hint": "红色代表「已转化」。",
        "acquire_area": "b1"
      },
      {
        "id": "R08",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "更衣室医生日记",
        "desc": "护士会验证医生的工牌。伪造工牌的方法：在导诊台找到过期的工牌，用电梯里的应急笔修改日期。",
        "san_change": 0,
        "con_change": 0,
        "hint": "欺骗护士是高风险高回报的捷径。",
        "interaction": {
          "location": "nurse_station_3f",
          "requires_items": [
            "white_coat",
            "expired_badge"
          ],
          "required_flag": "badge_forged",
          "result_flag": "fooled_nurse",
          "desc": "穿着白大褂，在3楼护士站出示用应急笔修改过日期的工牌；验证通过则护士带你去7号病房",
          "nurse_pose_rule": "出示工牌时护士会转身检查——因为你「是医生」，此次转身不触发R01惩罚；若验证失败，护士永久进入面对状态"
        }
      },
      {
        "id": "R09",
        "type": "instant_death",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "踩楼梯间第14级台阶",
        "desc": "电梯在03:00-04:00会故障，此时只能走楼梯。但楼梯在03:00后会出现额外台阶，不要踩第14级。踩了即死。",
        "san_change": 0,
        "con_change": 0,
        "hint": "13级之后，是「它」的领地。"
      },
      {
        "id": "R10",
        "type": "con_penalty",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "触碰温热的消防通道门把手",
        "desc": "消防通道的门把手是冰凉的。如果是温热的，那不是出口，是「它」的陷阱。触碰温热把手则污染+25。",
        "san_change": 0,
        "con_change": 25,
        "hint": "温度是辨别真伪的关键。",
        "handle_state": {
          "cold_when": "玩家持有蓝色病历本（E05变红过渡期内仍视为持有，把手保持冰凉直至超时结算）",
          "warm_when": "玩家未持有蓝色病历本",
          "note": "把手温度由是否持有蓝色病历本决定；未持有时推门触发 fake_penalty（回环到大厅+污染25）",
          "fake_penalty": {
            "con_change": 25,
            "move_to": "lobby",
            "desc": "温热把手是陷阱：推门后走廊在你身后折叠，你发现自己回到了1楼大厅——污染+25"
          }
        },
        "acquire_area": "lobby"
      },
      {
        "id": "R11",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "楼梯间墙面刻字（尸体旁）",
        "desc": "声控灯亮起但附近无人时，立刻离开该区域——站在原地的是上一个受害者。",
        "san_change": 0,
        "con_change": 0,
        "hint": "揭穿假规则R02的关键。",
        "acquire_area": "stairwell"
      }
    ],
    "items": [
      {
        "id": "cotton",
        "name": "棉花",
        "location": "nurse_station_1f",
        "effect": "塞耳防哭声，避免理智下降",
        "negative": "无",
        "is_consumable": true,
        "charges": 3,
        "charges_note": "每塞耳一次消耗1次使用次数，共3次（应对哭声多次触发与E04双重哭声）"
      },
      {
        "id": "stair_note",
        "name": "台阶下的纸条",
        "location": "stairwell",
        "effect": "记载着电梯故障时段与第14级台阶的警告",
        "carrier_rule": "R09",
        "negative": "无",
        "is_consumable": false
      },
      {
        "id": "doctor_diary",
        "name": "医生日记",
        "location": "locker_room",
        "effect": "记载着伪造工牌的方法",
        "carrier_rule": "R08",
        "negative": "无",
        "is_consumable": false
      },
      {
        "id": "red_key",
        "name": "红色钥匙",
        "location": "nurse_station_3f",
        "effect": "进入太平间",
        "negative": "获得钥匙后，护士会「记住你」，后续面对你时直接攻击",
        "is_consumable": false,
        "aftermath": {
          "nurse_remembers": true,
          "facing_san_penalty": -30,
          "desc": "获得钥匙后护士会「记住你」：之后她面对你时，理智惩罚从-20提高到-30"
        }
      },
      {
        "id": "blue_medical_record",
        "name": "蓝色病历本",
        "location": "room_7",
        "effect": "通关必需（正道）",
        "negative": "无",
        "is_consumable": false
      },
      {
        "id": "red_medical_record",
        "name": "红色病历本",
        "location": "b1",
        "effect": "无",
        "negative": "阅读即死",
        "is_consumable": false
      },
      {
        "id": "white_coat",
        "name": "白大褂",
        "location": "locker_room",
        "effect": "伪装医生（诡道）",
        "negative": "无",
        "is_consumable": false
      },
      {
        "id": "expired_badge",
        "name": "过期工牌",
        "location": "lobby",
        "effect": "修改后欺骗护士",
        "negative": "修改需要应急笔，取笔时电梯可能故障",
        "is_consumable": false,
        "combine_with": "emergency_pen",
        "combined_flag": "badge_forged",
        "combine_desc": "用应急笔修改日期后成为伪造工牌（badge_forged），用于诡道欺骗护士"
      },
      {
        "id": "emergency_pen",
        "name": "应急笔",
        "location": "elevator",
        "effect": "修改工牌日期",
        "negative": "取笔时若电梯故障则被困，损失1次行动",
        "is_consumable": false
      },
      {
        "id": "lighter",
        "name": "打火机",
        "location": "stairwell",
        "effect": "照亮黑暗",
        "negative": "可能触发烟雾报警，引来护士",
        "is_consumable": true
      },
      {
        "id": "candy",
        "name": "糖果",
        "location": "lobby",
        "effect": "氛围道具，无实际作用",
        "negative": "无",
        "is_consumable": true
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
    ],
    "win_conditions": [
      {
        "path": "正道",
        "name": "解谜路线",
        "conditions": {
          "time_before": "06:30",
          "location": "fire_exit",
          "items_required": [
            "blue_medical_record"
          ],
          "san_min": 1,
          "con_max": 99
        }
      },
      {
        "path": "险道",
        "name": "太平间捷径",
        "conditions": {
          "time_before": "06:30",
          "location": "fire_exit",
          "items_required": [
            "blue_medical_record"
          ],
          "flags_required": [
            "used_b1_secret_passage"
          ],
          "san_min": 1,
          "con_max": 99
        }
      },
      {
        "path": "诡道",
        "name": "欺骗护士",
        "conditions": {
          "time_before": "06:30",
          "location": "fire_exit",
          "items_required": [
            "blue_medical_record",
            "white_coat",
            "expired_badge",
            "emergency_pen"
          ],
          "flags_required": [
            "fooled_nurse"
          ],
          "san_min": 1,
          "con_max": 99,
          "note": "护士带路直达7号病房取得蓝色病历本，之后仍需从消防通道逃离"
        }
      }
    ],
    "lose_conditions": [
      {
        "type": "san_zero",
        "desc": "精神崩溃",
        "narrative": "你成为了医院的「新病人」，永远留在了7号病房。"
      },
      {
        "type": "con_full",
        "desc": "被同化",
        "narrative": "你感到身体变得透明，成为了病历本上的一行字。"
      },
      {
        "type": "timeout",
        "time": "06:30",
        "desc": "时间耗尽",
        "narrative": "天亮了，医院恢复正常，但你被发现死在了走廊上。"
      },
      {
        "type": "instant_death",
        "rule_id": "R07",
        "desc": "阅读红色病历本",
        "narrative": "你打开了红色病历本，里面是你的照片和今天的日期。"
      },
      {
        "type": "instant_death",
        "rule_id": "R09",
        "desc": "踩第14级台阶",
        "narrative": "你踩上了第14级台阶，脚下的楼梯变成了无尽的深渊。"
      },
      {
        "type": "instant_death",
        "rule_id": "R03",
        "desc": "在5楼或B2走出电梯",
        "narrative": "电梯门在你身后合上。这一层没有病房，只有无数个「你」安静地躺在病床上。"
      },
      {
        "type": "instant_death",
        "rule_id": "R04",
        "desc": "无红色钥匙进入太平间",
        "narrative": "太平间的抽屉一格一格弹开。空着的那一格，正好是你的尺寸。"
      }
    ],
    "lose_condition_note": "所有 type=instant_death 或 countdown_death 的规则与事件效果均默认触发失败结算；lose_conditions 列表为各死因提供定制文案，未列出的由引擎使用通用文案。",
    "win_check_note": "多条路径同时满足时，按 win_conditions 数组顺序取第一个满足的路径",
    "rule_acquire_note": "散落规则获取：绑定carrier_rule物品的需执行「阅读」（计1次行动）；仅标注trigger地点的规则，进入对应区域即自动习得（不计行动）"
  },
  infinite_corridor: {
    "id": "infinite_corridor",
    "name": "无限回廊公寓",
    "theme": "都市怪谈",
    "background": "你搬进了一栋租金异常便宜的公寓。入住第一晚，你发现电梯按钮有13楼、B1、甚至还有3.5楼。每层走廊都贴着前住户留下的规则纸条。更诡异的是，你明明住在4楼，但走廊里根本没有404房间——只有403和405。你必须找到真正的「出口」——但出口可能不在楼下。",
    "hidden_truth": "这栋公寓是一个「空间褶皱」。所有住户都是被困在时间里的人。404是「观测点」，405是「坍缩点」。你以为你逃到了B1，但B1的门外，是另一栋一模一样的公寓。白猫是上一个成功「逃离」的住户变的——它不是在帮你，而是在找替死鬼。",
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
        "items": [
          "hammer",
          "password_fragment_c"
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
        "items": [],
        "danger_level": 2,
        "note": "可进入但无实质内容：房内空无一人，镜子里却映出两个人影",
        "enter_penalty": {
          "san_change": -5,
          "once": true,
          "desc": "首次进入理智-5（好奇心税），之后再进无影响"
        }
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
        "items": [],
        "danger_level": 1,
        "password_terminal": {
          "requires_items": [
            "password_fragment_a",
            "password_fragment_b",
            "password_fragment_c"
          ],
          "result_flag": "correct_elevator_password",
          "desc": "集齐三块密码碎片后在电梯间拼出完整密码（无需玩家输入具体内容），随后乘电梯直达B1"
        }
      },
      {
        "id": "floor_3_corridor",
        "name": "3楼走廊",
        "desc": "看似正常的走廊。墙上贴着一张黄色便签。消防栓在滴水。",
        "connections": [
          "elevator_hall",
          "stairwell"
        ],
        "items": [],
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
        "items": [
          "password_fragment_a"
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
        "items": [
          "cat_bell"
        ],
        "danger_level": 0,
        "access_note": "电梯13楼按钮是陷阱，必须走楼梯"
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
        "items": [],
        "danger_level": 1
      },
      {
        "id": "floor_b1",
        "name": "B1",
        "desc": "门口铭牌写着「B1=1楼」。一扇锁着的门，需要白猫铃铛才能打开。",
        "connections": [
          "elevator_hall"
        ],
        "items": [],
        "danger_level": 0
      },
      {
        "id": "floor_3_5",
        "name": "3.5楼",
        "desc": "异常楼层。走廊很短，墙上全是规则纸条，但全是假的。",
        "connections": [
          "elevator_hall"
        ],
        "items": [
          "password_fragment_b"
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
        "items": [
          "room_404_key"
        ],
        "danger_level": 0,
        "special": "位置漂移的安全区",
        "drift": {
          "interval_minutes": 120,
          "locate_method": "消防栓滴水旁的那扇门",
          "initial_location": "floor_3_corridor",
          "candidates": [
            "floor_3_corridor",
            "floor_4_corridor"
          ],
          "candidate_rule": "仅漂移到当前消防栓滴水的楼层（5楼消防栓干燥，永远不是漂移目的地）",
          "while_occupied": "玩家在404内时，漂移延迟至其离开后触发",
          "san_recover": 10,
          "san_recover_limit": "每个漂移位置仅首次进入恢复理智（防止反复进出刷理智）"
        }
      },
      {
        "id": "room_405",
        "name": "405房间",
        "desc": "禁区。进入触发「坍缩」倒计时（限3次行动）。内部有观测窗。",
        "connections": [
          "floor_4_corridor"
        ],
        "items": [],
        "danger_level": 5,
        "special": "禁区，进入触发坍缩倒计时",
        "countdown_actions": 3,
        "escape_feature": "观测窗（从内部打破可逃离，需要锤子）",
        "action_budget": {
          "total": 3,
          "breakdown": "进入405的行动本身不计入倒计时；进入后搜索/破窗/逃出各计1次行动；第3次行动结束时若未逃出则触发countdown_death",
          "note": "破窗需要锤子；持锤直接破窗+逃出仅需2次行动，余1次机动"
        }
      }
    ],
    "rules": [
      {
        "id": "R01",
        "type": "instant_death",
        "source": "基础手册",
        "is_fake": true,
        "trigger": "按电梯13楼按钮",
        "desc": "电梯里没有13楼按钮。如果看到13楼按钮，按13楼，那是天台，白猫在那里。",
        "san_change": 0,
        "con_change": 0,
        "fake_effect": "到达不存在的楼层，即死",
        "expose_clue": "楼梯间尸体手里攥着13楼电梯按钮碎片；3楼黄色便签：「电梯13楼是陷阱，白猫在天台，走楼梯」",
        "hint": "13楼按钮是「它」的诱饵。"
      },
      {
        "id": "R02",
        "type": "con_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "在消防栓干燥的楼层停留",
        "desc": "每层走廊尽头有消防栓。如果消防栓在滴水，这层是安全的。如果干燥，立刻进电梯离开。",
        "san_change": 0,
        "con_change": 10,
        "hint": "消防栓滴水意味着空间稳定。"
      },
      {
        "id": "R03",
        "type": "san_penalty",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "回应或对视没有影子的邻居",
        "trigger_chance": 0.3,
        "trigger_when": "在走廊区域移动时，每次行动判定（携带锤子则概率+0.2，见hammer的risk_modifier）",
        "penalty_note": "走廊偶遇时回应：理智-20（本条）；E01敲门事件中回应（开门直视）：理智-30，事件惩罚优先",
        "desc": "遇到邻居可以打招呼。但如果邻居没有影子，不要回应、不要对视。",
        "san_change": -20,
        "con_change": 0,
        "hint": "没有影子的邻居是「它」的投影。"
      },
      {
        "id": "R04",
        "type": "countdown_death",
        "source": "基础手册",
        "is_fake": false,
        "trigger": "进入405房间后，除进入行动外限3次行动内未逃出",
        "budget_note": "进入不计入倒计时；破窗1次、逃出1次，余1次机动（见room_405.action_budget）",
        "countdown_actions": 3,
        "desc": "你的房间号是404。如果看到405，不要进去，那是「它」的房间。",
        "truth": "手册宣称的「进入即死」实为夸大威慑：进入405会触发坍缩倒计时（限3次行动），时间内找到内部出口（用锤子打破观测窗）即可存活——这是诡道通关的核心，纸条R08揭示此真相。",
        "san_change": 0,
        "con_change": 0,
        "hint": "405是坍缩点，但也是「它」唯一关不住你的地方。"
      },
      {
        "id": "R05",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "3楼走廊黄色便签",
        "desc": "电梯里的13楼按钮是陷阱。白猫在13楼天台，但必须走楼梯。",
        "san_change": 0,
        "con_change": 0,
        "hint": "揭穿假规则1的关键线索。",
        "acquire_area": "floor_3_corridor"
      },
      {
        "id": "R06",
        "type": "hint",
        "source": "散落规则",
        "is_fake": true,
        "trigger": "3.5楼墙壁白色A4纸条",
        "desc": "B1是地下室，不要去。",
        "san_change": 0,
        "con_change": 0,
        "fake_effect": "阻止玩家找到真正出口",
        "expose_clue": "B1门口铭牌：「B1=1楼」",
        "hint": "3.5楼的所有规则都是反向的。",
        "acquire_area": "floor_3_5"
      },
      {
        "id": "R07",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "13楼天台白猫旁刻字",
        "desc": "跟随白猫时，如果它突然停下并炸毛，说明前方有危险，不要继续前进。白猫每隔一段时间会消失一次行动，之后自行现身。",
        "san_change": 0,
        "con_change": 0,
        "hint": "白猫不是完全可信的。",
        "acquire_area": "floor_13"
      },
      {
        "id": "R08",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "405门缝纸条（与密码碎片C同处，拾取碎片C时一并获得）",
        "desc": "405房间内部有「观测窗」，从内部可以看到公寓的真实结构。打破窗户可以逃离，但玻璃不是赤手空拳能打破的——你需要工具。进入后限3次行动内完成。",
        "san_change": 0,
        "con_change": 0,
        "hint": "诡道通关的核心线索。",
        "acquire_note": "与密码碎片C绑定获取：拾取碎片C（1次行动，理智-5窥视坍缩）时一并发掘门缝下的纸条",
        "acquire_item": "password_fragment_c"
      },
      {
        "id": "R09",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "楼梯间4楼到5楼之间涂鸦",
        "desc": "404房间会漂移。找到它的方法是：看走廊的消防栓，滴水的消防栓旁边那扇门就是404。",
        "san_change": 0,
        "con_change": 0,
        "hint": "安全区不是固定的。",
        "acquire_area": "stairwell"
      },
      {
        "id": "R10",
        "type": "hint",
        "source": "散落规则",
        "is_fake": false,
        "trigger": "B1门口铭牌",
        "desc": "B1就是1楼。但门需要「白猫铃铛」才能打开。铃铛在白猫身上，白猫只在整点的行动步允许你靠近（可取得铃铛）。",
        "san_change": 0,
        "con_change": 0,
        "hint": "正道通关的最终步骤。",
        "note": "白猫铃铛仅约束步行到达B1时的开门；用电梯密码直达B1时，电梯门开即是出口，无需铃铛（险道）",
        "acquire_area": "floor_b1"
      }
    ],
    "items": [
      {
        "id": "cat_bell",
        "name": "白猫铃铛",
        "location": "floor_13",
        "effect": "打开B1出口的门（正道通关）",
        "negative": "无",
        "is_consumable": false,
        "acquire_condition": "整点时白猫允许靠近"
      },
      {
        "id": "room_404_key",
        "name": "404钥匙",
        "location": "room_404",
        "effect": "持有后可直接开启漂移后的404房门（首次发现404时在房内拾取）",
        "negative": "首次寻找404仍需通过消防栓滴水定位",
        "is_consumable": false
      },
      {
        "id": "password_fragment_a",
        "name": "密码碎片A",
        "location": "floor_5_corridor",
        "effect": "电梯密码的一部分",
        "negative": "位于干燥消防栓的不安全楼层，停留拾取将触发R02的污染惩罚（-10，不重复计）",
        "is_consumable": false
      },
      {
        "id": "password_fragment_b",
        "name": "密码碎片B",
        "location": "floor_3_5",
        "effect": "电梯密码的一部分",
        "negative": "3.5楼假规则多，容易中招",
        "is_consumable": false
      },
      {
        "id": "password_fragment_c",
        "name": "密码碎片C",
        "location": "floor_4_corridor",
        "effect": "电梯密码的一部分",
        "negative": "需贴近405门缝拾取，窥视坍缩：理智-5",
        "is_consumable": false
      },
      {
        "id": "hammer",
        "name": "锤子",
        "location": "floor_4_corridor",
        "effect": "可以从内部打破405窗户（诡道）",
        "negative": "携带锤子时，邻居会「注意到你」，增加遭遇无影邻居的概率",
        "is_consumable": false,
        "risk_modifier": {
          "shadow_neighbor_encounter_bonus": 0.2,
          "desc": "携带锤子时遭遇无影邻居的概率+20%"
        }
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
          "invert_rule": "翻转目标规则的is_fake状态与文本表述，惩罚数值不变；已被玩家识破（rules_exposed）的规则免疫；玩家需重新判断"
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
    ],
    "win_conditions": [
      {
        "path": "正道",
        "name": "白猫引路",
        "conditions": {
          "location": "floor_b1",
          "items_required": [
            "cat_bell"
          ],
          "san_min": 1,
          "con_max": 99
        }
      },
      {
        "path": "险道",
        "name": "电梯密码",
        "conditions": {
          "location": "floor_b1",
          "items_required": [
            "password_fragment_a",
            "password_fragment_b",
            "password_fragment_c"
          ],
          "flags_required": [
            "correct_elevator_password"
          ],
          "san_min": 1,
          "con_max": 99,
          "note": "电梯密码直达B1时电梯门开即是出口，无需白猫铃铛（R10仅约束步行到达）"
        }
      },
      {
        "path": "诡道",
        "name": "405内部突破",
        "conditions": {
          "location": "outside",
          "flags_required": [
            "entered_405",
            "broke_window_from_inside"
          ],
          "items_required": [
            "hammer"
          ],
          "san_min": 1,
          "con_max": 99
        }
      }
    ],
    "virtual_locations": {
      "outside": "公寓外的真实世界（诡道通关终点，非区域图节点）"
    },
    "win_check_note": "多条路径同时满足时，按 win_conditions 数组顺序取第一个满足的路径",
    "rule_acquire_note": "散落规则获取：绑定carrier_rule物品的需执行「阅读」（计1次行动）；仅标注trigger地点的规则，进入对应区域即自动习得（不计行动）",
    "lose_conditions": [
      {
        "type": "san_zero",
        "desc": "精神崩溃",
        "narrative": "你接受了这里，成为了新的「住户」，永远留在了404房间。"
      },
      {
        "type": "con_full",
        "desc": "被同化",
        "narrative": "你感到身体开始透明化，成为了公寓规则的一部分。"
      },
      {
        "type": "timeout",
        "time": "06:00",
        "desc": "时间耗尽",
        "narrative": "天亮了，但你发现窗外还是走廊。"
      },
      {
        "type": "instant_death",
        "rule_id": "R01",
        "desc": "按电梯13楼按钮",
        "narrative": "电梯门打开，外面是一片虚无。你走了出去，再也没有回来。"
      },
      {
        "type": "countdown_death",
        "rule_id": "R04",
        "desc": "405坍缩倒计时超时",
        "narrative": "倒计时结束，405房间开始坍缩，你成为了空间褶皱的一部分。"
      }
    ],
    "lose_condition_note": "所有 type=instant_death 或 countdown_death 的规则与事件效果均默认触发失败结算；lose_conditions 列表为各死因提供定制文案，未列出的由引擎使用通用文案。"
  },
};

export default scenes;
