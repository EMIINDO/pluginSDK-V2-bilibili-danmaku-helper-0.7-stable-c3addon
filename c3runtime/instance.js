"use strict"

globalThis.C3.Plugins.iDoveHelper_BiliOpen.Instance = class iDoveHelper_BiliOpenInstance extends (globalThis.ISDKInstanceBase) {

    constructor() {
        super(inst)
        this.instance = this
        this.Version = 0.7

        iDoveUtils.Init()

        console.log("欢迎使用独鸽助手，如有困难无法解决，请参阅：")
        console.log(`支持文档：${iDoveUtils.URL("/Document/")}`)
        console.log(`QQ群：${iDoveUtils.URL("/QQun")}`)

        let Rqst = new Request(
            iDoveUtils.URL("/BiliOpenProxy/C3/CheckUpdate"),
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            })
        fetch(Rqst).then(res => {
            res.json().then(jsn => {
                if (jsn.LastVer > this.Version)
                    if (jsn.OutdateVer >= this.Version)
                        console.warn(`[独鸽助手]当前版本：${this.Version}，最新版本：${jsn.LastVer}，最低版本：${jsn.OutdateVer}，您使用的版本已停用，请尽快更新`)
                    else
                        console.warn(`[独鸽助手]当前版本：${this.Version}，最新版本：${jsn.LastVer}，最低版本：${jsn.OutdateVer}，请考虑更新`)
            })
        })

        this.ResetData()
        if (properties) {
            // note properties may be null in some cases
        }
    }

    static RoomData = {}
    static LastData = {}

    QQun() {

    }

    UpdateData(Data) {
        this.LastData = Data
    }

    ResetData() {
        this.LastData = {
            "类型": "",
            "用户": {
                "头像": "",
                "OpenID": "",
                "昵称": "",
                "头像链接": "",
                "舰队状态": 0,
                "粉丝团等级": 0
            },
            "弹幕内容": "",
            "摘要": "",
            "JSON": {},
            "时间戳": 1731059977,
            "时间": "",
            "礼物": {
                "ID": 1,
                "名称": "",
                "数量": 0,
                "电池价值": 0,
                "人民币价值": 0.0,
                "图片": ""
            }
        }
    }

    QuickConnect(AuthCode, LiveRoomID) {
        console.log(`[独鸽助手]快速连接，使用身份码${AuthCode}`)
        this.AdvancedConnect(AuthCode, 0, "", "", LiveRoomID)
    }

    AdvancedConnect(AuthCode, AppID, DeveloperKey, DeveloperSecret, LiveRoomID) {
        let Rqst = new Request(
            AppID === 0 ? iDoveUtils.URL("/BiliOpenProxy/QuickAppStart") : iDoveUtils.URL("/BiliOpenProxy/AppStart"),
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }, body: JSON.stringify({
                    "AuthCode": AuthCode,
                    "LiveRoomID": LiveRoomID,
                    "DeveloperKey": DeveloperKey,
                    "DeveloperSecret": DeveloperSecret,
                    "AppID": AppID
                })
            })
        fetch(Rqst).then(res => {
            res.json().then(jsn => {
                if (jsn.code === 0) {
                    LiveData.RoomData = {
                        "直播间号": jsn.data.anchor_info.room_id,
                        "主播昵称": jsn.data.anchor_info.uname,
                        "主播UID": jsn.data.anchor_info.uid,
                        "主播OpenID": jsn.data.anchor_info.open_id,
                        "主播头像": jsn.data.anchor_info.uface,
                        "会话ID": jsn.data.game_info.game_id,
                        "开发者Key": DeveloperKey
                    }
                    console.info("[独鸽助手]RoomData", LiveData.RoomData)
                    console.log("[独鸽助手]已获得开放平台授权", jsn.data)
                    LiveData.WSAuth = jsn.data.websocket_info.auth_body
                    this.WS = new BiliOpen_WEBSocketClient(LiveData.WSAuth, this)
                    this.Heartbeat()
                    setInterval(this.Heartbeat, 30000)
                    this._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.AppStart)
                }
            })
        })
    }

    Heartbeat() {
        let Rqst = new Request(
            iDoveUtils.URL("/BiliOpenProxy/Heartbeat"),
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }, body: JSON.stringify({
                    "SessionID": LiveData.RoomData.会话ID,
                    "DeveloperKey": LiveData.RoomData.开发者Key
                })
            })
        fetch(Rqst).then(res => {
            res.json().then(jsn => {
                if (jsn.code === 0) {

                }
            })
        })
    }

    _release() {
        super._release()
    }

    _saveToJson() {
        return {}
    }

    _loadFromJson(o) {
    }
}

class BiliOpen_WEBSocketClient extends WebSocket {
    constructor(AuthBody, Parent) {
        super("wss://broadcastlv.chat.bilibili.com:443/sub")
        this.Parent = Parent

        this.onopen = (evt) => {
            this.Login(AuthBody)
        }

        // 长链接收到数据后进行处理
        this.onmessage = (msg) => {
            let WSReader = new FileReader()
            WSReader.onloadend = (rdr) => this.NewPkg(new Uint8Array(rdr.currentTarget.result))
            WSReader.readAsArrayBuffer(msg.data)
        }

        this.onclose = (evt) => {

        }

    }

