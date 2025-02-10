"use strict"
{
    globalThis.C3.Plugins.iDoveHelper_BiliOpen.Exps = {
        // 通用信息
        OpenID() {
            return this.LastData.用户.OpenID
        },
        昵称() {
            return this.LastData.用户.昵称
        },
        头像链接() {
            return this.LastData.用户.头像链接
        },
        舰队状态() {
            switch (this.LastData.用户.舰队状态) {
                case 0:
                    return "未上舰"
                case 1:
                    return "总督"
                case 2:
                    return "提督"
                case 3:
                    return "舰长"
                default:
                    return "未知"
            }
        },
        粉丝团等级() {
            return this.LastData.用户.粉丝团等级
        },
        摘要() {
            return this.LastData.摘要
        },
        JSON() {
            return this.LastData
        },
        时间戳() {
            return this.LastData.时间戳
        },
        时间() {
            let date = new Date(this.LastData.时间戳)
            return `${String(date.getFullYear())}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes())}:${String(date.getSeconds()).padStart(2, '0')}`
        },

        // 弹幕特有
        弹幕内容() {
            if (this.LastData.类型 === "弹幕")
                return this.LastData.弹幕内容
            else return ""
        },

        // 礼物特有
        礼物ID() {
            if (this.LastData.类型 === "礼物")
                return this.LastData.礼物.ID
            else return 0
        },
        礼物名称() {
            if (this.LastData.类型 === "礼物")
                return this.LastData.礼物.名称
            else return ""
        },
        礼物数量() {
            if (this.LastData.类型 === "礼物")
                return this.LastData.礼物.数量
            else return 0
        },
        礼物图片() {
            if (this.LastData.类型 === "礼物")
                return this.LastData.礼物.图片
            else return ""
        },
        礼物电池价值() {
            if (this.LastData.类型 === "礼物")
                return this.LastData.礼物.电池价值
            else return 0
        },
        礼物人民币价值() {
            if (this.LastData.类型 === "礼物")
                return this.LastData.礼物.人民币价值
            else return 0
        }
    }
}