    Login(AuthBody) {
        let Body = DmkUtils.Str2Uint8Array(AuthBody)
        let PkgLength = 16 + Body.length
        let PkgData = []
        PkgData.push.apply(PkgData, [0, 0, PkgLength / 256, PkgLength % 256, 0, 16, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0])
        PkgData.push.apply(PkgData, Body)
        PkgData = new Uint8Array(PkgData)
        this.send(PkgData)
    }

    HeartBeat() {
        let PkgData = new Uint8Array([0, 0, 0, 16, 0, 16, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0])
        this.send(PkgData)
    }

    NewPkg(Pkg) {
        if (Pkg[7] < 2) {
            switch (Pkg[11]) {
                case 3:
                    break
                case 5:
                    let Jsn = JSON.parse(decode_utf8.decodeUtf8(Pkg.slice(16)))
                    this.NewJSONMsg(Jsn)
                    break
                case 8:
                    this.HeartBeat()
                    setInterval(() => this.HeartBeat(), 30000)
                    break
                default:
                    break;
            }
        }
    }

    NewJSONMsg(Msg) {
        let Data = Msg.data
        switch (Msg.cmd) {
            case "LIVE_OPEN_PLATFORM_LIVE_ROOM_ENTER":
                this.Parent.LastData = {
                    "类型": "进房",
                    "事件ID": Data.msg_id,
                    "用户": {
                        "UID": Data.uid,
                        "OpenID": Data.open_id,
                        "昵称": Data.uname,
                        "头像链接": Data.uface,
                        "舰队状态": -1,
                        "粉丝团等级": -1
                    },
                    "弹幕内容": "",
                    "摘要": `${Data.uname} 进入了直播间`,
                    "JSON": Data,
                    "时间戳": Data.timestamp,
                    "时间": "",
                    "礼物": {
                        "ID": 0,
                        "名称": "",
                        "数量": 0,
                        "电池价值": 0,
                        "人民币价值": 0.0,
                        "图片": ""
                    }
                }
                console.log(`[独鸽助手] ${this.Parent.LastData.摘要}`)
                this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.NewEnter)
                break
            case "LIVE_OPEN_PLATFORM_DM":
                if (!DmkUtils.DanmakuBlackList.has(Msg.data.msg)) {
                    this.Parent.LastData = {
                        "类型": "弹幕",
                        "事件ID": Data.msg_id,
                        "用户": {
                            "UID": Data.uid,
                            "OpenID": Data.open_id,
                            "昵称": Data.uname,
                            "头像链接": Data.uface,
                            "舰队状态": Data.guard_level,
                            "粉丝团等级": Data.fans_medal_wearing_status ? Data.fans_medal_level : 0
                        },
                        "弹幕内容": Data.msg,
                        "摘要": `${Data.uname}：${Data.msg}`,
                        "JSON": Data,
                        "时间戳": Data.timestamp,
                        "时间": "",
                        "礼物": {
                            "ID": 0,
                            "名称": "",
                            "数量": 0,
                            "电池价值": 0,
                            "人民币价值": 0.0,
                            "图片": ""
                        }
                    }
                }
                console.log(`[独鸽助手] ${this.Parent.LastData.摘要}`)
                if (Data.dm_type === 0) this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.NewDanmaku)
                else this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.NewEmojiDanmaku)
                break
            case "LIVE_OPEN_PLATFORM_SEND_GIFT":
                this.Parent.LastData = {
                    "类型": "礼物",
                    "事件ID": Data.msg_id,
                    "用户": {
                        "UID": Data.uid,
                        "OpenID": Data.open_id,
                        "昵称": Data.uname,
                        "头像链接": Data.uface,
                        "舰队状态": Data.guard_level,
                        "粉丝团等级": Data.fans_medal_wearing_status ? Data.fans_medal_level : 0
                    },
                    "弹幕内容": Data.msg,
                    "摘要": `${Data.uname} 送了 ${Data.gift_num} 个 ${Data.gift_name}`,
                    "JSON": Data,
                    "时间戳": Data.timestamp,
                    "时间": "",
                    "礼物": {
                        "ID": Data.gift_id,
                        "名称": Data.gift_name,
                        "数量": Data.gift_num,
                        "电池价值": Data.paid ? Data.price * Data.gift_num / 100 : 0,
                        "人民币价值": Data.paid ? Data.price * Data.gift_num / 1000 : 0,
                        "图片": Data.gift_icon
                    }
                }
                console.log(`[独鸽助手] ${this.Parent.LastData.摘要}`)
                this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.NewGift)
                break
            case "LIVE_OPEN_PLATFORM_LIKE":
                this.Parent.LastData = {
                    "类型": "进房",
                    "事件ID": Data.msg_id,
                    "用户": {
                        "UID": Data.uid,
                        "OpenID": Data.open_id,
                        "昵称": Data.uname,
                        "头像链接": Data.uface,
                        "舰队状态": -1,
                        "粉丝团等级": -1
                    },
                    "弹幕内容": "",
                    "摘要": `${Data.uname} 为直播点赞`,
                    "JSON": Data,
                    "时间戳": Data.timestamp,
                    "时间": "",
                    "礼物": {
                        "ID": 0,
                        "名称": "",
                        "数量": 0,
                        "电池价值": 0,
                        "人民币价值": 0.0,
                        "图片": ""
                    }
                }
                console.log(`[独鸽助手] ${this.Parent.LastData.摘要}`)
                this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.NewLike)
                break
            case "LIVE_OPEN_PLATFORM_INTERACTION_END":
                if (Data.game_id === LiveData.RoomData.会话ID) {
                    this.Parent.ResetData()
                    this.Parent.LastData.类型 = "开平断线"
                    this.Parent.LastData.摘要 = "开放平台判定本插件或游戏停止运行，停止下发数据，这可能是心跳没有维持或者浏览器休眠导致的"
                    this.Parent.LastData.JSON = Data
                    this.Parent.LastData.时间戳 = Data.timestamp
                    console.error(`[独鸽助手] ${this.Parent.LastData.摘要}`)
                    this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.SessionClosed)
                }
                break
            case "LIVE_OPEN_PLATFORM_LIVE_START":
                this.Parent.ResetData()
                this.Parent.LastData.类型 = "开播"
                this.Parent.LastData.摘要 = "直播开始"
                this.Parent.LastData.JSON = Data
                this.Parent.LastData.时间戳 = Data.timestamp
                console.log(`[独鸽助手] ${this.Parent.LastData.摘要}`)
                this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.LiveStart)
                break
            case "LIVE_OPEN_PLATFORM_LIVE_END":
                this.Parent.ResetData()
                this.Parent.LastData.类型 = "开播"
                this.Parent.LastData.摘要 = "直播开始"
                this.Parent.LastData.JSON = Data
                this.Parent.LastData.时间戳 = Data.timestamp
                console.log(`[独鸽助手] ${this.Parent.LastData.摘要}`)
                this.Parent._trigger(globalThis.C3.Plugins.iDoveHelper_BiliOpen.Cnds.LiveEnd)
                break
        }
    }
}

class DmkUtils {

    static DanmakuBlackList = new Set(["老板大气！点点红包抽礼物", "老板大气！点点红包抽礼物！", "点点红包，关注主播抽礼物～", "喜欢主播加关注，点点红包抽礼物", "红包抽礼物，开启今日好运！", "中奖喷雾！中奖喷雾！", "前方高能预警，注意这不是演习", "我从未见过如此厚颜无耻之人", "那万一赢了呢", "你们城里人真会玩", "左舷弹幕太薄了", "要优雅，不要污", "我选择狗带"])

    static Uint8Array2HexStr(Uint8Array) {
        return Array.prototype.map.call(Uint8Array, (x) => ('00' + x.toString(16)).slice(-2)).join(' ')
    }

    static Str2Uint8Array(Str) {
        let arr = []
        for (let i = 0, j = Str.length; i < j; ++i) arr.push(Str.charCodeAt(i))
        return new Uint8Array(arr)
    }

    static Timestamp2DateObj(Timestamp) {
        return new Date(Timestamp * 1000)
    }

    static Timestamp2DateStr(Timestamp) {
        return new Date(Timestamp * 1000).toLocaleString()
    }
}


/**
 * UTF-8解码类
 * - decode-utf8
 * - By LinusU
 * - GitHub：https://github.com/LinusU/decode-utf8
 */
class decode_utf8 {
    static toUint8Array(input) {
        if (input instanceof Uint8Array) return input
        if (input instanceof ArrayBuffer) return new Uint8Array(input)
        throw new TypeError('Expected "input" to be an ArrayBuffer or Uint8Array')
    }

    static decodeUtf8(input) {
        const data = decode_utf8.toUint8Array(input)
        const size = data.length
        let result = ''
        for (let index = 0; index < size; index++) {
            let byte1 = data[index]
            // US-ASCII
            if (byte1 < 0x80) {
                result += String.fromCodePoint(byte1)
                continue
            }
            // 2-byte UTF-8
            if ((byte1 & 0xE0) === 0xC0) {
                let byte2 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x1F) << 6) | byte2)
                continue
            }
            if ((byte1 & 0xF0) === 0xE0) {
                let byte2 = (data[++index] & 0x3F)
                let byte3 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3)
                continue
            }
            if ((byte1 & 0xF8) === 0xF0) {
                let byte2 = (data[++index] & 0x3F)
                let byte3 = (data[++index] & 0x3F)
                let byte4 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) | (byte3 << 0x06) | byte4)
            }
        }
        return result
    }
}

class iDoveUtils {

    static Init() {

    }

    static BaseURL = "helper.hz.idove.games:8"

    static URL(Path) {
        return `https://${this.BaseURL}${Path}`
    }

    static TestURL(BaseURL) {

    }

}

class LiveData {
    static RoomData = {}
    static AppStart = {}
}